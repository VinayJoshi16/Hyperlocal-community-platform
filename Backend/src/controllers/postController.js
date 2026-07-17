// Post route handlers. Covers the feed, post CRUD, comments, and reactions.
// Emergency and pinned post actions are gated by RBAC middleware in the routes file.

const postModel = require('../models/postModel');
const locationModel = require('../models/locationModel');
const aiService = require('../services/aiService');
const { sendPushNotificationToNearbyUsers } = require('../services/webPushService');
const { query } = require('../config/db');
const { asyncHandler, ok, fail } = require('../utils/helpers');
const { z } = require('zod');

// ─── Validation schemas (inline, post-specific) ───────────────────────────────

const createPostSchema = z.object({
  locationId: z.string().uuid('locationId must be a valid UUID'),
  type: z.enum(['announcement', 'notice', 'event', 'lost_found', 'business', 'poll', 'emergency']),
  title: z.string().max(160).optional(),
  body: z.string().min(1, 'Post body cannot be empty').max(5000),
  mediaUrls: z.array(z.string()).max(6).optional(),
  videoUrls: z.array(z.string()).max(3).optional(),
  fileUrls: z.array(z.string()).max(5).optional(),
  isEmergency: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
  spreadRadius: z.number().int().positive().optional(),
  geoPoint: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2),
  }).optional(),
  event: z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    venue: z.string().max(200).optional(),
    maxAttendees: z.number().int().positive().optional(),
  }).optional(),
  poll: z.object({
    options: z.array(z.object({ text: z.string().min(1).max(100) })).min(2).max(6),
    endsAt: z.string().datetime().optional(),
    isAnonymous: z.boolean().optional(),
  }).optional(),
  aiRewriteCount: z.number().int().min(0).optional(),
});

const createCommentSchema = z.object({
  body: z.string().min(1).max(1000),
  parentId: z.string().uuid().optional(),
});

const castVoteSchema = z.object({
  optionIndex: z.number().int().min(0),
});

// ─── Feed ─────────────────────────────────────────────────────────────────────

const getFeed = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const before = req.query.before || null;
  const lat = req.query.lat ? parseFloat(req.query.lat) : undefined;
  const lng = req.query.lng ? parseFloat(req.query.lng) : undefined;

  const posts = await postModel.getFeedForUser(req.user.id, { limit, before, lat, lng });
  const nextCursor = posts.length === limit ? posts[posts.length - 1].created_at : null;
  return ok(res, { posts, nextCursor, count: posts.length });
});

// ─── Post CRUD ────────────────────────────────────────────────────────────────

const getPost = asyncHandler(async (req, res) => {
  const post = await postModel.findById(req.params.id, req.user.id, true);
  if (!post) return fail(res, 'Post not found.', 404);

  if (post.is_held_for_review) {
    const isAuthor = post.author_id === req.user.id;
    const isAdminOrMod = req.user.role === 'admin' || req.user.role === 'moderator';
    if (!isAuthor && !isAdminOrMod) {
      return fail(res, 'Post not found.', 404);
    }
  }

  return ok(res, { post });
});

