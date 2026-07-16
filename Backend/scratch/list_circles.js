const { query } = require('../src/config/db');

async function list() {
  try {
    const res = await query('SELECT * FROM circles');
    console.log('CIRCLES IN DB:', res.rows);
  } catch (err) {
    console.error('ERROR:', err.message);
  }
  process.exit(0);
}

list();
