const UserSchema = require("../models/user");
const AccountSchema = require("../models/account");
const AccountController = require("../controllers/account");

class UserController {
  #packages;
  #models;
  #services;
  constructor({ packages, models, services }) {
    this.#packages = packages;
    this.#models = models;
    this.#services = services;
  }

  logout = async (userDetails) => {
    try {
      if (userDetails.sessions.length == 0) throw "No active session";
      await this.updateUser(userDetails.id, {
        sessions: [],
      });
      return {
        status: true,
        message: "User session deleted successfully",
      };
    } catch (error) {
      return { status: false, message: error };
    }
  };
  getUser = async (filteredValue, include) => {
    return this.#models.User.findOne(
      {
        ...filteredValue,
      },
      include
    );
  };
  updateUser = async (filteredValue, newValue) => {
    return this.#models.User.findByIdAndUpdate(filteredValue, newValue, {
      new: true,
    });
  };
  updateUserDetail = async (userDetails, userId) => {
    try {
      let isUserExist = await this.getUser({ username: userDetails.username });

      if (isUserExist) {
        let errorMessage =
          userId === isUserExist.id
            ? "Provide a new username to update"
            : "username already taken";
        throw errorMessage;
      }
      
     
      const updatedUser = await this.updateUser(userId, userDetails);

      return {
        status: true,
        user: updatedUser,
        message: "user updated successfully",
      };
    } catch (err) {
      return { status: false, user: null, message: err };
    }
  };
  deleteUser = async (userId) => {
    const deletedUser = await this.#models.User.findByIdAndDelete(userId);
    if (!deletedUser)
      return { status: false, user: null, message: "user not found" };
    await this.#services.AccountController.deleteAccount(deletedUser.account);
    return {
      status: true,
      data: null,
      message: "user deleted successfully",
    };
  };

  login = async (userDetails) => {
    try {
      let user = await this.getUser(
        { username: userDetails.username },
        "+password"
      );
      if (!user) throw "user not found";
      if (user.sessions.length > 0)
        throw "There is already an active session using your account";
      let isPasswordCorrect = await this.#packages.bcrypt.compare(
        userDetails.password,
        user.password
      );
      if (!isPasswordCorrect) throw "invalid credentials";
      let sessionId = new this.#packages.mongoose.Types.ObjectId();
      console.log(sessionId);
      const token = this.#packages.jsonwebtoken.sign(
        { userId: user.id, sessionId },
        process.env.SECRET_KEY
      );
      user.sessions = [sessionId];
      user.save();
      return {
        status: true,
        token,
        user: user.toJSON(),
        message: "user logged in  successfully",
      };
    } catch (error) {
      return { status: false, user: null, message: error };
    }
  };
  createUser = async (userDetails) => {
    const session = await this.#packages.mongoose.startSession();
    let user;
    try {
      await session.withTransaction(async () => {
        const existingUser = await this.#models.User.findOne({
          username: userDetails.username,
        })
          .session(session)
          .setOptions({ pessimistic: true });
        if (existingUser) {
          throw "User already has an account";
        }

        [user] = await this.#models.User.create(
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
          user._id,
          session
        );

        user.account = userAccount.id;
        user = await user.save({ session });
      });
    } catch (err) {
      return { status: false, user: null, message: err };
    } finally {
      session.endSession();
    }

    return {
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
