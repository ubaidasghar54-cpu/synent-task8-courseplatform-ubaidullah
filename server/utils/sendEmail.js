const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer Transporter
 * Uses credentials from .env if present; otherwise creates an automated Ethereal test account.
 */
const createTransporter = async () => {
  const hasEnvCredentials =
    process.env.EMAIL_USER &&
    process.env.EMAIL_USER !== 'placeholder_user' &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_PASS !== 'placeholder_pass';

  if (hasEnvCredentials) {
    if (process.env.EMAIL_SERVICE === 'gmail') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Automatic Ethereal test inbox for development (no credentials required)
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

/**
 * Send Welcome / Registration Email
 */
const sendRegistrationEmail = async (user) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: '"LearnHub Team" <no-reply@learnhub.com>',
      to: user.email,
      subject: 'Welcome to LearnHub - Start Your Tech Journey!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F8FAFC; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0;">
          <div style="background-color: #0F172A; padding: 25px; border-radius: 8px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Welcome to <span style="color: #FBBF24;">Learn</span>Hub!</h1>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 25px; border-radius: 8px; margin-top: 15px; border: 1px solid #E2E8F0;">
            <h2 style="color: #0F172A; margin-top: 0;">Hi ${user.name},</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
              Thank you for creating an account on LearnHub. You now have full access to our catalog of industry-grade courses, interactive video modules, and certified skill roadmaps.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/courses" style="background-color: #3B82F6; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                Explore Courses
              </a>
            </div>
            
            <p style="color: #64748B; font-size: 13px; border-top: 1px solid #E2E8F0; padding-top: 15px; margin-bottom: 0;">
              If you did not register for this account, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Registration email sent to ${user.email} (ID: ${info.messageId})`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Preview] View HTML email: ${previewUrl}`);
    }

    return info;
  } catch (error) {
    console.error(`[Email Error] Failed to send registration email: ${error.message}`);
  }
};

/**
 * Send Course Enrollment & Payment Confirmation Email
 */
const sendEnrollmentEmail = async (user, course, payment) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: '"LearnHub Team" <no-reply@learnhub.com>',
      to: user.email,
      subject: `Enrollment Confirmed: ${course.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F8FAFC; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0;">
          <div style="background-color: #0F172A; padding: 25px; border-radius: 8px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Enrollment <span style="color: #10B981;">Successful</span></h1>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 25px; border-radius: 8px; margin-top: 15px; border: 1px solid #E2E8F0;">
            <h2 style="color: #0F172A; margin-top: 0;">Congratulations ${user.name}!</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
              You are now officially enrolled in <strong>${course.title}</strong>. Your payment has been securely verified and your classroom is unlocked.
            </p>
            
            <div style="background-color: #F1F5F9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0F172A; margin-top: 0; font-size: 15px;">Transaction Receipt</h3>
              <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Course:</strong> ${course.title}</p>
              <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Category:</strong> ${course.category}</p>
              <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Amount Paid:</strong> ${payment.currency || 'PKR'} ${payment.amount}</p>
              <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Razorpay Order ID:</strong> ${payment.razorpayOrderId}</p>
              <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Payment Status:</strong> <span style="color: #10B981; font-weight: bold;">Captured (Verified)</span></p>
            </div>

            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/learn/${course._id}" style="background-color: #10B981; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                Start Learning Now
              </a>
            </div>
            
            <p style="color: #64748B; font-size: 13px; border-top: 1px solid #E2E8F0; padding-top: 15px; margin-bottom: 0;">
              Happy learning! Need help? Contact our student support anytime.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Enrollment confirmation sent to ${user.email} (ID: ${info.messageId})`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Preview] View HTML receipt: ${previewUrl}`);
    }

    return info;
  } catch (error) {
    console.error(`[Email Error] Failed to send enrollment email: ${error.message}`);
  }
};

module.exports = {
  sendRegistrationEmail,
  sendEnrollmentEmail
};



/**
 * Send Email Verification Link
 */
const sendVerificationEmail = async (user, token) => {
  try {
    const transporter = await createTransporter();
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const mailOptions = {
      from: '"LearnHub Team" <no-reply@learnhub.com>',
      to: user.email,
      subject: 'Verify Your Email Address - LearnHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F8FAFC; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0;">
          <div style="background-color: #0F172A; padding: 25px; border-radius: 8px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Verify Your <span style="color: #3B82F6;">Email</span></h1>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 25px; border-radius: 8px; margin-top: 15px; border: 1px solid #E2E8F0;">
            <h2 style="color: #0F172A; margin-top: 0;">Hi ${user.name},</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
              Please click the button below to confirm your email address and verify your LearnHub student account.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background-color: #3B82F6; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #94A3B8; font-size: 13px; line-height: 1.5;">
              Or copy and paste this link in your browser:<br>
              <a href="${verifyUrl}" style="color: #3B82F6;">${verifyUrl}</a>
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Verification link sent to ${user.email}`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Preview] View verification email: ${previewUrl}`);
    }

    return info;
  } catch (error) {
    console.error(`[Email Error] Failed to send verification email: ${error.message}`);
  }
};

/**
 * Send Password Reset Token Link
 */
const sendPasswordResetEmail = async (user, token) => {
  try {
    const transporter = await createTransporter();
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const mailOptions = {
      from: '"LearnHub Team" <no-reply@learnhub.com>',
      to: user.email,
      subject: 'Password Reset Request - LearnHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F8FAFC; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0;">
          <div style="background-color: #0F172A; padding: 25px; border-radius: 8px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Reset Your <span style="color: #FBBF24;">Password</span></h1>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 25px; border-radius: 8px; margin-top: 15px; border: 1px solid #E2E8F0;">
            <h2 style="color: #0F172A; margin-top: 0;">Hi ${user.name},</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
              You recently requested to reset your password for your LearnHub account. Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #EF4444; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #64748B; font-size: 13px; line-height: 1.5;">
              If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Password reset link sent to ${user.email}`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Preview] View password reset email: ${previewUrl}`);
    }

    return info;
  } catch (error) {
    console.error(`[Email Error] Failed to send password reset email: ${error.message}`);
  }
};

module.exports.sendVerificationEmail = sendVerificationEmail;
module.exports.sendPasswordResetEmail = sendPasswordResetEmail;
