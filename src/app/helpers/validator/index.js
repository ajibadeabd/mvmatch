const { body, param, validationResult } = require("express-validator");

validatorRule = function (req, res, next) {
  const error = validationResult(req).formatWith(({ msg }) => msg);
  const hasError = !error.isEmpty();
  if (hasError) {
    res.status(422).json({ error: error.array() });
  } else {
    next();
  }
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
    .withMessage("Role should be a string");
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
          .withMessage("Role should be a string"),
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
