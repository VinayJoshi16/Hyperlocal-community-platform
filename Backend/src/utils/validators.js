// Request body validators using Zod.
// Controllers call these before touching the database - never trust client input.

const { z } = require('zod');

const sendOtpSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  code: z.string().length(6, 'OTP must be 6 digits'),
  name: z.string().min(2).max(80).optional(), // collected on first signup
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  avatarUrl: z.string().url().optional(),
});

const setLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  locationId: z.string().uuid('Invalid location UUID'),
  phone: z.string().optional(),
});

const verifyRegistrationSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password is required'),
});

module.exports = {
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  updateProfileSchema,
  setLocationSchema,
  registerSchema,
  verifyRegistrationSchema,
  loginSchema,
};