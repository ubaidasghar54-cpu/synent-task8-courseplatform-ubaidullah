const express = require('express');
const {
  register,
  login,
  getMe,
  sendVerifyEmail,
  verifyEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected auth routes
router.get('/me', protect, getMe);
router.post('/send-verify-email', protect, sendVerifyEmail);

module.exports = router;

