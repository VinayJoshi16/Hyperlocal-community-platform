// Signs and verifies JWT access/refresh tokens, and manages refresh token
// storage in the database for revocation support (logout, "log out everywhere").

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/db');
const config = require('../config/env');

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry }
  );
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Parses "30d" / "15m" style strings into a millisecond duration.
function parseExpiryToMs(expiry) {
  const match = /^(\d+)([smhd])$/.exec(expiry);
  if (!match) return 30 * 24 * 60 * 60 * 1000; // default 30 days
  const [, amount, unit] = match;
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return Number(amount) * multipliers[unit];
}

async function storeRefreshToken(userId, refreshToken) {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseExpiryToMs(config.jwt.refreshExpiry));

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
}

async function isRefreshTokenValid(userId, refreshToken) {
  const tokenHash = hashToken(refreshToken);
  const res = await query(
    `SELECT * FROM refresh_tokens
     WHERE user_id = $1 AND token_hash = $2 AND revoked = false AND expires_at > NOW()`,
    [userId, tokenHash]
  );
  return res.rows.length > 0;
}

async function revokeRefreshToken(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  await query(`UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1`, [tokenHash]);
}

async function revokeAllUserTokens(userId) {
  await query(`UPDATE refresh_tokens SET revoked = true WHERE user_id = $1`, [userId]);
}

async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await storeRefreshToken(user.id, refreshToken);
  return { accessToken, refreshToken };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  storeRefreshToken,
  isRefreshTokenValid,
  revokeRefreshToken,
  revokeAllUserTokens,
  issueTokenPair,
};