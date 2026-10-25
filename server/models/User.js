const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifyToken: {
      type: String,
      default: null
    },
    resetToken: {
      type: String,
      default: null
    },
    resetExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/**
 * Compare plain password with stored hash
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

/**
 * Security: Never expose passwordHash or tokens in JSON responses
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.verifyToken;
  delete obj.resetToken;
  delete obj.resetExpires;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

