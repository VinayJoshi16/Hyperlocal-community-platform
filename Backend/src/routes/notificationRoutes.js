const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getVapidPublicKey,
  subscribeDevice,
  unsubscribeDevice
} = require('../controllers/notificationController');

// All routes require authentication
router.use(authMiddleware);

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', subscribeDevice);
router.post('/unsubscribe', unsubscribeDevice);

module.exports = router;
