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
  aiRewrite,
  getPendingModerationPosts,
  approvePost,
  translatePost,
  getPostMatches,
  generatePollOptions,
  triggerTestDigest
} = require('../controllers/postController');

const { authMiddleware } = require('../middleware/authMiddleware');
const { requireAdminOrModerator } = require('../middleware/rbacMiddleware');

const upload = require('../middleware/uploadMiddleware');

// All post routes require a valid JWT
router.use(authMiddleware);

// POST /api/posts/upload - handles single image upload with error handling
router.post('/upload', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({ success: true, url: fileUrl });
  });
});

// POST /api/posts/correct-grammar - auto-corrects spelling/grammar with fallback
router.post('/correct-grammar', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.json({ success: true, correctedText: text });
  }

  // Fallback dictionary for common spelling/grammar errors (ensures it works offline/rate-limited)
  const fallbackDict = {
    'particepiate': 'participate',
    'particepiated': 'participated',
    'particepiating': 'participating',
    'teh': 'the',
    'recieve': 'receive',
    'recieved': 'received',
    'seperate': 'separate',
    'seperated': 'separated',
    'dont': "don't",
    'cant': "can't",
    'wont': "won't",
    'deanceEvent': 'danceEvent'
  };

  const applyFallback = (str) => {
    let corrected = str;
    Object.entries(fallbackDict).forEach(([key, val]) => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      corrected = corrected.replace(regex, val);
    });
    return corrected;
  };

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      body: new URLSearchParams({ text: text.trim(), language: 'en-US' }),
      signal: controller.signal
    });
    clearTimeout(id);

    if (!response.ok) {
      throw new Error('LanguageTool service returned error status');
    }

    const data = await response.json();
    if (data.matches && data.matches.length > 0) {
      const sorted = [...data.matches].sort((a, b) => b.offset - a.offset);
      let result = text;
      for (const m of sorted) {
        if (m.replacements && m.replacements.length > 0) {
          const replacement = m.replacements[0].value;
          result = result.substring(0, m.offset) + replacement + result.substring(m.offset + m.length);
        }
      }
      return res.json({ success: true, correctedText: applyFallback(result) });
    }

    return res.json({ success: true, correctedText: applyFallback(text) });
  } catch (err) {
    console.log('Spelling correction API failed/timeout, applying fallback dictionary:', err.message);
    const corrected = applyFallback(text);
    return res.json({ success: true, correctedText: corrected, isFallback: true });
  }
});

// ─── Feed ─────────────────────────────────────────────────────────────────────

// GET /api/posts/feed
router.get('/feed', getFeed);

// ─── Specific routes before /:id to avoid param conflicts ─────────────────────

// POST /api/posts/ai-rewrite
router.post('/ai-rewrite', aiRewrite);

// POST /api/posts/generate-poll
router.post('/generate-poll', generatePollOptions);

// POST /api/posts/test-digest
router.post('/test-digest', requireAdminOrModerator, triggerTestDigest);

// GET /api/posts/pending-moderation
router.get('/pending-moderation', requireAdminOrModerator, getPendingModerationPosts);

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

// PATCH /api/posts/:id/pin  - admin, moderator, or post author
router.patch('/:id/pin', togglePin);

// PATCH /api/posts/:id/approve-moderation - admin or moderator
router.patch('/:id/approve-moderation', requireAdminOrModerator, approvePost);

// POST /api/posts/:id/translate
router.post('/:id/translate', translatePost);

// GET /api/posts/:id/matches
router.get('/:id/matches', getPostMatches);

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