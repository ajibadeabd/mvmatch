const { body, query, param, validationResult } = require("express-validator");

validatorRule = function (req, res, next) {
  const error = validationResult(req).formatWith(({ msg }) => msg);
  const hasError = !error.isEmpty();
  if (hasError) {
    res.status(422).json({ error: error.array() });
  } else {
    next();
  }
};

sellerValidator = function (req, res, next) {
  if (req.user.role !== "seller") {
    return res
      .status(401)
      .json({ message: "unauthorize, action can only be perform by seller" });
  }
  next();
};
buyerValidator = function (req, res, next) {
  if (req.user.role !== "buyer") {
    return res
      .status(401)
      .json({ message: "unauthorize action can only be perform by buyer" });
  }
  next();
};

class ValidatorFactory {
  static username = body("username")
    .not()
    .isEmpty()
    .withMessage("Username is required")
    .isString()
    .withMessage("Username should be a string");
  static password = body("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password should be a string");
  static role = body("role")
    .not()
    .isEmpty()
    .withMessage("Role is required")
    .isString()
    .withMessage("Role should be a string")
    .isIn(["buyer", "seller"])
    .withMessage("Role should be either 'buyer' or 'seller'");

  static updateUserValidator() {
    return [
      [
        body("password")
          .not()
          .isEmpty()
          .withMessage("Password is required")
          .isString()
          .withMessage("Password should be a string")
          .optional(),
        body("username")
          .not()
          .isEmpty()
          .withMessage("Username is required")
          .isString()
          .withMessage("Username should be a string")
          .optional(),
      ],
      (req, res, next) => {
        req.body = new UpdateUserDto(req.body);
        return validatorRule(req, res, next);
      },
    ];
  }
  static loginUserValidator() {
    return [
      [
        body("password")
          .not()
          .isEmpty()
          .withMessage("Password is required")
          .isString()
          .withMessage("Password should be a string"),
        body("username")
          .not()
          .isEmpty()
          .withMessage("Username is required")
          .isString()
          .withMessage("Username should be a string"),
      ],
      (req, res, next) => {
        req.body = new LoginUserDto(req.body);
        return validatorRule(req, res, next);
      },
    ];
  }
  static getProductsPageValidator() {
    return [
      [
        query("page")
          .notEmpty()
          .withMessage("Skip is required")
          .isInt({ min: 1 })
          .optional()
          .withMessage("Skip should be an integer greater than or equal to 1"),
        query("limit")
          .notEmpty()
          .withMessage("Limit is required")
          .isInt({ min: 1 })
          .optional()
          .withMessage("Limit should be an integer greater than or equal to 1"),
      ],
      (req, res, next) => {
        req.query.skip = parseInt(req.query.skip);
        req.query.limit = parseInt(req.query.limit);
        return validatorRule(req, res, next);
      },
    ];
  }

  static purchaseProductValidator() {
    return [
      [
        param("productId")
          .notEmpty()
          .withMessage("productId is required")
          .isMongoId()
          .withMessage("productId should be a valid product id."),
        body("amount").notEmpty().withMessage("amount is required"),
      ],
      (req, res, next) => {
        req.body = new PurchaseProductDto(req.body);
        return validatorRule(req, res, next);
      },
    ];
  }

  static getProductByIdValidator() {
    return [
      [
        param("productId")
          .notEmpty()
          .withMessage("productId is required")
          .isMongoId()
          .withMessage("productId should be a valid product id."),
      ],
      validatorRule,
    ];
  }

  static depositCoinValidator() {
    return [
      [
        body("amount")
          .notEmpty()
          .withMessage("amount is required")
          .isInt()
          .withMessage("amount should be an integer")
          .custom((value) => {
            if (value % 5 !== 0) {
              throw new Error("amount should be a multiple of 5");
            }
            return true;
          }),
      ],
      validatorRule,
    ];
  }

