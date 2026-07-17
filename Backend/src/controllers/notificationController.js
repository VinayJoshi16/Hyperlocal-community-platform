const { query } = require('../config/db');
const config = require('../config/env');
const { asyncHandler, ok, fail } = require('../utils/helpers');

// GET /api/notifications/vapid-public-key
const getVapidPublicKey = asyncHandler(async (req, res) => {
  return ok(res, { publicKey: config.vapid.publicKey });
});

// POST /api/notifications/subscribe
const subscribeDevice = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { endpoint, p256dh, auth } = req.body;

  if (!endpoint || !p256dh || !auth) {
    return fail(res, 'endpoint, p256dh, and auth parameters are required.', 400);
  }

  try {
    // Insert or update on conflict (user_id, endpoint)
    await query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, endpoint) 
       DO UPDATE SET p256dh = $3, auth = $4, updated_at = NOW()`,
      [userId, endpoint, p256dh, auth]
    );

    return ok(res, { message: 'Successfully subscribed device for notifications.' });
  } catch (err) {
    console.error('[WebPushController] Subscription failed:', err.message);
    return fail(res, 'Failed to save subscription parameters.', 500);
  }
});

// POST /api/notifications/unsubscribe
const unsubscribeDevice = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { endpoint } = req.body;

  if (!endpoint) {
    return fail(res, 'endpoint is required.', 400);
  }

  try {
    await query(
      'DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2',
      [userId, endpoint]
    );
    return ok(res, { message: 'Successfully unsubscribed device.' });
  } catch (err) {
    console.error('[WebPushController] Unsubscription failed:', err.message);
    return fail(res, 'Failed to delete subscription.', 500);
  }
});

module.exports = {
  getVapidPublicKey,
  subscribeDevice,
  unsubscribeDevice
};
