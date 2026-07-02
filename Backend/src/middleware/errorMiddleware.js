// Centralized error handler. Must be registered LAST in app.js (after all routes).
// Any error passed to next(err) anywhere in the app lands here.
// This means controllers never need to write their own try/catch error responses -
// they just throw and asyncHandler() forwards it here.

const { ZodError } = require('zod');
const { OtpError } = require('../services/otpService');

function errorMiddleware(err, req, res, next) {
  // Log every error in development for easier debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', err);
  } else {
    // In production only log unexpected errors, not known app errors
    if (!err.status || err.status >= 500) {
      console.error('[Error]', err.message, err.stack);
    }
  }

  // Zod validation errors - bad request body from client
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // OTP-specific errors (rate limit, expired, wrong code, etc.)
  if (err instanceof OtpError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  // JWT errors not already caught by authMiddleware
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }

  // Postgres unique constraint violations (e.g. duplicate email)
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
      detail: err.detail,
    });
  }

  // Postgres foreign key violations
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist.',
    });
  }

  // Known app errors with a status code set deliberately
  if (err.status && err.status < 500) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  // Everything else is an unexpected server error
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong. Please try again later.'
        : err.message,
  });
}

// 404 handler - register this BEFORE errorMiddleware but AFTER all routes
function notFoundMiddleware(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorMiddleware, notFoundMiddleware };