// All direct SQL for the otps table.
// We store a bcrypt hash of the code, never the plaintext OTP, so a DB leak
// alone cannot be used to log in as someone.

const { query } = require('../config/db');
const bcrypt = require('bcryptjs');
const config = require('../config/env');

async function createOtp(email, code) {
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

  // Invalidate any previous unused OTPs for this email before issuing a new one
  await query('DELETE FROM otps WHERE email = $1', [email.toLowerCase()]);

  const res = await query(
    `INSERT INTO otps (email, code_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, email, expires_at`,
    [email.toLowerCase(), codeHash, expiresAt]
  );
  return res.rows[0];
}

async function getLatestOtp(email) {
  const res = await query(
    `SELECT * FROM otps WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
    [email.toLowerCase()]
  );
  return res.rows[0] || null;
}

async function incrementAttempts(otpId) {
  await query('UPDATE otps SET attempts = attempts + 1 WHERE id = $1', [otpId]);
}

async function deleteOtp(email) {
  await query('DELETE FROM otps WHERE email = $1', [email.toLowerCase()]);
}

// Counts OTP requests created in the last hour for this email - used for rate limiting.
async function countRecentOtps(email) {
  const res = await query(
    `SELECT COUNT(*)::int AS count FROM otps
     WHERE email = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
    [email.toLowerCase()]
  );
  return res.rows[0].count;
}

module.exports = {
  createOtp,
  getLatestOtp,
  incrementAttempts,
  deleteOtp,
  countRecentOtps,
};