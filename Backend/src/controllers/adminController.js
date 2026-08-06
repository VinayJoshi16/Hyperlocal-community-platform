const { query } = require('../config/db');
const { asyncHandler, ok, fail } = require('../utils/helpers');
const tokenService = require('../services/tokenService');

// GET /api/admin/dashboard
// Returns basic stats for the admin dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const usersCountResult = await query('SELECT COUNT(*) FROM users');
  const postsCountResult = await query('SELECT COUNT(*) FROM posts');
  const pendingPostsResult = await query('SELECT COUNT(*) FROM posts WHERE is_held_for_review = true');

  return ok(res, {
    totalUsers: parseInt(usersCountResult.rows[0].count, 10),
    totalPosts: parseInt(postsCountResult.rows[0].count, 10),
    pendingReviews: parseInt(pendingPostsResult.rows[0].count, 10),
  });
});

// GET /api/admin/users
// Returns a list of all users
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search = '' } = req.query;
  const offset = (page - 1) * limit;

  let queryStr = 'SELECT id, email, name, role, is_verified, is_blocked, created_at FROM users';
  let queryParams = [];

  if (search) {
    queryStr += ' WHERE email ILIKE $1 OR name ILIKE $1';
    queryParams.push(`%${search}%`);
  }

  queryStr += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
  queryParams.push(limit, offset);

  const result = await query(queryStr, queryParams);
  
  // Count total for pagination
  let countQueryStr = 'SELECT COUNT(*) FROM users';
  let countParams = [];
  if (search) {
    countQueryStr += ' WHERE email ILIKE $1 OR name ILIKE $1';
    countParams.push(`%${search}%`);
  }
  const countResult = await query(countQueryStr, countParams);

  return ok(res, {
    users: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  });
});

// PATCH /api/admin/users/:id/block
// Toggles a user's blocked status
const toggleBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_blocked } = req.body;

  // Prevent admin from blocking themselves
  if (id === req.user.id) {
    return fail(res, 'You cannot block yourself.', 400);
  }

  const result = await query(
    'UPDATE users SET is_blocked = $1 WHERE id = $2 RETURNING id, email, is_blocked',
    [is_blocked, id]
  );

  if (result.rows.length === 0) {
    return fail(res, 'User not found', 404);
  }

  // If we are blocking the user, revoke all their sessions
  if (is_blocked) {
    await tokenService.revokeAllUserTokens(id);
  }

  return ok(res, {
    message: `User ${is_blocked ? 'blocked' : 'unblocked'} successfully.`,
    user: result.rows[0]
  });
});

// GET /api/admin/posts
// Returns a list of posts
const getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, status = 'all' } = req.query; // status: all, pending, approved
  const offset = (page - 1) * limit;

  let whereClauses = [];
  let queryParams = [];

  if (status === 'pending') {
    whereClauses.push('p.is_held_for_review = true');
  } else if (status === 'approved') {
    whereClauses.push('p.is_held_for_review = false');
  }

  let whereStr = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  const queryStr = `
    SELECT p.id, p.title, p.body, p.type, p.is_held_for_review, p.moderation_reason, p.created_at,
           u.name as author_name, u.email as author_email
    FROM posts p
    JOIN users u ON p.author_id = u.id
    ${whereStr}
    ORDER BY p.created_at DESC
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
  `;
  
  queryParams.push(limit, offset);

  const result = await query(queryStr, queryParams);

  // Count
  const countQueryStr = `SELECT COUNT(*) FROM posts p ${whereStr}`;
  const countResult = await query(countQueryStr, whereClauses.length > 0 ? [] : []);
  // Wait, if whereClauses has no parameters but just true/false, we can just pass empty array.
  
  return ok(res, {
    posts: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  });
});

// PATCH /api/admin/posts/:id/moderate
// Approves or Rejects an AI flagged post
const moderatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  if (action === 'approve') {
    const result = await query(
      'UPDATE posts SET is_held_for_review = false, moderation_reason = NULL WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) return fail(res, 'Post not found', 404);
    return ok(res, { message: 'Post approved.' });
  } else if (action === 'reject') {
    // We'll just delete the post entirely
    const result = await query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return fail(res, 'Post not found', 404);
    return ok(res, { message: 'Post rejected and deleted.' });
  } else {
    return fail(res, 'Invalid action. Use "approve" or "reject".', 400);
  }
});

module.exports = {
  getDashboardStats,
  getUsers,
  toggleBlockUser,
  getPosts,
  moderatePost
};
