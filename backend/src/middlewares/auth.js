const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. No token provided.', null, 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return errorResponse(res, 'Invalid or expired token.', null, 401);
    }

    // Verify user exists
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'address', 'role']
    });

    if (!user) {
      return errorResponse(res, 'User associated with this token no longer exists.', null, 401);
    }

    req.user = user.toJSON();
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
