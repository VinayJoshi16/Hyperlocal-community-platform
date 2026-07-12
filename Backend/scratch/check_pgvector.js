const { query } = require('../src/config/db');

async function check() {
  try {
    const res = await query('SELECT extname FROM pg_extension');
    console.log('Installed extensions:', res.rows.map(r => r.extname));

    const avail = await query('SELECT name FROM pg_available_extensions WHERE name = \'vector\'');
    console.log('Is pgvector available for install?:', avail.rows.length > 0);
  } catch (err) {
    console.error('Error checking extensions:', err.message);
  }
}
check();
