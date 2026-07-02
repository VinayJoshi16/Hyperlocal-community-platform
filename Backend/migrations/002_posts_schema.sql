-- Migration 002: Posts, comments, and reactions
-- Run with: npm run migrate

-- ============================================
-- POSTS: the core content unit of the platform
-- Every post belongs to a location level and has a type
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN (
    'announcement',  -- general notice from any user
    'notice',        -- official society notice (admin only)
    'event',         -- community event with date/time
    'lost_found',    -- lost or found item/pet
    'business',      -- local business promotion
    'poll',          -- community voting
    'emergency'      -- urgent alert (admin/moderator only)
  )),
  title VARCHAR(160),
  body TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  is_emergency BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  geo_point GEOGRAPHY(Point, 4326),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_location ON posts(location_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_emergency ON posts(is_emergency) WHERE is_emergency = TRUE;
CREATE INDEX IF NOT EXISTS idx_posts_geo ON posts USING GIST(geo_point);

-- ============================================
-- EVENTS: extra metadata attached to posts of type 'event'
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  venue VARCHAR(200),
  max_attendees INT,
  rsvp_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_post ON events(post_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_time);

-- ============================================
-- EVENT_RSVPS: tracks who has RSVPed to an event
-- ============================================
CREATE TABLE IF NOT EXISTS event_rsvps (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  rsvped_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

-- ============================================
-- POLLS: extra metadata for posts of type 'poll'
-- ============================================
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  options JSONB NOT NULL,
  ends_at TIMESTAMP,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_polls_post ON polls(post_id);

-- ============================================
-- POLL_VOTES: one row per user per poll
-- ============================================
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_index INT NOT NULL,
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes(poll_id);

-- ============================================
-- COMMENTS: threaded replies on posts (one level deep)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);

-- ============================================
-- REACTIONS: emoji reactions on posts
-- ============================================
CREATE TABLE IF NOT EXISTS reactions (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL DEFAULT 'like',
  reacted_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);

-- ============================================
-- NOTIFICATIONS: stores push notification history
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(160),
  body TEXT,
  read_at TIMESTAMP,
  sent_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read_at) WHERE read_at IS NULL;