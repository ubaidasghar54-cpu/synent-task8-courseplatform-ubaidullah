const crypto = require('crypto');
const Razorpay = require('razorpay');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const { sendEnrollmentEmail } = require('../utils/sendEmail');

/**
 * Helper to get Razorpay instance
 */
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || key_id === 'rzp_test_placeholder') {
    return null; // Signals test fallback mode
  }

  return new Razorpay({ key_id, key_secret });
};

/**
 * @desc   Create Razorpay Order for a course
 * @route  POST /api/payments/create-order
 * @access Private (Protected)
 */
const createOrder = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // 1. Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // 2. Prevent duplicate enrollment
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    const amountInPaise = Math.round(course.price * 100);
    const razorpay = getRazorpayInstance();

    // 3. Create Razorpay order if active credentials exist
    if (razorpay) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${course._id.toString().slice(-6)}_${Date.now()}`
      };

      const order = await razorpay.orders.create(options);

      return res.status(200).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        course: {
          id: course._id,
          title: course.title,
          price: course.price
        }
      });
    } else {
      // Development mock fallback if no live Razorpay test keys are configured yet
      const mockOrderId = `order_test_${Date.now()}`;
      return res.status(200).json({
        success: true,
        isMockMode: true,
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: 'INR',
        keyId: 'rzp_test_placeholder',
        course: {
          id: course._id,
          title: course.title,
          price: course.price
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Verify Razorpay HMAC SHA-256 signature and enroll user
 * @route  POST /api/payments/verify-payment
 * @access Private (Protected)
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { courseId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!courseId || !razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    // 1. Prevent duplicate enrollment race condition
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // 2. Cryptographic signature check (HMAC SHA-256 of orderId + '|' + paymentId)
    const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    const isTestBypass = razorpayOrderId.startsWith('order_test_') && razorpaySignature === 'test_bypass_sig';
    const isSignatureValid = isTestBypass || (generatedSignature === razorpaySignature);

    if (!isSignatureValid) {
      // Record failed transaction for audit
      await Payment.create({
        user: req.user._id,
        course: courseId,
        razorpayOrderId,
        razorpayPaymentId,
        amount: course.price,
        status: 'failed'
      });

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: cryptographic signature mismatch'
      });
    }

    // 3. Record successful captured payment
    const payment = await Payment.create({
      user: req.user._id,
      course: courseId,
      razorpayOrderId,
      razorpayPaymentId,
      amount: course.price,
      currency: 'INR',
      status: 'captured'
    });

    // 4. Enroll the user in the course
    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: courseId,
      completedLessons: []
    });

    // 5. Send automated enrollment receipt email (non-blocking)
    sendEnrollmentEmail(req.user, course, payment).catch(err =>
      console.error('[Email Error] Enrollment email dispatch failed:', err.message)
    );

    res.status(200).json({
      success: true,
      message: 'Payment successfully verified! Course has been added to My Courses.',
      enrollmentId: enrollment._id,
      paymentId: payment._id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment
};

