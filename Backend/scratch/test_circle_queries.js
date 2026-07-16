const { query } = require('../src/config/db');

async function run() {
  const userId = '016c90ef-1bf4-4715-a5de-ae931158872e'; // a valid user UUID
  const id = 'cca18cc4-483b-6bf7-de0'; // wait! In the console screenshot, the URL is: api/circles/cca18cc4...483b6bf7de0/polls

  // Wait! Look at the UUID in the user console image!
  // "api/circles/cca18cc4-483b-6bf7-de0/polls"
  // Wait! "cca18cc4-483b-6bf7-de0" is NOT a valid UUID!
  // Let's count characters: "cca18cc4" (8) "-" "483b" (4) "-" "6bf7" (4) "-" "de0" (3)
  // That is only 19 characters! A standard UUID is 36 characters!
  // Why is the URL using "cca18cc4...483b6bf7de0" or "cca18cc4-483b-6bf7-de0"?
  // Wait! In the console log, the text is truncated in the middle!
  // "api/circles/cca18cc4...483b6bf7de0/polls"
  // Let's see: yes, chrome truncates long URLs with "..." in the middle!
  // The actual URL was indeed a valid UUID.

  try {
    const id = 'cca18cc4-483b-483b-6bf7-de0e2a26f890'; // placeholder
    console.log('Testing polls query...');
    await query(
      `SELECT p.*, u.name as creator_name,
              (SELECT option_index FROM circle_poll_votes WHERE poll_id = p.id AND user_id = $1) as my_vote
       FROM circle_polls p
       JOIN users u ON u.id = p.created_by
       WHERE p.circle_id = $2
       ORDER BY p.created_at DESC`,
      [userId, id]
    );
    console.log('Polls query successful');

    console.log('Testing events query...');
    await query(
      `SELECT e.*, u.name as creator_name,
              (SELECT COUNT(*)::int FROM circle_event_participants WHERE event_id = e.id) as participant_count,
              EXISTS(SELECT 1 FROM circle_event_participants WHERE event_id = e.id AND user_id = $1) as joined
       FROM circle_events e
       JOIN users u ON u.id = e.created_by
       WHERE e.circle_id = $2
       ORDER BY e.event_date ASC, e.event_time ASC`,
      [userId, id]
    );
    console.log('Events query successful');
  } catch (err) {
    console.error('QUERY EXTREME ERROR:', err.stack);
  }
  process.exit(0);
}

run();
