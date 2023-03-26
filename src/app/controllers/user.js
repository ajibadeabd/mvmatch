// Import Mongoose models for User and Account schemas and AccountController
const UserSchema = require("../models/user");
const AccountSchema = require("../models/account");
const AccountController = require("../controllers/account");

// Define UserController class
class UserController {
  // Declare private class properties
  #packages;
  #models;
  #services;

  // Constructor function that injects dependencies
  constructor({ packages, models, services }) {
    this.#packages = packages;
    this.#models = models;
    this.#services = services;
  }

  // Method for logging out user by removing all sessions
  logout = async (userDetails) => {
    try {
      // // Throw error if there are no active sessions for user
      // if (userDetails.sessions.length == 0) throw "No active session";

      // // Update user's sessions to an empty array
      // await this.updateUser(userDetails.id, {
      //   sessions: [],
      // });

      let user = await this.getUser(
        { username: userDetails.username },
        "+password"
      );
      // If no user is found, throw an error
      if (!user) throw "user not found";

      // Compare the provided password with the stored password using bcrypt
      let isPasswordCorrect = await this.#packages.bcrypt.compare(
        userDetails.password,
        user.password
      );

      // If the password is incorrect, throw an error
      if (!isPasswordCorrect) throw "invalid credentials";

      if (user.sessions.length == 0) throw "No active session";

      await this.updateUser(user.id, {
        sessions: [],
      });
      // Return success message
      return {
        status: true,
        message: "User session deleted successfully",
      };
    } catch (error) {
      // Return error message if there was an error in logging out
      return { status: false, message: error };
    }
  };

  // Method for finding user with given filter and include options
  getUser = async (filteredValue, include) => {
    return this.#models.User.findOne(
      {
        ...filteredValue,
      },
      include
    );
  };

  // Method for updating user with given filter and new value
  updateUser = async (filteredValue, newValue) => {
    return this.#models.User.findByIdAndUpdate(filteredValue, newValue, {
      new: true,
    });
  };
  updateUserDetail = async (userDetails, userId) => {
    try {
      // Check if username already exists for another user
      let isUserExist = await this.getUser({ username: userDetails.username });

      // Throw error if username is already taken by another user
      if (isUserExist) {
        let errorMessage =
          userId === isUserExist.id
            ? "Provide a new username to update"
            : "username already taken";
        throw errorMessage;
      }

      // Update user details
      const updatedUser = await this.updateUser(userId, userDetails);

      // Return success message and updated user object
      return {
        status: true,
        user: updatedUser,
        message: "user updated successfully",
      };
    } catch (err) {
      // Return error message if there was an error in updating user details
      return { status: false, user: null, message: err };
    }
  };

  // Method for deleting user with given user ID
  deleteUser = async (userId) => {
    // Find and delete user by ID
    const deletedUser = await this.#models.User.findByIdAndDelete(userId);
    if (!deletedUser)
      // Return error message if user was not found
      return { status: false, user: null, message: "user not found" };

    // Delete user's account using AccountController
    await this.#services.AccountController.deleteAccount(deletedUser.account);

    // Return success message
    return {
      status: true,
      data: null,
      message: "user deleted successfully",
    };
  };

  // Method for logging in user with given user details object
  login = async (userDetails) => {
    try {
      // Find the user in the database based on the provided username
      let user = await this.getUser(
        { username: userDetails.username },
        "+password"
      );

      // If no user is found, throw an error
      if (!user) throw "user not found";

      // Check if there is already an active session using the user's account
      if (user.sessions.length > 0)
        throw "There is already an active session using your account";

      // Compare the provided password with the stored password using bcrypt
      let isPasswordCorrect = await this.#packages.bcrypt.compare(
        userDetails.password,
        user.password
      );

      // If the password is incorrect, throw an error
      if (!isPasswordCorrect) throw "invalid credentials";

      // Generate a new session ID using mongoose
      let sessionId = new this.#packages.mongoose.Types.ObjectId();

      // Generate a JWT token using the user's ID and the session ID, signed with the secret key
      const token = this.#packages.jsonwebtoken.sign(
        { userId: user.id, sessionId },
        process.env.SECRET_KEY
      );

      // Add the new session ID to the user's sessions array and save the user to the database
      user.sessions = [sessionId];
      await user.save();

      // Return a success response with the JWT token and the user's details
      return {
        status: true,
        token,
        user: user.toJSON(),
        message: "user logged in  successfully",
      };
    } catch (error) {
      // If an error occurs during the login process, return a failure response with the error message
      return { status: false, user: null, message: error };
    }
  };
  createUser = async (userDetails) => {
    // create a method named createUser that accepts userDetails as an argument
    const session = await this.#packages.mongoose.startSession(); // create a Mongoose session
    let user; // declare a variable named user
    try {
      await session.withTransaction(async () => {
        // execute a transaction using the Mongoose session
        const existingUser = await this.#models.User.findOne({
          // find a user in the database
          username: userDetails.username, // search for a user with a matching username
        })
          .session(session) // use the Mongoose session for the query
          .setOptions({ pessimistic: true }); // set pessimistic locking

        if (existingUser) {
          // check if a user already exists
          throw "User already has an account"; // throw an error if the user already has an account
        }

        [user] = await this.#models.User.create(
          // create a new user in the database
          [
            {
              username: userDetails.username,
              password: userDetails.password,
              role: userDetails.role,
            },
          ],
          { session }
        );

        const [userAccount] = await this.#services.AccountController.create(
          // create a new account for the user
          user._id,
          session
        );

        user.account = userAccount.id; // associate the account with the user
        user = await user.save({ session }); // save the user
      });
    } catch (err) {
      // catch any errors that occur during the transaction
      return { status: false, user: null, message: err }; // return an error message
    } finally {
      session.endSession(); // end the Mongoose session
    }

    return {
      // return the user details
      status: true,
      user: user.toJSON(),
      message: "user created successfully",
    };
  };
}

module.exports = {
  class: UserController,
  injectableModel: [UserSchema, AccountSchema],
  injectableClass: [AccountController],
};
