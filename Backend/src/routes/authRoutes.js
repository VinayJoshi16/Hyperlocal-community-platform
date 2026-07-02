// Auth routes. Middleware order matters:
// public routes  -> no middleware before controller
// protected routes -> authMiddleware -> controller

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  sendOtp,
  verifyOtp,
  refresh,
  logout,
  logoutAll,
  getMe,
  updateMe,
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Strict rate limiter specifically for OTP sending -
// max 5 requests per 15 minutes per IP regardless of the per-email
// limit already enforced inside otpService.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many OTP requests from this device. Please wait 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General auth limiter - looser, just prevents brute-forcing verify endpoint
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Public routes (no JWT required) ─────────────────────────────────────────

// Send OTP to email
router.post('/send-otp', otpLimiter, sendOtp);

// Verify OTP → returns accessToken + refreshToken
router.post('/verify-otp', authLimiter, verifyOtp);

// Exchange refresh token for a new access token
router.post('/refresh', authLimiter, refresh);

// Logout (revoke refresh token) - auth optional, works even with expired access token
router.post('/logout', logout);

// ─── Protected routes (JWT required) ─────────────────────────────────────────

// Get current user profile
router.get('/me', authMiddleware, getMe);

// Update name / avatar
router.patch('/me', authMiddleware, updateMe);

// Logout from all devices
router.post('/logout-all', authMiddleware, logoutAll);

module.exports = router;