const createPost = asyncHandler(async (req, res) => {
  const data = createPostSchema.parse(req.body);

  const memberCheck = await query(
    'SELECT 1 FROM user_locations WHERE user_id = $1 AND location_id = $2',
    [req.user.id, data.locationId]
  );
  if (memberCheck.rows.length === 0) {
    return fail(res, 'You are not a member of this community.', 403);
  }

  if (data.type === 'notice' && req.user.role !== 'admin') {
    return fail(res, 'Only society admins can post official notices.', 403);
  }

  // AI Content Moderation Check
  const mod = await aiService.moderateContent(data.title, data.body);
  const isHeldForReview = mod.flagged;
  const moderationReason = mod.reason;

  // AI Emergency Severity Classification & Radius Recommendation
  let spreadRadius = data.spreadRadius;
  let severity = null;
  let severityRationale = null;
  if (data.type === 'emergency') {
    const classification = await aiService.classifyEmergency(data.title, data.body);
    severity = classification.severity;
    severityRationale = classification.rationale;
    if (!spreadRadius) {
      if (severity === 'critical') spreadRadius = 50;
      else if (severity === 'medium') spreadRadius = 15;
      else spreadRadius = 3;
    }
  }

  // Generate vector embedding for lost_found posts
  let embedding = null;
  if (data.type === 'lost_found') {
    try {
      const combinedText = `${data.title || ''} ${data.body}`.trim();
      embedding = await aiService.generateEmbedding(combinedText);
    } catch (err) {
      console.error('[Embeddings] Failed to generate embedding:', err.message);
    }
  }

  const post = await postModel.createPost({
    authorId: req.user.id,
    locationId: data.locationId,
    type: data.type,
    title: data.title,
    body: data.body,
    mediaUrls: data.mediaUrls || [],
    videoUrls: data.videoUrls || [],
    fileUrls: data.fileUrls || [],
    isEmergency: data.type === 'emergency' || data.isEmergency || false,
    expiresAt: data.expiresAt || null,
    geoPoint: data.geoPoint || null,
    spreadRadius: spreadRadius || null,
    isHeldForReview,
    moderationReason,
    severity,
    severityRationale,
    aiRewriteCount: data.aiRewriteCount || 0,
    embedding,
  });

  if (data.type === 'event' && data.event) {
    await query(
      `INSERT INTO events (post_id, start_time, end_time, venue, max_attendees)
       VALUES ($1, $2, $3, $4, $5)`,
      [post.id, data.event.startTime, data.event.endTime || null,
       data.event.venue || null, data.event.maxAttendees || null]
    );
  }

  if (data.type === 'poll' && data.poll) {
    await query(
      `INSERT INTO polls (post_id, options, ends_at, is_anonymous)
       VALUES ($1, $2, $3, $4)`,
      [post.id, JSON.stringify(data.poll.options),
       data.poll.endsAt || null, data.poll.isAnonymous || false]
    );
  }

  const fullPost = await postModel.findById(post.id, req.user.id, true);
  
  if (isHeldForReview) {
    return ok(res, {
      post: fullPost,
      message: `Your post is held for moderation review. Reason: ${moderationReason}`,
      isHeld: true
    }, 201);
  }

  // Trigger push notifications in background for nearby residents
  sendPushNotificationToNearbyUsers(fullPost, fullPost.author_name).catch(err => {
    console.error('[WebPush] Error sending push notifications:', err.message);
  });

  return ok(res, { post: fullPost }, 201);
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await postModel.findById(req.params.id, req.user.id);
  if (!post) return fail(res, 'Post not found.', 404);

  const isOwner = post.author_id === req.user.id;
  const canModerate = ['admin', 'moderator'].includes(req.user.role);

  if (!isOwner && !canModerate) {
    return fail(res, 'You do not have permission to delete this post.', 403);
  }

  await postModel.deletePost(req.params.id);
  return ok(res, { message: 'Post deleted.' });
});

const togglePin = asyncHandler(async (req, res) => {
  const post = await postModel.findById(req.params.id, req.user.id);
  if (!post) return fail(res, 'Post not found.', 404);

  const isAuthor = post.author_id === req.user.id;
  const isStaff = ['admin', 'moderator'].includes(req.user.role);
  if (!isAuthor && !isStaff) {
    return fail(res, 'You do not have permission to pin this post.', 403);
  }

  const updated = await postModel.pinPost(req.params.id, !post.is_pinned);
  return ok(res, { post: updated });
});

const getUserPosts = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const before = req.query.before || null;
  const isOwnProfile = req.params.userId === req.user.id;
  const posts = await postModel.getPostsByUser(req.params.userId, { limit, before, includeHeld: isOwnProfile });
  const nextCursor = posts.length === limit ? posts[posts.length - 1].created_at : null;
  return ok(res, { posts, nextCursor });
});

