const ProductController = require("../../controllers/product");
const PassportAuthenticator = require("../../helpers/validator/passport");

class ProductRoute {
  #services;
  constructor({ services, packages }) {
    this.#services = services;
  }
  "get:productId" = async (request, response) => {
    let userResponse = await this.#services.ProductController.getProduct(
      request.params.productId
    );
    if (!userResponse.status) {
      return response.status(400).json(userResponse);
    }
    return response.status(200).json(userResponse);
  };

  get = async (request, response) => {
    let userResponse = await this.#services.ProductController.getProducts(
      request.query
    );
    if (!userResponse.status) {
      return response.status(400).json(userResponse);
    }
    return response.status(200).json(userResponse);
  };

  "post.buy/:productId" = async (request, response) => {
    let userResponse = await this.#services.ProductController.buy(
      request.user,
      request.body,
      request.params.productId
    );
    if (!userResponse.status) {
      return response.status(400).json(userResponse);
    }
    return response.status(200).json(userResponse);
  };

  post = async (request, response) => {
    let userResponse = await this.#services.ProductController.createProduct(
      request.body,
      request.user
    );
    if (!userResponse.status) {
      return response.status(400).json(userResponse);
    }
    return response.status(200).json(userResponse);
  };
  "delete:productId" = async (request, response) => {
    let productResponse = await this.#services.ProductController.deleteProduct(
      request.params.productId,
      request.user
    );
    if (!productResponse.status) {
      return response.status(400).json(productResponse);
    }
    return response.status(200).json(productResponse);
  };
  "patch:productId" = async (request, response) => {
    let userResponse = await this.#services.ProductController.updatedProduct(
      request.body,
      request.user,
      request.params.productId
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
    return [
      this.#services.PassportAuthenticator.authenticateUser(),
      this.#validator.ValidatorFactory.createProductValidator(),
      this.#validator.sellerValidator,
    ];
  };
  "patch:productId" = () => {
    return [
      this.#services.PassportAuthenticator.authenticateUser(),
      this.#validator.ValidatorFactory.updateProductValidator(),
      this.#validator.sellerValidator,
    ];
  };

  "delete:productId" = () => {
    return [
      this.#services.PassportAuthenticator.authenticateUser(),
      this.#validator.ValidatorFactory.deleteProductByIdValidator(),
      this.#validator.sellerValidator,
    ];
  };
  "get:productId" = () => {
    return [this.#validator.ValidatorFactory.getProductByIdValidator()];
  };
  "post.buy/:productId" = () => {
    return [
      this.#services.PassportAuthenticator.authenticateUser(),
      this.#validator.ValidatorFactory.purchaseProductValidator(),
      // this.#validator.buyerValidator,
    ];
  };
  get = () => {
    return [this.#validator.ValidatorFactory.getProductsPageValidator()];
  };
  all = () => [];
}
module.exports = {
  route: ProductRoute,
  middleware: Validator,
  injectableClass: [ProductController, PassportAuthenticator],
};
