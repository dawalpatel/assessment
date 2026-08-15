const { errorResponse } = require('../utils/response');

/**
 * Authorize middleware allowing only specific roles
 * @param {string[]} roles
 */
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthenticated user', null, 401);
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Requires one of the following roles: ${roles.join(', ')}`,
        null,
        403
      );
    }

    next();
  };
};

module.exports = authorize;