const getLocationPosts = asyncHandler(async (req, res) => {
  const { locationId } = req.params;
  const type = req.query.type || null;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const before = req.query.before || null;

  if (type) {
    const posts = await postModel.getPostsByTypeAndLocation(locationId, type, req.user.id, { limit, before });
    const nextCursor = posts.length === limit ? posts[posts.length - 1].created_at : null;
    return ok(res, { posts, nextCursor });
  }

  const posts = await postModel.getFeedForUser(req.user.id, { limit, before });
  return ok(res, { posts });
});

// ─── Comments ────────────────────────────────────────────────────────────────

const getComments = asyncHandler(async (req, res) => {
  const post = await postModel.findById(req.params.id, req.user.id, true);
  if (!post) return fail(res, 'Post not found.', 404);

  if (post.is_held_for_review) {
    const isAuthor = post.author_id === req.user.id;
    const isAdminOrMod = req.user.role === 'admin' || req.user.role === 'moderator';
    if (!isAuthor && !isAdminOrMod) {
      return fail(res, 'Post not found.', 404);
    }
  }

  const comments = await postModel.getComments(req.params.id);
  return ok(res, { comments });
});

const addComment = asyncHandler(async (req, res) => {
  const post = await postModel.findById(req.params.id, req.user.id, true);
  if (!post) return fail(res, 'Post not found.', 404);

  if (post.is_held_for_review) {
    return fail(res, 'Commenting is disabled on posts under moderation review.', 403);
  }

  const { body, parentId } = createCommentSchema.parse(req.body);
  const comment = await postModel.createComment({
    postId: req.params.id,
    authorId: req.user.id,
    body,
    parentId,
  });
  return ok(res, { comment }, 201);
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const result = await query('SELECT * FROM comments WHERE id = $1', [commentId]);
  const comment = result.rows[0];
  if (!comment) return fail(res, 'Comment not found.', 404);

  const isOwner = comment.author_id === req.user.id;
  const canModerate = ['admin', 'moderator'].includes(req.user.role);

  if (!isOwner && !canModerate) {
    return fail(res, 'You do not have permission to delete this comment.', 403);
  }

  await postModel.deleteComment(commentId);
  return ok(res, { message: 'Comment deleted.' });
});

// ─── Reactions ───────────────────────────────────────────────────────────────

const reactToPost = asyncHandler(async (req, res) => {
  const post = await postModel.findById(req.params.id);
  if (!post) return fail(res, 'Post not found.', 404);
  const emoji = req.body.emoji || 'like';
  const result = await postModel.toggleReaction(req.params.id, req.user.id, emoji);
  const counts = await postModel.getReactionCounts(req.params.id);
  return ok(res, { ...result, reactions: counts });
});

// ─── Polls ───────────────────────────────────────────────────────────────────

const castVote = asyncHandler(async (req, res) => {
  const { optionIndex } = castVoteSchema.parse(req.body);
  const pollResult = await query('SELECT * FROM polls WHERE post_id = $1', [req.params.id]);
  const poll = pollResult.rows[0];
  if (!poll) return fail(res, 'This post does not have a poll.', 404);

  if (poll.ends_at && new Date(poll.ends_at) < new Date()) {
    return fail(res, 'This poll has ended.', 400);
  }

  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return fail(res, 'Invalid option index.', 400);
  }

  try {
    await query(
      'INSERT INTO poll_votes (poll_id, user_id, option_index) VALUES ($1, $2, $3)',
      [poll.id, req.user.id, optionIndex]
    );
  } catch (err) {
    if (err.code === '23505') return fail(res, 'You have already voted in this poll.', 409);
    throw err;
  }

  const voteCounts = await query(
    `SELECT option_index, COUNT(*)::int AS count
     FROM poll_votes WHERE poll_id = $1
     GROUP BY option_index ORDER BY option_index`,
    [poll.id]
  );

  return ok(res, { message: 'Vote cast successfully.', votes: voteCounts.rows });
});

