const AccountController = require("../../controllers/account");
const PassportAuthenticator = require("../../helpers/validator/passport");

class AccountRoute {
  #services;
  constructor({ services }) {
    this.#services = services;
  }

  "post.deposit" = async (request, response) => {
    const { amount } = request.body;

    let accountResponse = await this.#services.AccountController.deposit(
      request.user,
      amount
    );
    if (!accountResponse.status) {
      return response.status(400).json(accountResponse);
    }
    return response.status(200).json(accountResponse);
  };
  "post.reset" = async (request, response) => {
    let accountResponse = await this.#services.AccountController.reset(
      request.user.account
    );
    if (!accountResponse.status) {
      return response.status(400).json(accountResponse);
    }
    return response.status(200).json(accountResponse);
  };
}

class Validator {
  #validator;
  #services;
  constructor({ validator, services }) {
    this.#validator = validator;
    this.#services = services;
  }

  "post.deposit" = () => {
    return [this.#validator.ValidatorFactory.depositCoinValidator()];
  };

  all = () => {
    return [
      this.#services.PassportAuthenticator.authenticateUser(),
      // this.#validator.buyerValidator,
    ];
  };
}
module.exports = {
  route: AccountRoute,
  middleware: Validator,
  injectableClass: [AccountController, PassportAuthenticator],
};
