-- Migration 003: Add spread_radius column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS spread_radius INT DEFAULT NULL;
