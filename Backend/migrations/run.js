// Runs every .sql file in migrations/ in alphabetical order.
// Usage: npm run migrate

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('../src/config/db');

async function runMigrations() {
  const ok = await testConnection();
  if (!ok) {
    console.error('Cannot run migrations - database connection failed. Check DATABASE_URL in .env');
    if (require.main === module) process.exit(1);
    throw new Error('Database connection failed');
  }

  const dir = __dirname;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    if (require.main === module) process.exit(0);
    return;
  }

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`Running migration: ${file}`);
    try {
      await pool.query(sql);
      console.log(`  done: ${file}`);
    } catch (err) {
      console.error(`  failed: ${file}`);
      console.error(err.message);
      if (require.main === module) process.exit(1);
      throw err;
    }
  }

  console.log('All migrations completed successfully.');
  if (require.main === module) {
    await pool.end();
    process.exit(0);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };