const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const {
  sendRegistrationEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
} = require('../utils/sendEmail');

/**
 * @desc   Register a new user
 * @route  POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // 2. Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // 3. Hash password using bcryptjs (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create user in database
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'user',
      isVerified: false
    });

    // 5. Generate JWT token
    const token = generateToken(user._id, user.role);

    // 6. Send welcome email (asynchronous, non-blocking)
    sendRegistrationEmail(user).catch(err =>
      console.error('[Email Error] Registration email dispatch failed:', err.message)
    );

    // 7. Respond with token and sanitized user
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Authenticate user and return JWT
 * @route  POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // 2. Find user by email
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // 3. Generic error if user doesn't exist (prevents account enumeration attacks)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. Verify password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 5. Generate JWT
    const token = generateToken(user._id, user.role);

    // 6. Return response
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get currently logged-in user profile
 * @route  GET /api/auth/me
 * @access Private (Protected)
 */
const getMe = async (req, res, next) => {
  try {
    // req.user was populated by the protect middleware
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Trigger email verification link to logged-in user
 * @route  POST /api/auth/send-verify-email
 * @access Private (Protected)
 */
const sendVerifyEmail = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your email is already verified'
      });
    }

    // Generate random unguessable verification token
    const token = crypto.randomBytes(32).toString('hex');
    user.verifyToken = token;
    await user.save();

    // Send email asynchronously
    sendVerificationEmail(user, token).catch(err =>
      console.error('[Email Error] Verification email failed:', err.message)
    );

    res.status(200).json({
      success: true,
      message: `Verification link sent to ${user.email}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Verify email address using token
 * @route  POST /api/auth/verify-email
 * @access Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const user = await User.findOne({ verifyToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or has already been used'
      });
    }

    user.isVerified = true;
    user.verifyToken = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email successfully verified! Your account is in good standing.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Initiate forgot password workflow
 * @route  POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your account email'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Defense against user enumeration: always return uniform success response
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been dispatched.'
      });
    }

    // 1. Generate unguessable random token
    const rawResetToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash token with SHA-256 before storing in MongoDB
    const hashedToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    // 3. Set token and 1-hour expiration timestamp
    user.resetToken = hashedToken;
    user.resetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // 4. Send email with raw unhashed token
    sendPasswordResetEmail(user, rawResetToken).catch(err =>
      console.error('[Email Error] Password reset dispatch failed:', err.message)
    );

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Reset password using valid token
 * @route  POST /api/auth/reset-password
 * @access Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // 1. Hash the incoming token to match what is stored in MongoDB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find user with matching token and unexpired resetExpires
    const user = await User.findOne({
      resetToken: hashedToken,
      resetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired. Please request a new one.'
      });
    }

    // 3. Hash the new password with bcrypt
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);

    // 4. Clear reset token fields
    user.resetToken = null;
    user.resetExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  sendVerifyEmail,
  verifyEmail,
  forgotPassword,
  resetPassword
};

