const AccountSchema = require("../models/account");

class AccountController {
  #packages;
  #models;
  constructor({ packages, models }) {
    this.#packages = packages;
    this.#models = models;
  }

  deleteAccount = async (accountId) => {
    return this.#models.Account.findByIdAndDelete(accountId);
  };

  create = async (userId, session) => {
    // Create a new account for the given user ID within the provided session
    return await this.#models.Account.create(
      [
        {
          user: userId, // Set the user field to the given user ID
        },
      ],
      { session } // Use the provided session for the transaction
    );
  };

  reset = async (userId) => {
    try {
      // Get user account details by userId
      let userAccount = await this.getAccount({ _id: userId });
      if (!userAccount) {
        throw "Account not found";
      }
      // Check if the account has already been reset previously
      if (userAccount.balance === 0) {
        throw "Account already reset previously";
      }
      // Reset the account balance to 0
      userAccount.balance = 0;
      // Save the updated account details
      userAccount = await userAccount.save();
      return {
        status: true,
        data: userAccount,
        message: "account reset successfully",
      };
    } catch (error) {
      // Return error message if any exception occurs
      return { status: false, message: error };
    }
  };

  getAccount = async (filteredValue, session) => {
    // Create a mongoose query to find the account with the filtered value.
    const query = this.#models.Account.findOne({
      ...filteredValue,
    });

    // If a session is provided, set the query session and options.
    if (session) {
      query.session(session).setOptions({ pessimistic: true });
    }

    // Execute the query and return the account document.
    return await query.exec();
  };

  // Define a function named "deposit" that takes two arguments, "userDetails" and "amount"
  deposit = async (userDetails, amount) => {
    // Start a new Mongoose session
    const session = await this.#packages.mongoose.startSession();

    // Declare a variable named "userAccount"
    let userAccount;

    try {
      // Start a transaction within the session
      await session.withTransaction(async () => {
        // Retrieve the user's account with the specified ID
        userAccount = await this.getAccount(
          { _id: userDetails.account },
          session
        );

        // If the user's account was not found, throw an error
        if (!userAccount) {
          throw "Account not found";
        }

        // Calculate the new balance after the deposit
        const newBalance = userAccount.balance + amount;

        // Set the user's balance to the new balance
        userAccount.balance = newBalance;

        // Save the updated user account with the session
        userAccount = await userAccount.save({ session });
      });
    } catch (error) {
      // If there was an error during the transaction, return an object with the error message
      return { status: false, message: error };
    } finally {
      // End the session
      session.endSession();
    }

    // If the transaction completed successfully, return an object with the user account data and a success message
    return {
      status: true,
      data: userAccount,
      message: "account funded successfully",
    };
  };
}

module.exports = {
  class: AccountController,
  injectableModel: [AccountSchema],
};
