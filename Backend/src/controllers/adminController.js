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
// Returns a list of all users with location details and supports searching & location filtering
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search = '', location = '', type = '' } = req.query;
  const offset = (page - 1) * limit;

  let whereClauses = [];
  let queryParams = [];

  if (search && search.trim()) {
    queryParams.push(`%${search.trim()}%`);
    whereClauses.push(`(u.email ILIKE $${queryParams.length} OR u.name ILIKE $${queryParams.length})`);
  }

  if (location && location.trim()) {
    queryParams.push(`%${location.trim()}%`);
    whereClauses.push(`EXISTS (
      SELECT 1 FROM user_locations ul_filter
      JOIN locations l_filter ON l_filter.id = ul_filter.location_id
      WHERE ul_filter.user_id = u.id AND l_filter.name ILIKE $${queryParams.length}
    )`);
  }

  if (type && type.trim() && type !== 'all') {
    queryParams.push(type.trim());
    whereClauses.push(`EXISTS (
      SELECT 1 FROM user_locations ul_filter
      JOIN locations l_filter ON l_filter.id = ul_filter.location_id
      WHERE ul_filter.user_id = u.id AND l_filter.type = $${queryParams.length}
    )`);
  }

  const whereStr = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  // Get users
  const usersQuery = `
    SELECT u.id, u.email, u.name, u.role, u.is_verified, u.is_blocked, u.created_at
    FROM users u
    ${whereStr}
    ORDER BY u.created_at DESC
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
  `;
  const usersParams = [...queryParams, limit, offset];
  const usersResult = await query(usersQuery, usersParams);

  // Get locations for these users in one batch query
  const userIds = usersResult.rows.map((u) => u.id);
  let locationsMap = {};

  if (userIds.length > 0) {
    const locQuery = `
      SELECT ul.user_id, ul.is_primary, l.id, l.name, l.type
      FROM user_locations ul
      JOIN locations l ON l.id = ul.location_id
      WHERE ul.user_id = ANY($1)
      ORDER BY ul.is_primary DESC, l.type ASC
    `;
    const locResult = await query(locQuery, [userIds]);
    for (const row of locResult.rows) {
      if (!locationsMap[row.user_id]) locationsMap[row.user_id] = [];
      locationsMap[row.user_id].push({
        id: row.id,
        name: row.name,
        type: row.type,
        is_primary: row.is_primary,
      });
    }
  }

  // Attach locations to each user
  const users = usersResult.rows.map((u) => ({
    ...u,
    locations: locationsMap[u.id] || null,
  }));

  // Count
  const countQueryStr = `SELECT COUNT(*) FROM users u ${whereStr}`;
  const countResult = await query(countQueryStr, queryParams);

  return ok(res, {
    users,
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

// GET /api/admin/locations
const getLocations = asyncHandler(async (req, res) => {
  const result = await query('SELECT id, name, type FROM locations ORDER BY name ASC');
  return ok(res, { locations: result.rows });
});

// POST /api/admin/posts
const createAdminPost = asyncHandler(async (req, res) => {
  const { title, body, type = 'notice', locationId } = req.body;
  if (!body || !body.trim()) return fail(res, 'Post body is required', 400);

  let targetLocId = locationId;
  if (!targetLocId) {
    const locRes = await query('SELECT id FROM locations LIMIT 1');
    if (locRes.rows.length === 0) return fail(res, 'No location found on platform', 400);
    targetLocId = locRes.rows[0].id;
  }

  const insertRes = await query(
    `INSERT INTO posts (author_id, location_id, type, title, body, is_held_for_review)
     VALUES ($1, $2, $3, $4, $5, false)
     RETURNING *`,
    [req.user.id, targetLocId, type, title ? title.trim() : null, body.trim()]
  );

  return ok(res, { post: insertRes.rows[0] }, 201);
});

module.exports = {
  getDashboardStats,
  getUsers,
  toggleBlockUser,
  getPosts,
  moderatePost,
  getLocations,
  createAdminPost
};
