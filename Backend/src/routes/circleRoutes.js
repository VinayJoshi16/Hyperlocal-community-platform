const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getCircles,
  createCircle,
  getCircleDetails,
  joinCircle,
  updateCircleSettings,
  getCircleMessages,
  postCircleMessage,
  markMessagesViewed,
  getCirclePins,
  addCirclePin,
  deleteCirclePin,
  getCirclePolls,
  createCirclePoll,
  voteCirclePoll,
  getCircleEvents,
  createCircleEvent,
  toggleJoinCircleEvent,
  searchNeighborhoodUsers,
  addCircleMember,
  getJoinRequests,
  handleJoinRequest,
  deleteCircleMessage,
  deleteCirclePoll,
  deleteCircleEvent
} = require('../controllers/circleController');

// All routes require token authentication
router.use(authMiddleware);

// Circle management
router.get('/', getCircles);
router.post('/', createCircle);
router.get('/:id', getCircleDetails);
router.post('/:id/join', joinCircle);
router.patch('/:id/settings', updateCircleSettings);

// Direct member management & searching other neighbors
router.get('/users/search', searchNeighborhoodUsers);
router.post('/:id/members', addCircleMember);

// Pending join requests (Private Mode)
router.get('/:id/requests', getJoinRequests);
router.post('/:id/requests/:targetUserId', handleJoinRequest);

// Message routes (Group Chat & receipts)
router.get('/:id/messages', getCircleMessages);
router.post('/:id/messages', postCircleMessage);
router.post('/:id/messages/view', markMessagesViewed);
router.delete('/:id/messages/:messageId', deleteCircleMessage);

// Notice board (Pins)
router.get('/:id/pins', getCirclePins);
router.post('/:id/pins', addCirclePin);
router.delete('/:id/pins/:pinId', deleteCirclePin);

// Sidebar Live Polls
router.get('/:id/polls', getCirclePolls);
router.post('/:id/polls', createCirclePoll);
router.post('/:id/polls/:pollId/vote', voteCirclePoll);
router.delete('/:id/polls/:pollId', deleteCirclePoll);

// Sidebar Events
router.get('/:id/events', getCircleEvents);
router.post('/:id/events', createCircleEvent);
router.post('/:id/events/:eventId/toggle', toggleJoinCircleEvent);
router.delete('/:id/events/:eventId', deleteCircleEvent);

module.exports = router;
