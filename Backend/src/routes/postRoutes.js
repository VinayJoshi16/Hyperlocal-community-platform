// Post routes. Auth is required for all routes.
// Some actions (pin, emergency) are additionally gated by RBAC.

const express = require('express');
const router = express.Router();

const {
  getFeed,
  getPost,
  createPost,
  deletePost,
  togglePin,
  getUserPosts,
  getLocationPosts,
  getComments,
  addComment,
  deleteComment,
  reactToPost,
  castVote,
  rsvpEvent,
} = require('../controllers/postController');

const { authMiddleware } = require('../middleware/authMiddleware');
const { requireAdminOrModerator } = require('../middleware/rbacMiddleware');

const upload = require('../middleware/uploadMiddleware');

// All post routes require a valid JWT
router.use(authMiddleware);

// POST /api/posts/upload - handles single image upload
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({ success: true, url: fileUrl });
});

// ─── Feed ─────────────────────────────────────────────────────────────────────

// GET /api/posts/feed
router.get('/feed', getFeed);

// ─── Specific routes before /:id to avoid param conflicts ─────────────────────

// GET /api/posts/user/:userId
router.get('/user/:userId', getUserPosts);

// GET /api/posts/location/:locationId?type=event
router.get('/location/:locationId', getLocationPosts);

// ─── Post CRUD ────────────────────────────────────────────────────────────────

// GET /api/posts/:id
router.get('/:id', getPost);

// POST /api/posts
router.post('/', createPost);

// DELETE /api/posts/:id
router.delete('/:id', deletePost);

// PATCH /api/posts/:id/pin  - admin or moderator only
router.patch('/:id/pin', requireAdminOrModerator, togglePin);

// ─── Comments ─────────────────────────────────────────────────────────────────

// GET  /api/posts/:id/comments
router.get('/:id/comments', getComments);

// POST /api/posts/:id/comments
router.post('/:id/comments', addComment);

// DELETE /api/posts/:postId/comments/:commentId
router.delete('/:postId/comments/:commentId', deleteComment);

// ─── Reactions ────────────────────────────────────────────────────────────────

// POST /api/posts/:id/react
router.post('/:id/react', reactToPost);

// ─── Polls ────────────────────────────────────────────────────────────────────

// POST /api/posts/:id/vote
router.post('/:id/vote', castVote);

// ─── Events ───────────────────────────────────────────────────────────────────

// POST /api/posts/:id/rsvp
router.post('/:id/rsvp', rsvpEvent);

module.exports = router;