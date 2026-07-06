// All direct SQL for posts, comments, reactions, and the location-based feed.
// The feed query is the most important one - it fetches posts from every
// location level the user belongs to, ranked by emergency first then recency.

const { query } = require('../config/db');

// ─── Posts ────────────────────────────────────────────────────────────────────

async function createPost({ authorId, locationId, type, title, body, mediaUrls, videoUrls, fileUrls, isEmergency, isPinned, geoPoint, expiresAt, spreadRadius }) {
  const res = await query(
    `INSERT INTO posts
       (author_id, location_id, type, title, body, media_urls, video_urls, file_urls, is_emergency, is_pinned, geo_point, expires_at, spread_radius)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
       CASE WHEN $11::text IS NOT NULL
            THEN ST_SetSRID(ST_GeomFromGeoJSON($11), 4326)::geography
            ELSE NULL END,
       $12, $13)
     RETURNING *`,
    [
      authorId,
      locationId,
      type,
      title || null,
      body,
      mediaUrls || [],
      videoUrls || [],
      fileUrls || [],
      isEmergency || false,
      isPinned || false,
      geoPoint ? JSON.stringify(geoPoint) : null,
      expiresAt || null,
      spreadRadius || null,
    ]
  );
  return res.rows[0];
}

function getPostSelectFields(userIdParamNumber) {
  const userIdVal = userIdParamNumber ? `$${userIdParamNumber}` : 'NULL';
  return `
    p.*,
    u.name AS author_name,
    u.avatar_url AS author_avatar,
    u.role AS author_role,
    l.name AS location_name,
    l.type AS location_type,
    (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) AS comment_count,
    (SELECT COUNT(*)::int FROM reactions r WHERE r.post_id = p.id) AS reaction_count,
    EXISTS(
      SELECT 1 FROM reactions r2
      WHERE r2.post_id = p.id AND r2.user_id = ${userIdVal}
    ) AS has_reacted,
    (
      SELECT row_to_json(e) FROM (
        SELECT start_time, end_time, venue, max_attendees, rsvp_count,
               EXISTS(
                 SELECT 1 FROM event_rsvps er
                 WHERE er.event_id = events.id AND er.user_id = ${userIdVal}
               ) AS has_rsvped
        FROM events
        WHERE events.post_id = p.id
      ) e
    ) AS event,
    (
      SELECT row_to_json(po_data) FROM (
        SELECT id, options, ends_at, is_anonymous,
               (
                 SELECT option_index FROM poll_votes pv
                 WHERE pv.poll_id = polls.id AND pv.user_id = ${userIdVal}
               ) AS voted_option_index,
               (
                 SELECT json_agg(v) FROM (
                   SELECT option_index, COUNT(*)::int AS count
                   FROM poll_votes pv2
                   WHERE pv2.poll_id = polls.id
                   GROUP BY option_index
                 ) v
               ) AS votes
        FROM polls
        WHERE polls.post_id = p.id
      ) po_data
    ) AS poll
  `;
}

async function findById(id, userId = null) {
  const fields = getPostSelectFields(userId ? 2 : null);
  const res = await query(
    `SELECT ${fields}
     FROM posts p
     JOIN users u ON u.id = p.author_id
     JOIN locations l ON l.id = p.location_id
     WHERE p.id = $1
       AND (p.expires_at IS NULL OR p.expires_at > NOW())`,
    userId ? [id, userId] : [id]
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

async function getFeedForUser(userId, { limit = 20, before, lat, lng } = {}) {
  const fields = getPostSelectFields(1);
  const hasCoords = lat !== undefined && lng !== undefined;

  const userPointSql = hasCoords
    ? `ST_SetSRID(ST_Point($4, $5), 4326)::geography`
    : `(SELECT centroid FROM locations WHERE id = (SELECT location_id FROM user_locations WHERE user_id = $1 AND is_primary = true))::geography`;

  const queryParams = [userId, limit, before || null];
  if (hasCoords) {
    queryParams.push(lng, lat);
  }

  const res = await query(
    `SELECT ${fields},
            CASE l.type
              WHEN 'society' THEN 1
              WHEN 'area'    THEN 2
              WHEN 'city'    THEN 3
              WHEN 'state'   THEN 4
              WHEN 'country' THEN 5
              ELSE 6
            END AS location_rank
     FROM posts p
     JOIN users u ON u.id = p.author_id
     JOIN locations l ON l.id = p.location_id
     WHERE (
             p.location_id IN (
               SELECT location_id FROM user_locations WHERE user_id = $1
             )
             OR (
               p.spread_radius IS NOT NULL
               AND p.geo_point IS NOT NULL
               AND ST_DWithin(
                 p.geo_point::geography,
                 ${userPointSql},
                 p.spread_radius * 1000
               )
             )
           )
       AND (p.expires_at IS NULL OR p.expires_at > NOW())
       AND ($3::timestamptz IS NULL OR p.created_at < $3)
     ORDER BY
       p.is_emergency DESC,
       p.is_pinned DESC,
       p.created_at DESC
     LIMIT $2`,
    queryParams
  );
  return res.rows;
}

async function getPostsByUser(userId, { limit = 20, before } = {}) {
  const fields = getPostSelectFields(1);
  const res = await query(
    `SELECT ${fields}
     FROM posts p
     JOIN users u ON u.id = p.author_id
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

async function getPostsByTypeAndLocation(locationId, type, userId, { limit = 20, before } = {}) {
  const fields = getPostSelectFields(3);
  const res = await query(
    `SELECT ${fields}
     FROM posts p
     JOIN users u ON u.id = p.author_id
     JOIN locations l ON l.id = p.location_id
     WHERE p.location_id = $1
       AND p.type = $2
       AND (p.expires_at IS NULL OR p.expires_at > NOW())
       AND ($5::timestamptz IS NULL OR p.created_at < $5)
     ORDER BY p.is_pinned DESC, p.created_at DESC
     LIMIT $4`,
    [locationId, type, userId, limit, before || null]
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