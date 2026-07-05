// All direct SQL for the users table lives here.
// Controllers/services never write raw SQL themselves - they call these functions.

const { query } = require('../config/db');

async function findByEmail(email) {
  const res = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return res.rows[0] || null;
}

async function findById(id) {
  const res = await query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function createUser({ email, name, role = 'user', isVerified = false, passwordHash = null }) {
  const res = await query(
    `INSERT INTO users (email, name, role, is_verified, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [email.toLowerCase(), name || null, role, isVerified, passwordHash]
  );
  return res.rows[0];
}

async function updateUnverifiedUser(userId, { name, passwordHash }) {
  const res = await query(
    `UPDATE users
     SET name = $2, password_hash = $3, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, name, passwordHash]
  );
  return res.rows[0];
}

async function markVerified(userId) {
  const res = await query(
    `UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [userId]
  );
  return res.rows[0];
}

async function updateProfile(userId, { name, avatarUrl }) {
  const res = await query(
    `UPDATE users
     SET name = COALESCE($2, name),
         avatar_url = COALESCE($3, avatar_url),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, name, avatarUrl]
  );
  return res.rows[0];
}

async function updateFcmToken(userId, fcmToken) {
  await query('UPDATE users SET fcm_token = $2 WHERE id = $1', [userId, fcmToken]);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateUnverifiedUser,
  markVerified,
  updateProfile,
  updateFcmToken,
};