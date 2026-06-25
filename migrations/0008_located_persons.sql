CREATE TABLE IF NOT EXISTS located_persons (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  name TEXT NOT NULL,
  age TEXT,
  location_name TEXT NOT NULL,
  state TEXT,
  notes TEXT,
  contact_info TEXT,
  edit_token TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_located_persons_created_at ON located_persons(created_at);
CREATE INDEX IF NOT EXISTS idx_located_persons_state ON located_persons(state);
CREATE INDEX IF NOT EXISTS idx_located_persons_batch_id ON located_persons(batch_id);
CREATE INDEX IF NOT EXISTS idx_located_persons_edit_token ON located_persons(edit_token);
