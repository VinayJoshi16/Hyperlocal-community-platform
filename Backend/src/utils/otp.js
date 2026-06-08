const crypto = require('crypto');

// Generate a 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}
// OTP expires in 10 minutes
function getOTPExpiry() {
  return new Date(Date.now() + 10 * 60 * 1000);
}

module.exports = { generateOTP, getOTPExpiry };