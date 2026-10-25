const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {string} id - The MongoDB User ID
 * @param {string} role - 'user' or 'admin'
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

module.exports = generateToken;

