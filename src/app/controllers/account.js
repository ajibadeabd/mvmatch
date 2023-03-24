const UserSchema = require("../models/user");
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
    return await this.#models.Account.create(
      [
        {
          user: userId,
        },
      ],
      { session }
    );
  };
  getAccount = async (userId) => {
    return this.#models.Account.findOne({
      user: userId,
    });
  };
  // deposit = async (userDetails, amount) => {
  //   try {
  //     const userAccount = await this.getAccount({ user: userDetails.id });
  //     if (!userAccount) {
  //       throw "Account not found";
  //     }

  //     // update the account balance with the deposited amount
  //     const newBalance = userAccount.balance + amount;
  //     userAccount.balance = newBalance;
  //     userAccount = await userAccount.save();

  //     return { status: true, data: userAccount };
  //   } catch (err) {
  //     return { status: false, err };
  //   }
  // };
  deposit = async (userDetails, amount) => {
    const session = await this.#packages.mongoose.startSession();
    let userAccount;
    try {
      await session.withTransaction(async () => {
        userAccount = await this.getAccount({ user: userDetails.id })
          .session(session)
          .setOptions({ pessimistic: true });
        if (!userAccount) {
          throw "Account not found";
        }

        // update the account balance with the deposited amount
        const newBalance = userAccount.balance + amount;
        userAccount.balance = newBalance;
        userAccount = await userAccount.save();
      });
    } catch (err) {
      return { status: false, err };
    } finally {
      session.endSession();
    }
    return { status: true, data: userAccount };
  };
}

module.exports = {
  class: AccountController,
  injectableModel: [UserSchema, AccountSchema],
};
