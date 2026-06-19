const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('CRITICAL CONFIGURATION ERROR: JWT_SECRET environmental variable is undefined in the backend environment!');
}

/**
 * Signs a payload to generate a JWT token (expires in 24 hours)
 * @param {Object} payload - Session parameters (userId, role)
 * @returns {string} - Compiled token
 */
const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Verifies a token signature
 * @param {string} token - Authorization bearer token
 * @returns {Object} - Parsed payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  signToken,
  verifyToken
};
