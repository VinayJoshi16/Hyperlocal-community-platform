-- Migration 003: Add video_urls and file_urls to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS file_urls TEXT[] DEFAULT '{}';
