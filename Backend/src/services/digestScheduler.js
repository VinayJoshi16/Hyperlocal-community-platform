const { query } = require('../config/db');
const aiService = require('./aiService');
const emailService = require('./emailService');
const nodemailer = require('nodemailer');
const config = require('../config/env');

/**
 * Compiles and emails the weekly highlights summary to all users.
 */
async function sendWeeklyDigests() {
  console.log('[Digest] Starting weekly digest compilation process...');

  try {
    // 1. Fetch all users
    const usersRes = await query('SELECT id, email, name FROM users');
    const users = usersRes.rows;
    console.log(`[Digest] Found ${users.length} users to process.`);

    for (const user of users) {
      try {
        // 2. Get user's primary community/location
        const locRes = await query(
          'SELECT location_id FROM user_locations WHERE user_id = $1 AND is_primary = true',
          [user.id]
        );
        if (locRes.rows.length === 0) {
          console.log(`[Digest] Skipping user ${user.email}: No primary community set.`);
          continue;
        }
        const locationId = locRes.rows[0].location_id;

        // 3. Fetch top 20 posts in the last 7 days for this community
        const postsRes = await query(
          `SELECT title, body, type, created_at 
           FROM posts 
           WHERE location_id = $1 
             AND is_held_for_review = FALSE 
             AND created_at > NOW() - INTERVAL '7 days'
           ORDER BY is_emergency DESC, created_at DESC 
           LIMIT 20`,
          [locationId]
        );
        const posts = postsRes.rows;
        if (posts.length === 0) {
          console.log(`[Digest] Skipping user ${user.email}: No new posts in the last 7 days.`);
          continue;
        }

        // 4. Summarise posts using Gemini
        const summary = await aiService.summarizePosts(posts);

        // 5. Send Email
        const transporter = emailService.sendOtpEmail; // checking if email transporter is available
        const hasTransporter = config.email.user && config.email.appPassword;

        const html = `
          <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px 20px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Your Weekly Community Digest</h1>
              <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.85; font-weight: 500;">NeighbourHub Highlights Summary</p>
            </div>
            
            <div style="padding: 24px; background: white;">
              <p style="color: #374151; font-size: 15px; margin-top: 0; font-weight: 600;">Hello ${user.name || 'Resident'},</p>
              <p style="color: #4B5563; font-size: 14px; line-height: 1.5;">
                Here is a 5-line summary of what happened in your community over the past week:
              </p>
              
              <div style="background: #F9FAFB; border-left: 4px solid #4F46E5; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
                <div style="color: #1F2937; font-size: 14px; font-weight: 500; line-height: 1.8; white-space: pre-line;">
                  ${summary}
                </div>
              </div>
              
              <p style="color: #4B5563; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
                Log into NeighbourHub to read the full posts, RSVP to events, or vote in active polls.
              </p>
            </div>
            
            <div style="background: #F3F4F6; padding: 15px; text-align: center; border-top: 1px solid #E5E7EB;">
              <span style="font-size: 11px; color: #9CA3AF; font-weight: 500;">
                Sent weekly by NeighbourHub. Keep connecting with your community.
              </span>
            </div>
          </div>
        `;

        if (hasTransporter) {
          // Setup custom mail sender
          const mailer = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: config.email.user,
              pass: config.email.appPassword,
            },
            connectionTimeout: 4000,
            greetingTimeout: 4000,
            socketTimeout: 4000,
          });

          await mailer.sendMail({
            from: `"${config.email.fromName}" <${config.email.user}>`,
            to: user.email,
            subject: 'Weekly Highlights: Your NeighbourHub Community Digest',
            html,
          });
          console.log(`[Digest] Digest email sent successfully to ${user.email}.`);
        } else {
          console.log(`\n======================================================`);
          console.log(`[TEST MODE] Weekly Digest for ${user.email}:`);
          console.log(summary);
          console.log(`======================================================\n`);
        }
      } catch (err) {
        console.error(`[Digest] Failed to compile/send digest for user ${user.email}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[Digest] Error during digest distribution:', err.message);
  }
}

/**
 * Initializes the weekly digest cron scheduler.
 * Computes delay until next Sunday 8:00 AM, schedules first run, then sets a weekly interval.
 */
function initScheduler() {
  const calculateDelayUntilNextSundayEightAM = () => {
    const now = new Date();
    const result = new Date();
    
    // Set to next Sunday
    result.setDate(now.getDate() + (7 - now.getDay()) % 7);
    result.setHours(8, 0, 0, 0);

    // If next Sunday 8am is in the past (e.g. today is Sunday and it is past 8am), push to next week
    if (result <= now) {
      result.setDate(result.getDate() + 7);
    }

    return result.getTime() - now.getTime();
  };

  const delay = calculateDelayUntilNextSundayEightAM();
  console.log(`[Digest] Scheduler loaded. Next digest scheduled in ${Math.round(delay / 1000 / 60 / 60)} hours (next Sunday 8:00 AM).`);

  setTimeout(() => {
    // Run weekly digest
    sendWeeklyDigests();
    
    // Set 7-day interval
    setInterval(sendWeeklyDigests, 7 * 24 * 60 * 60 * 1000);
  }, delay);
}

module.exports = {
  sendWeeklyDigests,
  initScheduler
};
