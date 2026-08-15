const { errorResponse } = require('../utils/response');

/**
 * Centralized Express Error Handler
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors && err.errors[0] ? err.errors[0].path : 'field';
    return errorResponse(res, `A record with this ${field} already exists.`, [{
      field,
      message: `${field} must be unique`
    }], 400);
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return errorResponse(res, 'Validation error', errors, 400);
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return errorResponse(res, 'Referenced record does not exist.', null, 400);
  }

  // JSON Web Token Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Invalid or expired authentication token.', null, 401);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, null, statusCode);
};

module.exports = errorHandler;
