const UserController = require("../../controllers/user");
const PassportAuthenticator = require("../../helpers/validator/passport");

class UserRoute {
  #services;
  constructor({ services, packages }) {
    this.#services = services;
  }
  post = async (request, response) => {
    let userResponse = await this.#services.UserController.createUser(
      request.body
    );
    if (!userResponse.status) {
      return response.status(400).json(userResponse);
    }
    return response.status(200).json(userResponse);
  };
  "get.logout/all" = async (request, response) => {
    let userResponse = await this.#services.UserController.logout(request.user);

    if (!userResponse.status) {
      return response.status(400).json(userResponse);
    }
    return response.status(200).json(userResponse);
  };
  get = async (request, response) => {
    return response
      .status(200)
      .json({ message: "user fetched successfully", user: request.user });
  };

  "post.login" = async (request, response) => {
    let userResponse = await this.#services.UserController.login(request.body);
    if (!userResponse.status) {
      return response.status(400).json(userResponse);
    }
    return response.status(200).json(userResponse);
  };

  patch = async (request, response) => {
    let userResponse = await this.#services.UserController.updateUserDetail(
      request.body,
      request.user.id
    );
    if (!userResponse.status) {
      return response.status(400).json(userResponse);
    }
    return response.status(200).json(userResponse);
  };

  delete = async (request, response) => {
    let userResponse = await this.#services.UserController.deleteUser(
      request.user.id
    );
    if (!userResponse.status) {
      return response.status(400).json(userResponse);
    }
    return response.status(200).json(userResponse);
  };
}
class Validator {
  #validator;
  #services;
  constructor({ validator, services }) {
    this.#validator = validator;
    this.#services = services;
  }
  post = () => {
    return [this.#validator.ValidatorFactory.createUserValidator()];
  };
  patch = () => {
    return [
      this.#services.PassportAuthenticator.authenticateUser(),
      this.#validator.ValidatorFactory.updateUserValidator(),
    ];
  };

  "get.logout/all" = () => [
    this.#services.PassportAuthenticator.authenticateUser(),
  ];
  get = () => [this.#services.PassportAuthenticator.authenticateUser()];
  "post.login" = () => [this.#validator.ValidatorFactory.loginUserValidator()];
  delete = () => [this.#services.PassportAuthenticator.authenticateUser()];
  all = () => [];
}
module.exports = {
  route: UserRoute,
  middleware: Validator,
  injectableClass: [UserController, PassportAuthenticator],
};
