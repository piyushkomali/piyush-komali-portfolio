CREATE TABLE music_snapshots (
  username TEXT PRIMARY KEY,
  dashboard JSONB NOT NULL,
  fetched_at BIGINT NOT NULL
);
