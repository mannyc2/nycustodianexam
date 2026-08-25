CREATE TABLE correction_reports (
  client_receipt_id TEXT PRIMARY KEY NOT NULL,
  payload_sha256 TEXT NOT NULL,
  schema_version INTEGER NOT NULL CHECK (schema_version = 1),
  category TEXT NOT NULL,
  page_path TEXT NOT NULL,
  content_id TEXT,
  profile_id TEXT,
  pack_id TEXT,
  pack_version INTEGER,
  summary TEXT NOT NULL,
  details TEXT NOT NULL,
  public_source_url TEXT,
  received_at TEXT NOT NULL,
  lane TEXT NOT NULL CHECK (lane IN ('untriaged', 'security_hold')),
  triage_status TEXT NOT NULL DEFAULT 'pending' CHECK (triage_status IN ('pending', 'reviewing', 'resolved', 'rejected')),
  triaged_at TEXT,
  triage_note TEXT
);

CREATE INDEX correction_reports_triage_queue
  ON correction_reports (lane, triage_status, received_at);
