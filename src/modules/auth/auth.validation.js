const { body } = require('express-validator');
const validate = require('../../middlewares/validation.middleware');

exports.registerValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("First name required")
    .isLength({ min: 3 })
    .withMessage("First name must be at least 3 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  // body("phoneNumber")
  //   .optional
  //   .n
  //   .isLength({ min: 6 })
  //   .withMessage("Password must be at least 6 characters"),
  validate,
];









