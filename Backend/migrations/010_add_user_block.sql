-- Migration 010: Add is_blocked column to users table
-- Run with: npm run migrate

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Optional: Index for fast lookup if we need to query blocked users frequently
CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked) WHERE is_blocked = TRUE;
