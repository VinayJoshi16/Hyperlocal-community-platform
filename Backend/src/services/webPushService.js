const webPush = require('web-push');
const { query } = require('../config/db');
const config = require('../config/env');

webPush.setVapidDetails(
  config.vapid.subject,
  config.vapid.publicKey,
  config.vapid.privateKey
);

async function sendPushNotificationToNearbyUsers(post, authorName) {
  try {
    // Find all users in targeted location or nearby radius
    const usersRes = await query(
      `SELECT DISTINCT ul.user_id 
       FROM user_locations ul
       LEFT JOIN locations loc ON loc.id = ul.location_id
       WHERE 
         ul.location_id = $1 
         OR (
           $2::float IS NOT NULL 
           AND $3::geography IS NOT NULL 
           AND ul.is_primary = true 
           AND ST_DWithin(loc.centroid::geography, $3::geography, $2::float * 1000)
         )`,
      [post.location_id, post.spread_radius, post.geo_point]
    );

    const userIds = usersRes.rows.map(r => r.user_id).filter(id => id !== post.author_id);
    if (userIds.length === 0) return;

    const subsRes = await query(
      `SELECT endpoint, p256dh, auth, user_id FROM push_subscriptions WHERE user_id = ANY($1)`,
      [userIds]
    );

    if (subsRes.rows.length === 0) return;

    const payload = JSON.stringify({
      title: 'New Post Nearby',
      body: `${authorName} posted:\n"${post.title || post.body.substring(0, 80)}"`,
      url: `/posts/${post.id}`,
      postId: post.id
    });

    const promises = subsRes.rows.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      return webPush.sendNotification(pushSubscription, payload)
        .catch(async (err) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log(`[WebPush] Removing expired subscription for user: ${sub.user_id}`);
            await query(
              'DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2',
              [sub.endpoint, sub.user_id]
            );
          } else {
            console.error('[WebPush] Error sending push notification:', err.message);
          }
        });
    });

    await Promise.all(promises);
  } catch (err) {
    console.error('[WebPush] Failed in sendPushNotificationToNearbyUsers:', err.message);
  }
}

module.exports = {
  sendPushNotificationToNearbyUsers
};