  static logoutUserValidator() {
    return [
      [
        body("password")
          .not()
          .isEmpty()
          .withMessage("Password is required")
          .isString()
          .withMessage("Password should be a string"),
        body("username")
          .not()
          .isEmpty()
          .withMessage("Username is required")
          .isString()
          .withMessage("Username should be a string"),
      ],
      (req, res, next) => {
        req.body = new LogoutUserDto(req.body);
        return validatorRule(req, res, next);
      },
    ];
  }
  static createProductValidator() {
    return [
      body("productName")
        .notEmpty()
        .withMessage("Product name is required")
        .isString()
        .withMessage("Product name should be a string"),
      body("description")
        .notEmpty()
        .withMessage("Description is required")
        .isString()
        .withMessage("Description should be a string"),
      body("cost")
        .notEmpty()
        .withMessage("Cost is required")
        .isInt()
        .withMessage("Cost should be an integer")
        .custom((value) => {
          if (value % 5 !== 0) {
            throw new Error("Cost should be a multiple of 5");
          }
          return true;
        }),
      (req, res, next) => {
        req.body = new CreateProductDto(req.body);
        return validatorRule(req, res, next);
      },
    ];
  }
  static updateProductValidator() {
    return [
      body("productName")
        .notEmpty()
        .withMessage("Product name is required")
        .isString()
        .withMessage("Product name should be a string")
        .optional(),
      body("description")
        .notEmpty()
        .withMessage("Description is required")
        .isString()
        .withMessage("Description should be a string")
        .optional(),

      param("productId")
        .notEmpty()
        .withMessage("Product ID is required")
        .isString()
        .withMessage("Product ID should be a string")
        .isMongoId()
        .withMessage("Product ID should be a valid  ID"),

      body("cost")
        .notEmpty()
        .withMessage("Cost is required")
        .isInt()
        .withMessage("Cost should be an integer")
        .custom((value) => {
          if (value % 5 !== 0) {
            throw new Error("Cost should be a multiple of 5");
          }
          return true;
        })
        .optional(),
      (req, res, next) => {
        req.body = new UpdateProductDto(req.body);
        return validatorRule(req, res, next);
      },
    ];
  }
  static deleteProductByIdValidator() {
    return [
      param("productId")
        .notEmpty()
        .withMessage("Product ID is required")
        .isString()
        .withMessage("Product ID should be a string")
        .isMongoId()
        .withMessage("Product ID should be a valid  ID"),
      validatorRule,
    ];
  }

  static createUserValidator() {
    return [
      [
        body("password")
          .not()
          .isEmpty()
          .withMessage("Password is required")
          .isString()
          .withMessage("Password should be a string"),
        body("role")
          .not()
          .isEmpty()
          .withMessage("Role is required")
          .isString()
          .withMessage("Role should be a string")
          .isIn(["buyer", "seller"])
          .withMessage("Role should be either 'buyer' or 'seller'"),
        body("username")
          .not()
          .isEmpty()
          .withMessage("Username is required")
          .isString()
          .withMessage("Username should be a string"),
      ],
      (req, res, next) => {
        req.body = new CreateUserDto(req.body);
        return validatorRule(req, res, next);
      },
    ];
  }
}

ValidatorFactory = ValidatorFactory;

module.exports = {
  validator: {
    ValidatorFactory,
    validatorRule,
    sellerValidator,
    buyerValidator,
  },
};

class CreateUserDto {
  constructor({ username, password, role }) {
    this.username = username;
    this.password = password;
    this.role = role;
  }
}

class UpdateUserDto {
  constructor({ username, password }) {
    this.username = username;
    this.password = password;
  }
}

class LoginUserDto extends UpdateUserDto {
  constructor({ username, password }) {
    super({ username, password });
  }
}

class LogoutUserDto extends UpdateUserDto {
  constructor({ username, password }) {
    super({ username, password });
  }
}

class CreateProductDto {
  constructor({ cost, description, productName }) {
    this.productName = productName;
    this.cost = cost;
    this.description = description;
  }
}

class UpdateProductDto extends CreateProductDto {
  constructor({ cost, description, productName, productId }) {
    super({ cost, description, productName });
  }
}
class PurchaseProductDto {
  constructor({ amount, productId }) {
    this.amount = amount;
    this.productId = productId;
  }
}
