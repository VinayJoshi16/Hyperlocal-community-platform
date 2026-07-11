-- Migration 005: Add AI content moderation, emergency severity, and AI rewrite count tracking to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_held_for_review BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS moderation_reason TEXT DEFAULT NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS severity_rationale TEXT DEFAULT NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS ai_rewrite_count INT DEFAULT 0;
