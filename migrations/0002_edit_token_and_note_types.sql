ALTER TABLE posts ADD COLUMN edit_token TEXT;
ALTER TABLE replies ADD COLUMN note_type TEXT NOT NULL DEFAULT 'information';

CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_edit_token ON posts(edit_token);
