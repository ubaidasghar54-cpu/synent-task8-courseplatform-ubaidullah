const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    razorpayOrderId: {
      type: String,
      required: [true, 'Razorpay Order ID is required']
    },
    razorpayPaymentId: {
      type: String,
      required: [true, 'Razorpay Payment ID is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required']
    },
    currency: {
      type: String,
      default: process.env.CURRENCY || 'PKR'
    },
    status: {
      type: String,
      enum: ['pending', 'captured', 'failed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

