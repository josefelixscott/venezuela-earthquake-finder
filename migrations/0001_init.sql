CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age TEXT,
  last_known_location TEXT NOT NULL,
  description TEXT,
  contact_info TEXT NOT NULL,
  photo_key TEXT,
  status TEXT NOT NULL DEFAULT 'looking',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS replies (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  contact_info TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_replies_post_id ON replies(post_id);
