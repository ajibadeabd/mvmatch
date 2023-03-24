const ProductController = require("../../controllers/product");
const PassportAuthenticator = require("../../helpers/validator/passport");

class ProductRoute {
  get = async (_, response) => {
    return response.status(200).json({ data: "jjj" });
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
    //  this.#services.PassportAuthenticator.authenticateUser(),
      this.#validator.ValidatorFactory.createUserValidator(),
    ];
  };
  all = () => [];
}
module.exports = {
  route: ProductRoute,
  middleware: Validator,
  injectableClass: [ProductController, PassportAuthenticator],
};
