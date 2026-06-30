// Small reusable helpers used across controllers/services.

// Generates a random 6-digit numeric OTP as a string, e.g. "045821"
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Wraps an async route handler so thrown errors are passed to Express's
// error middleware instead of crashing the process or hanging the request.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Standard success response shape used by all controllers.
function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

// Standard error response shape.
function fail(res, message, status = 400, details) {
  return res.status(status).json({ success: false, message, details });
}

module.exports = { generateOtpCode, asyncHandler, ok, fail };