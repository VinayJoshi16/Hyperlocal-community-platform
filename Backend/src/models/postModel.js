// All direct SQL for posts, comments, reactions, and the location-based feed.
// The feed query is the most important one - it fetches posts from every
// location level the user belongs to, ranked by emergency first then recency.

const { query } = require('../config/db');

// ─── Posts ────────────────────────────────────────────────────────────────────

async function createPost({ authorId, locationId, type, title, body, mediaUrls, isEmergency, isPinned, geoPoint, expiresAt }) {
  const res = await query(
    `INSERT INTO posts
       (author_id, location_id, type, title, body, media_urls, is_emergency, is_pinned, geo_point, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
       CASE WHEN $9::text IS NOT NULL
            THEN ST_SetSRID(ST_GeomFromGeoJSON($9), 4326)::geography
            ELSE NULL END,
       $10)
     RETURNING *`,
    [
      authorId,
      locationId,
      type,
      title || null,
      body,
      mediaUrls || [],
      isEmergency || false,
      isPinned || false,
      geoPoint ? JSON.stringify(geoPoint) : null,
      expiresAt || null,
    ]
  );
  return res.rows[0];
}

async function findById(id) {
  const res = await query(
    `SELECT p.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar,
            u.role AS author_role,
            l.name AS location_name,
            l.type AS location_type,
            (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) AS comment_count,
            (SELECT COUNT(*)::int FROM reactions r WHERE r.post_id = p.id) AS reaction_count
     FROM posts p
     JOIN users u ON u.id = p.author_id
     JOIN locations l ON l.id = p.location_id
     WHERE p.id = $1
       AND (p.expires_at IS NULL OR p.expires_at > NOW())`,
    [id]
  );
  return res.rows[0] || null;
}

async function deletePost(id) {
  await query('DELETE FROM posts WHERE id = $1', [id]);
}

async function pinPost(id, isPinned) {
  const res = await query(
    'UPDATE posts SET is_pinned = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id, isPinned]
  );
  return res.rows[0];
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

async function getFeedForUser(userId, { limit = 20, before } = {}) {
  const res = await query(
    `SELECT p.*,
            u.name  AS author_name,
            u.avatar_url AS author_avatar,
            u.role  AS author_role,
            l.name  AS location_name,
            l.type  AS location_type,
            CASE l.type
              WHEN 'society' THEN 1
              WHEN 'area'    THEN 2
              WHEN 'city'    THEN 3
              WHEN 'state'   THEN 4
              WHEN 'country' THEN 5
              ELSE 6
            END AS location_rank,
            (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) AS comment_count,
            (SELECT COUNT(*)::int FROM reactions r WHERE r.post_id = p.id) AS reaction_count,
            EXISTS(
              SELECT 1 FROM reactions r2
              WHERE r2.post_id = p.id AND r2.user_id = $1
            ) AS has_reacted
     FROM posts p
     JOIN users u ON u.id = p.author_id
     JOIN locations l ON l.id = p.location_id
     WHERE p.location_id IN (
             SELECT location_id FROM user_locations WHERE user_id = $1
           )
       AND (p.expires_at IS NULL OR p.expires_at > NOW())
       AND ($3::timestamptz IS NULL OR p.created_at < $3)
     ORDER BY
       p.is_emergency DESC,
       p.is_pinned DESC,
       p.created_at DESC
     LIMIT $2`,
    [userId, limit, before || null]
  );
  return res.rows;
}

async function getPostsByUser(userId, { limit = 20, before } = {}) {
  const res = await query(
    `SELECT p.*,
            l.name AS location_name,
            l.type AS location_type,
            (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) AS comment_count,
            (SELECT COUNT(*)::int FROM reactions r WHERE r.post_id = p.id) AS reaction_count
     FROM posts p
     JOIN locations l ON l.id = p.location_id
     WHERE p.author_id = $1
       AND (p.expires_at IS NULL OR p.expires_at > NOW())
       AND ($3::timestamptz IS NULL OR p.created_at < $3)
     ORDER BY p.created_at DESC
     LIMIT $2`,
    [userId, limit, before || null]
  );
  return res.rows;
}

async function getPostsByTypeAndLocation(locationId, type, { limit = 20, before } = {}) {
  const res = await query(
    `SELECT p.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar,
            (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) AS comment_count,
            (SELECT COUNT(*)::int FROM reactions r WHERE r.post_id = p.id) AS reaction_count
     FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.location_id = $1
       AND p.type = $2
       AND (p.expires_at IS NULL OR p.expires_at > NOW())
       AND ($4::timestamptz IS NULL OR p.created_at < $4)
     ORDER BY p.is_pinned DESC, p.created_at DESC
     LIMIT $3`,
    [locationId, type, limit, before || null]
  );
  return res.rows;
}

// ─── Comments ────────────────────────────────────────────────────────────────

async function getComments(postId) {
  const res = await query(
    `SELECT c.*,
            u.name AS author_name,
            u.avatar_url AS author_avatar,
            u.role AS author_role
     FROM comments c
     JOIN users u ON u.id = c.author_id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId]
  );
  return res.rows;
}

async function createComment({ postId, authorId, body, parentId }) {
  const res = await query(
    `INSERT INTO comments (post_id, author_id, body, parent_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [postId, authorId, body, parentId || null]
  );
  return res.rows[0];
}

async function deleteComment(id) {
  await query('DELETE FROM comments WHERE id = $1', [id]);
}

// ─── Reactions ───────────────────────────────────────────────────────────────

async function toggleReaction(postId, userId, emoji = 'like') {
  const existing = await query(
    'SELECT * FROM reactions WHERE post_id = $1 AND user_id = $2',
    [postId, userId]
  );

  if (existing.rows.length > 0) {
    await query('DELETE FROM reactions WHERE post_id = $1 AND user_id = $2', [postId, userId]);
    return { action: 'removed' };
  }

  await query(
    'INSERT INTO reactions (post_id, user_id, emoji) VALUES ($1, $2, $3)',
    [postId, userId, emoji]
  );
  return { action: 'added' };
}

async function getReactionCounts(postId) {
  const res = await query(
    `SELECT emoji, COUNT(*)::int AS count
     FROM reactions
     WHERE post_id = $1
     GROUP BY emoji`,
    [postId]
  );
  return res.rows;
}

module.exports = {
  createPost,
  findById,
  deletePost,
  pinPost,
  getFeedForUser,
  getPostsByUser,
  getPostsByTypeAndLocation,
  getComments,
  createComment,
  deleteComment,
  toggleReaction,
  getReactionCounts,
};