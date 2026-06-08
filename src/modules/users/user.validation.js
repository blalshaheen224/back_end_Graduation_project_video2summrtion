const { body, param} = require('express-validator');
const validate = require('../../middlewares/validation.middleware');


exports.updateMeValidation = [
  body('FirstName')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('First name must be at least 3 characters'),

  body('LastName')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Last name must be at least 3 characters'),


  validate
];


exports.updateUserByAdminValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),

  // Optional fields admin can update
  body('FirstName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),

  body('LastName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),

  body('Email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),


  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be true or false'),

    validate
];

