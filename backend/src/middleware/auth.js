const { verifyToken } = require('../config/jwt');

/**
 * Authentication check middleware.
 * Verifies Bearer JWT token in Authorization headers.
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for Authorization Header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please provide a valid Authorization Bearer token.'
      });
    }

    // Verify token
    try {
      const decoded = verifyToken(token);
      req.user = decoded; // Decoded has: { id, email, role }
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization guard middleware.
 * Restricts access to specific roles.
 * @param {...string} roles - Permitted user roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to execute this administrative operation.'
      });
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
