const { query } = require('../src/config/db');

async function test() {
  try {
    console.log('Testing circle_polls schema...');
    const resPolls = await query('SELECT * FROM circle_polls LIMIT 1');
    console.log('Polls table ok:', resPolls.rows);

    console.log('Testing circle_events schema...');
    const resEvents = await query('SELECT * FROM circle_events LIMIT 1');
    console.log('Events table ok:', resEvents.rows);
  } catch (err) {
    console.error('DATABASE ERROR:', err.message);
  }
  process.exit(0);
}

test();
