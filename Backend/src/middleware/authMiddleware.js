// Verifies the JWT access token on protected routes and attaches the
// decoded user info to req.user. Every controller that needs to know
// "who is making this request" relies on this running first.

const tokenService = require('../services/tokenService');
const { fail } = require('../utils/helpers');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail(res, 'Authentication required. Missing or malformed Authorization header.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = tokenService.verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return fail(res, 'Access token expired. Use /auth/refresh to get a new one.', 401);
    }
    return fail(res, 'Invalid access token.', 401);
  }
}

// Like authMiddleware, but does not fail if no token is present -
// useful for routes that behave differently for logged-in vs anonymous users.
function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = tokenService.verifyAccessToken(token);
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };
  } catch (err) {
    req.user = null;
  }
  next();
}

module.exports = { authMiddleware, optionalAuthMiddleware };