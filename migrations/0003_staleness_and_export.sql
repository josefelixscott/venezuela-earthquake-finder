ALTER TABLE posts ADD COLUMN last_confirmed_at TEXT NOT NULL DEFAULT (datetime('now'));

CREATE INDEX IF NOT EXISTS idx_posts_last_confirmed_at ON posts(last_confirmed_at);
