const { body, query, param, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

/**
 * Reusable validation result handler
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return errorResponse(res, 'Validation failed', formattedErrors, 400);
  }
  next();
};

/**
 * Validation rules
 */
const nameValidator = body('name')
  .trim()
  .notEmpty().withMessage('Name is required')
  .isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters');

const emailValidator = body('email')
  .trim()
  .notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Please provide a valid email address')
  .normalizeEmail();

const passwordValidator = body('password')
  .notEmpty().withMessage('Password is required')
  .isLength({ min: 8, max: 16 }).withMessage('Password must be 8 to 16 characters long')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage('Password must contain at least one special character');

const addressValidator = body('address')
  .optional({ nullable: true, checkFalsy: true })
  .trim()
  .isLength({ max: 400 }).withMessage('Address must not exceed 400 characters');

const addressRequiredValidator = body('address')
  .trim()
  .notEmpty().withMessage('Address is required')
  .isLength({ max: 400 }).withMessage('Address must not exceed 400 characters');

const ratingValidator = body('rating')
  .notEmpty().withMessage('Rating is required')
  .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5')
  .toInt();

/**
 * Specific validation chains
 */
const signupValidation = [
  nameValidator,
  emailValidator,
  passwordValidator,
  addressValidator,
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8, max: 16 }).withMessage('New password must be 8 to 16 characters long')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage('New password must contain at least one special character'),
  validate
];

const createUserValidation = [
  nameValidator,
  emailValidator,
  passwordValidator,
  addressValidator,
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['admin', 'user', 'store_owner']).withMessage('Role must be one of: admin, user, store_owner'),
  validate
];

const createStoreValidation = [
  nameValidator,
  emailValidator,
  addressRequiredValidator,
  body('owner_id')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID(4).withMessage('Owner ID must be a valid UUID'),
  validate
];

const submitRatingValidation = [
  param('id')
    .isUUID(4).withMessage('Store ID must be a valid UUID'),
  ratingValidator,
  validate
];

module.exports = {
  validate,
  signupValidation,
  loginValidation,
  updatePasswordValidation,
  createUserValidation,
  createStoreValidation,
  submitRatingValidation
};
