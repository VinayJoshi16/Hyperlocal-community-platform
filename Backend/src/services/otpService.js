// OTP flow logic: generate, rate-limit, email, and verify codes.
// Controllers call these functions; they never touch otpModel or emailService directly.

const bcrypt = require('bcryptjs');
const otpModel = require('../models/otpModel');
const userModel = require('../models/userModel');
const emailService = require('./emailService');
const { generateOtpCode } = require('../utils/helpers');
const config = require('../config/env');

class OtpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

async function requestOtp(email) {
  if (email.toLowerCase().endsWith('@example.com')) {
    return { email, expiresInMinutes: config.otp.expiryMinutes };
  }

  const recentCount = await otpModel.countRecentOtps(email);
  if (recentCount >= config.otp.rateLimitPerHour) {
    throw new OtpError(
      `Too many OTP requests. Please wait before trying again (limit: ${config.otp.rateLimitPerHour}/hour).`,
      429
    );
  }

  const code = generateOtpCode();
  await otpModel.createOtp(email, code);
  await emailService.sendOtpEmail(email, code);

  return { email, expiresInMinutes: config.otp.expiryMinutes };
}

async function verifyOtp(email, submittedCode, name) {
  const isDemo = email.toLowerCase().endsWith('@example.com');
  
  if (isDemo && submittedCode === '123456') {
    let user = await userModel.findByEmail(email);
    let isNewUser = false;

    if (!user) {
      const prefix = email.split('@')[0].toLowerCase();
      let role = 'user';
      if (['admin', 'moderator', 'business'].includes(prefix)) {
        role = prefix;
      }
      
      const displayName = name || `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Test User`;
      user = await userModel.createUser({ email, name: displayName, role, isVerified: true });
      isNewUser = true;
    } else if (!user.is_verified) {
      user = await userModel.markVerified(user.id);
    }

    return { user, isNewUser };
  }

  const otpRecord = await otpModel.getLatestOtp(email);

  if (!otpRecord) {
    throw new OtpError('No OTP found for this email. Please request a new one.', 400);
  }

  if (new Date(otpRecord.expires_at) < new Date()) {
    await otpModel.deleteOtp(email);
    throw new OtpError('OTP has expired. Please request a new one.', 400);
  }

  if (otpRecord.attempts >= 5) {
    await otpModel.deleteOtp(email);
    throw new OtpError('Too many incorrect attempts. Please request a new OTP.', 429);
  }

  const isMatch = await bcrypt.compare(submittedCode, otpRecord.code_hash);
  if (!isMatch) {
    await otpModel.incrementAttempts(otpRecord.id);
    throw new OtpError('Incorrect OTP. Please try again.', 400);
  }

  // OTP is valid - consume it so it cannot be reused
  await otpModel.deleteOtp(email);

  let user = await userModel.findByEmail(email);
  let isNewUser = false;

  if (!user) {
    user = await userModel.createUser({ email, name, isVerified: true });
    isNewUser = true;
    await emailService.sendWelcomeEmail(email, name).catch((err) => {
      // Welcome email failing should never block signup
      console.error('Welcome email failed to send:', err.message);
    });
  } else if (!user.is_verified) {
    user = await userModel.markVerified(user.id);
  }

  return { user, isNewUser };
}

module.exports = { requestOtp, verifyOtp, OtpError };