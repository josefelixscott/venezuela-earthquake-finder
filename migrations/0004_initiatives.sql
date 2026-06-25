CREATE TABLE IF NOT EXISTS initiatives (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'otro',
  location TEXT NOT NULL,
  description TEXT,
  contact_info TEXT NOT NULL,
  edit_token TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_initiatives_created_at ON initiatives(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_initiatives_edit_token ON initiatives(edit_token);
