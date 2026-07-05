// Auth route handlers. Controllers are thin - they validate input, call a
// service, and return a response. All business logic lives in services/.

const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const otpService = require('../services/otpService');
const tokenService = require('../services/tokenService');
const userModel = require('../models/userModel');
const { 
  sendOtpSchema, 
  verifyOtpSchema, 
  refreshTokenSchema, 
  updateProfileSchema,
  registerSchema,
  verifyRegistrationSchema,
  loginSchema
} = require('../utils/validators');
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

// POST /api/auth/register
// Registers a new unverified user, links primary location, and triggers OTP.
const register = asyncHandler(async (req, res) => {
  const { name, email, password, locationId } = registerSchema.parse(req.body);

  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    if (existingUser.is_verified) {
      return fail(res, 'An account with this email already exists.', 400);
    }
    
    // User exists but is unverified - we can update their name/password, and re-trigger OTP
    const passwordHash = await bcrypt.hash(password, 10);
    await userModel.updateUnverifiedUser(existingUser.id, { name, passwordHash });
    
    // Update location to new selected location if different
    await query(
      `INSERT INTO user_locations (user_id, location_id, is_primary)
       VALUES ($1, $2, true)
       ON CONFLICT (user_id, location_id) DO UPDATE SET is_primary = true`,
      [existingUser.id, locationId]
    );

    const result = await otpService.requestOtp(email);
    return ok(res, {
      message: `Verification code sent to ${email}. Check your inbox.`,
      expiresInMinutes: result.expiresInMinutes,
    });
  }

  // Brand new user registration
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.createUser({
    email,
    name,
    isVerified: false,
    passwordHash,
  });

  // Link location
  await query(
    `INSERT INTO user_locations (user_id, location_id, is_primary)
     VALUES ($1, $2, true)
     ON CONFLICT (user_id, location_id) DO UPDATE SET is_primary = true`,
    [user.id, locationId]
  );

  const result = await otpService.requestOtp(email);
  return ok(res, {
    message: `Verification code sent to ${email}. Check your inbox.`,
    expiresInMinutes: result.expiresInMinutes,
  });
});

// POST /api/auth/verify-registration
// Verifies registration OTP and activates the user.
const verifyRegistration = asyncHandler(async (req, res) => {
  const { email, code } = verifyRegistrationSchema.parse(req.body);
  const { user } = await otpService.verifyOtp(email, code);
  const { accessToken, refreshToken } = await tokenService.issueTokenPair(user);

  // Ensure the user has a primary location linked
  const locationCheck = await query(
    'SELECT 1 FROM user_locations WHERE user_id = $1 AND is_primary = true',
    [user.id]
  );
  if (locationCheck.rows.length === 0) {
    await query(
      `INSERT INTO user_locations (user_id, location_id, is_primary)
       VALUES ($1, '55555555-5555-5555-5555-555555555555', true)
       ON CONFLICT (user_id, location_id) DO UPDATE SET is_primary = true`,
      [user.id]
    );
  }

  return ok(res, {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  });
});

// POST /api/auth/login
// Logs in verified users using email + password (with demo account bypass).
const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const isDemo = email.toLowerCase().endsWith('@example.com');

  const user = await userModel.findByEmail(email);
  if (!user) {
    return fail(res, 'Invalid email or password.', 401);
  }

  if (!user.is_verified) {
    return fail(res, 'Please verify your email address first.', 403);
  }

  if (isDemo && password === '123456') {
    // Demo bypass: log in directly
    const { accessToken, refreshToken } = await tokenService.issueTokenPair(user);
    
    // Ensure the user has a primary location linked
    const locationCheck = await query(
      'SELECT 1 FROM user_locations WHERE user_id = $1 AND is_primary = true',
      [user.id]
    );
    if (locationCheck.rows.length === 0) {
      await query(
        `INSERT INTO user_locations (user_id, location_id, is_primary)
         VALUES ($1, '55555555-5555-5555-5555-555555555555', true)
         ON CONFLICT (user_id, location_id) DO UPDATE SET is_primary = true`,
        [user.id]
      );
    }

    return ok(res, {
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    });
  }

  // Regular password verify
  if (!user.password_hash) {
    return fail(res, 'Invalid email or password.', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return fail(res, 'Invalid email or password.', 401);
  }

  const { accessToken, refreshToken } = await tokenService.issueTokenPair(user);

  // Ensure the user has a primary location linked
  const locationCheck = await query(
    'SELECT 1 FROM user_locations WHERE user_id = $1 AND is_primary = true',
    [user.id]
  );
  if (locationCheck.rows.length === 0) {
    await query(
      `INSERT INTO user_locations (user_id, location_id, is_primary)
       VALUES ($1, '55555555-5555-5555-5555-555555555555', true)
       ON CONFLICT (user_id, location_id) DO UPDATE SET is_primary = true`,
      [user.id]
    );
  }

  return ok(res, {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  });
});

// Strip sensitive fields before sending user object to client
function sanitizeUser(user) {
  const { fcm_token, password_hash, ...safe } = user;
  return safe;
}

module.exports = {
  sendOtp,
  verifyOtp,
  refresh,
  logout,
  logoutAll,
  getMe,
  updateMe,
  register,
  verifyRegistration,
  login,
};