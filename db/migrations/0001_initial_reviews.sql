CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- statement-breakpoint
CREATE TABLE reviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  year           INTEGER,
  poster_url     TEXT,
  rating         NUMERIC(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  liked          BOOLEAN NOT NULL DEFAULT FALSE,
  rewatch        BOOLEAN NOT NULL DEFAULT FALSE,
  review         TEXT,
  watched_on     DATE NOT NULL,
  tags           TEXT[] NOT NULL DEFAULT '{}',
  letterboxd_url TEXT,
  tmdb_id        INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- statement-breakpoint
CREATE INDEX reviews_watched_on_idx ON reviews (watched_on DESC);
-- statement-breakpoint
CREATE UNIQUE INDEX reviews_letterboxd_url_uidx
  ON reviews (letterboxd_url)
  WHERE letterboxd_url IS NOT NULL;
