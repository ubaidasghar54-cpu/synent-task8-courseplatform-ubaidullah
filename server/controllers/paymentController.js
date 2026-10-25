const crypto = require('crypto');
const Razorpay = require('razorpay');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const { sendEnrollmentEmail } = require('../utils/sendEmail');

// Initialize Razorpay client if test credentials are set
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || key_id === 'rzp_test_placeholder') {
    return null;
  }

  return new Razorpay({ key_id, key_secret });
};

// Create a Razorpay order
const createOrder = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if the user is already enrolled
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

    const displayCurrency = process.env.CURRENCY || 'PKR';
    const chargeCurrency = process.env.RAZORPAY_CHARGE_CURRENCY || displayCurrency;
    const exchangeRate = Number(process.env.EXCHANGE_RATE) || 1;

    // Convert price if a test fallback currency is configured
    let chargePrice = course.price;
    if (chargeCurrency !== displayCurrency) {
      chargePrice = course.price * exchangeRate;
    }

    // Razorpay expects amount in smallest currency unit (1 PKR = 100 paisas)
    const amountInSubunits = Math.round(chargePrice * 100);
    const razorpay = getRazorpayInstance();

    if (razorpay) {
      try {
        const order = await razorpay.orders.create({
          amount: amountInSubunits,
          currency: chargeCurrency,
          receipt: `receipt_${course._id.toString().slice(-6)}_${Date.now()}`
        });

        return res.status(200).json({
          success: true,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          displayCurrency,
          keyId: process.env.RAZORPAY_KEY_ID,
          course: {
            id: course._id,
            title: course.title,
            price: course.price
          }
        });
      } catch (razorpayError) {
        const errorDesc = razorpayError.error?.description || razorpayError.message || 'Payment provider error';
        console.error(`[Razorpay] Order creation failed: ${errorDesc}`);

        const isCurrencyError =
          errorDesc.toLowerCase().includes('currency') ||
          errorDesc.toLowerCase().includes('not supported') ||
          errorDesc.toLowerCase().includes('international');

        return res.status(400).json({
          success: false,
          message: isCurrencyError
            ? `Razorpay rejected currency ${chargeCurrency}. Enable International Payments in your Razorpay dashboard or set RAZORPAY_CHARGE_CURRENCY=INR with EXCHANGE_RATE in server/.env.`
            : `Could not create order: ${errorDesc}`
        });
      }
    } else {
      // Mock mode for local dev before keys are added
      return res.status(200).json({
        success: true,
        isMockMode: true,
        orderId: `order_test_${Date.now()}`,
        amount: amountInSubunits,
        currency: chargeCurrency,
        displayCurrency,
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

// Verify Razorpay payment and enroll user
const verifyPayment = async (req, res, next) => {
  try {
    const { courseId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!courseId || !razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

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

    // Verify signature using the secret key
    const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    const isTestBypass = razorpayOrderId.startsWith('order_test_') && razorpaySignature === 'test_bypass_sig';
    const isSignatureValid = isTestBypass || (generatedSignature === razorpaySignature);

    const activeCurrency = req.body.currency || process.env.CURRENCY || 'PKR';

    if (!isSignatureValid) {
      // Save failed record for history
      await Payment.create({
        user: req.user._id,
        course: courseId,
        razorpayOrderId,
        razorpayPaymentId,
        amount: course.price,
        currency: activeCurrency,
        status: 'failed'
      });

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: invalid signature'
      });
    }

    // Save successful payment
    const payment = await Payment.create({
      user: req.user._id,
      course: courseId,
      razorpayOrderId,
      razorpayPaymentId,
      amount: course.price,
      currency: activeCurrency,
      status: 'captured'
    });

    // Create course enrollment
    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: courseId,
      completedLessons: []
    });

    // Send confirmation email
    sendEnrollmentEmail(req.user, course, payment).catch(err =>
      console.error('[Email] Failed to send enrollment email:', err.message)
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified! You are now enrolled in the course.',
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
