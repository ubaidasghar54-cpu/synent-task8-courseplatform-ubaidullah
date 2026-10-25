const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: Verify JWT and attach user object to req.user
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Bearer token is provided in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token part: 'Bearer <token>' -> '<token>'
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using JWT_SECRET
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_secret_key_change_in_production'
      );

      // Find user by ID and attach to request object
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user account no longer exists'
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token is invalid or expired'
      });
    }
  }

  // If no Bearer token was found
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

/**
 * Middleware: Restrict access to administrators only
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Forbidden: Administrator privileges required'
  });
};

module.exports = {
  protect,
  admin
};