// ─── Events ──────────────────────────────────────────────────────────────────

const rsvpEvent = asyncHandler(async (req, res) => {
  const eventResult = await query('SELECT * FROM events WHERE post_id = $1', [req.params.id]);
  const event = eventResult.rows[0];
  if (!event) return fail(res, 'This post does not have an event.', 404);

  if (event.max_attendees && event.rsvp_count >= event.max_attendees) {
    return fail(res, 'This event is full.', 400);
  }

  try {
    await query(
      'INSERT INTO event_rsvps (user_id, event_id) VALUES ($1, $2)',
      [req.user.id, event.id]
    );
    await query(
      'UPDATE events SET rsvp_count = rsvp_count + 1 WHERE id = $1',
      [event.id]
    );
  } catch (err) {
    if (err.code === '23505') return fail(res, 'You have already RSVPed to this event.', 409);
    throw err;
  }

  return ok(res, { message: 'RSVP confirmed.' });
});

const aiRewriteSchema = z.object({
  title: z.string().max(160).optional(),
  body: z.string().min(1, 'Post body cannot be empty').max(5000),
  type: z.enum(['announcement', 'notice', 'event', 'lost_found', 'business', 'poll', 'emergency']),
});

const aiRewrite = asyncHandler(async (req, res) => {
  const { title, body, type } = aiRewriteSchema.parse(req.body);
  const result = await aiService.improvePost(title, body, type);
  return ok(res, result);
});

const getPendingModerationPosts = asyncHandler(async (req, res) => {
  if (!['admin', 'moderator'].includes(req.user.role)) {
    return fail(res, 'Access denied. Admin or moderator role required.', 403);
  }
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const before = req.query.before || null;
  const posts = await postModel.getPostsPendingReview({ limit, before });
  const nextCursor = posts.length === limit ? posts[posts.length - 1].created_at : null;
  return ok(res, { posts, nextCursor, count: posts.length });
});

const approvePost = asyncHandler(async (req, res) => {
  if (!['admin', 'moderator'].includes(req.user.role)) {
    return fail(res, 'Access denied. Admin or moderator role required.', 403);
  }
  const post = await postModel.findById(req.params.id, null, true);
  if (!post) return fail(res, 'Post not found.', 404);

  const approved = await postModel.approvePostModeration(req.params.id);
  return ok(res, { post: approved, message: 'Post approved and published.' });
});

const translatePost = asyncHandler(async (req, res) => {
  const { targetLanguage } = req.body;
  if (!targetLanguage) {
    return fail(res, 'targetLanguage is required.', 400);
  }
  
  const post = await postModel.findById(req.params.id, req.user.id, true);
  if (!post) {
    return fail(res, 'Post not found.', 404);
  }

  const translation = await aiService.translateText(post.title, post.body, targetLanguage);
  return ok(res, translation);
});

const getPostMatches = asyncHandler(async (req, res) => {
  const matches = await postModel.findMatchesForPost(req.params.id, req.user.id);
  return ok(res, { matches });
});

const generatePollOptions = asyncHandler(async (req, res) => {
  const { topic } = req.body;
  if (!topic || !topic.trim()) {
    return fail(res, 'Topic is required.', 400);
  }

  const result = await aiService.generatePollOptions(topic);
  return ok(res, result);
});

const triggerTestDigest = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return fail(res, 'Access denied. Admin role required.', 403);
  }
  const { sendWeeklyDigests } = require('../services/digestScheduler');
  // Trigger asynchronously
  sendWeeklyDigests();
  return ok(res, { message: 'Weekly digest compilation triggered successfully.' });
});

module.exports = {
  getFeed, getPost, createPost, deletePost, togglePin,
  getUserPosts, getLocationPosts, getComments, addComment,
  deleteComment, reactToPost, castVote, rsvpEvent,
  aiRewrite, getPendingModerationPosts, approvePost,
  translatePost, getPostMatches, generatePollOptions, triggerTestDigest
};