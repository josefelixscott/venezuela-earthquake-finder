ALTER TABLE posts ADD COLUMN state TEXT;
ALTER TABLE initiatives ADD COLUMN state TEXT;

CREATE INDEX IF NOT EXISTS idx_posts_state ON posts(state);
CREATE INDEX IF NOT EXISTS idx_initiatives_state ON initiatives(state);
