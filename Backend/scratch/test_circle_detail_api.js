const { query } = require('../src/config/db');

async function run() {
  const userId = '2c45da88-ce8a-4d9b-bdb5-c6ae30f8688d'; // admin/creator user
  const circleId = 'cca18cc4-a66e-4c9f-b810-f483b6bf7de0'; // circle ID

  try {
    console.log('Running exact getCirclePolls query...');
    const pollsRes = await query(
      `SELECT p.*, u.name as creator_name,
              (SELECT option_index FROM circle_poll_votes WHERE poll_id = p.id AND user_id = $2) as my_vote
       FROM circle_polls p
       JOIN users u ON u.id = p.created_by
       WHERE p.circle_id = $1
       ORDER BY p.created_at DESC`,
      [circleId, userId]
    );
    console.log('Polls Query succeeded:', pollsRes.rows);
  } catch (err) {
    console.error('POLLS QUERY ERROR:', err.stack);
  }

  try {
    console.log('Running exact getCircleEvents query...');
    const eventsRes = await query(
      `SELECT e.*, u.name as creator_name,
              (SELECT COUNT(*)::int FROM circle_event_participants WHERE event_id = e.id) as participant_count,
              EXISTS(SELECT 1 FROM circle_event_participants WHERE event_id = e.id AND user_id = $2) as joined
       FROM circle_events e
       JOIN users u ON u.id = e.created_by
       WHERE e.circle_id = $1
       ORDER BY e.event_date ASC, e.event_time ASC`,
      [circleId, userId]
    );
    console.log('Events Query succeeded:', eventsRes.rows);
  } catch (err) {
    console.error('EVENTS QUERY ERROR:', err.stack);
  }

  process.exit(0);
}

run();
