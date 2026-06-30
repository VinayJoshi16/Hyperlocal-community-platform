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
    process.exit(1);
  }

  const dir = __dirname;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    process.exit(0);
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
      process.exit(1);
    }
  }

  console.log('All migrations completed successfully.');
  await pool.end();
  process.exit(0);
}

runMigrations();