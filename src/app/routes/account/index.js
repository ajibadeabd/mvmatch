const UserController = require("../../controllers/user");
const PassportAuthenticator = require("../../helpers/validator/passport");

class AccountRoute {
  #services;
  constructor({ services }) {
    this.#services = services;
  }

  "post.deposit" = async (request, response) => {
    try {
      const { amount } = request.body;
      const allowedCoins = [5, 10, 20, 50, 100];
      if (!allowedCoins.includes(amount)) {
        throw `Amount should be ${allowedCoins}`;
      }
      let balance = await this.#services.AccountController.deposit(
        request.user,
        amount
      );
      return response.status(200).json({
        message: "account funded successfully successfully",
        data: balance,
      });
    } catch (err) {
      throw err;
    }
  };
}

class Validator {
  #validator;
  #services;
  constructor({ validator, services }) {
    this.#validator = validator;
    this.#services = services;
  }
  get = () => {
    return [
      this.#services.PassportAuthenticator.authenticateUser(),
      this.#validator.ValidatorFactory.createUserValidator(),
    ];
  };
  all = () => [];
}
module.exports = {
  route: AccountRoute,
  middleware: Validator,
  injectableClass: [UserController, PassportAuthenticator],
};
