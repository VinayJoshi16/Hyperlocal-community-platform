// Auth route handlers. Controllers are thin - they validate input, call a
// service, and return a response. All business logic lives in services/.

const otpService = require('../services/otpService');
const tokenService = require('../services/tokenService');
const userModel = require('../models/userModel');
const { sendOtpSchema, verifyOtpSchema, refreshTokenSchema, updateProfileSchema } = require('../utils/validators');
const { asyncHandler, ok, fail } = require('../utils/helpers');

// POST /api/auth/send-otp
// Sends a 6-digit OTP to the provided email address.
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = sendOtpSchema.parse(req.body);
  const result = await otpService.requestOtp(email);
  return ok(res, {
    message: `Verification code sent to ${email}. Check your inbox.`,
    expiresInMinutes: result.expiresInMinutes,
  });
});

// POST /api/auth/verify-otp
// Verifies the OTP, creates/signs in the user, returns token pair.
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code, name } = verifyOtpSchema.parse(req.body);
  const { user, isNewUser } = await otpService.verifyOtp(email, code, name);
  const { accessToken, refreshToken } = await tokenService.issueTokenPair(user);

  return ok(
    res,
    {
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
      isNewUser,
    },
    isNewUser ? 201 : 200
  );
});

// POST /api/auth/refresh
// Issues a new access token using a valid refresh token.
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);

  let decoded;
  try {
    decoded = tokenService.verifyRefreshToken(refreshToken);
  } catch (err) {
    return fail(res, 'Refresh token is invalid or has expired. Please sign in again.', 401);
  }

  const isValid = await tokenService.isRefreshTokenValid(decoded.sub, refreshToken);
  if (!isValid) {
    return fail(res, 'Refresh token has been revoked. Please sign in again.', 401);
  }

  const user = await userModel.findById(decoded.sub);
  if (!user) {
    return fail(res, 'User not found.', 404);
  }

  // Rotate: revoke the old refresh token and issue a fresh pair
  await tokenService.revokeRefreshToken(refreshToken);
  const { accessToken, refreshToken: newRefreshToken } = await tokenService.issueTokenPair(user);

  return ok(res, { accessToken, refreshToken: newRefreshToken });
});

// POST /api/auth/logout
// Revokes the provided refresh token so it cannot be used again.
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);
  await tokenService.revokeRefreshToken(refreshToken);
  return ok(res, { message: 'Logged out successfully.' });
});

// POST /api/auth/logout-all
// Revokes ALL refresh tokens for this user (log out of every device).
const logoutAll = asyncHandler(async (req, res) => {
  await tokenService.revokeAllUserTokens(req.user.id);
  return ok(res, { message: 'Logged out of all devices.' });
});

// GET /api/auth/me
// Returns the current authenticated user's profile.
const getMe = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  if (!user) return fail(res, 'User not found.', 404);
  return ok(res, { user: sanitizeUser(user) });
});

// PATCH /api/auth/me
// Updates name or avatar for the current user.
const updateMe = asyncHandler(async (req, res) => {
  const data = updateProfileSchema.parse(req.body);
  const updated = await userModel.updateProfile(req.user.id, {
    name: data.name,
    avatarUrl: data.avatarUrl,
  });
  return ok(res, { user: sanitizeUser(updated) });
});

// Strip sensitive fields before sending user object to client
function sanitizeUser(user) {
  const { fcm_token, ...safe } = user;
  return safe;
}

module.exports = { sendOtp, verifyOtp, refresh, logout, logoutAll, getMe, updateMe };