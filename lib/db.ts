import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

/**
 * Neon serverless SQL client.
 * Uses the HTTP driver so it works in Edge and Node runtimes on Vercel.
 *
 * Requires env var: DATABASE_URL (Neon connection string)
 */
type Sql = NeonQueryFunction<false, false>

function getSql(): Sql {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL env var is not set. Add it in Vercel / .env.local (Neon connection string).",
    )
  }
  return neon(url)
}

// Lazy singleton so we don't try to construct on import when env is missing.
let _sql: Sql | null = null
export function sql(): Sql {
  if (!_sql) _sql = getSql()
  return _sql
}

export type Review = {
  id: string
  title: string
  year: number | null
  poster_url: string | null
  rating: number // 0..5, halves allowed
  liked: boolean
  rewatch: boolean
  review: string | null
  watched_on: string // ISO date (yyyy-mm-dd)
  tags: string[]
  letterboxd_url: string | null
  tmdb_id: number | null
  created_at: string
}

export async function listReviews(limit = 100): Promise<Review[]> {
  const s = sql()
  const rows = (await s`
    SELECT id, title, year, poster_url, rating, liked, rewatch, review,
           to_char(watched_on, 'YYYY-MM-DD') as watched_on,
           tags, letterboxd_url, tmdb_id,
           created_at
    FROM reviews
    ORDER BY watched_on DESC, created_at DESC
    LIMIT ${limit}
  `) as unknown as Review[]
  return rows
}

export type NewReview = {
  title: string
  year?: number | null
  poster_url?: string | null
  rating: number
  liked?: boolean
  rewatch?: boolean
  review?: string | null
  watched_on: string
  tags?: string[]
  letterboxd_url?: string | null
  tmdb_id?: number | null
}

export async function createReview(r: NewReview): Promise<Review> {
  const s = sql()
  const rows = (await s`
    INSERT INTO reviews
      (title, year, poster_url, rating, liked, rewatch, review, watched_on, tags, letterboxd_url, tmdb_id)
    VALUES
      (${r.title}, ${r.year ?? null}, ${r.poster_url ?? null}, ${r.rating},
       ${r.liked ?? false}, ${r.rewatch ?? false}, ${r.review ?? null},
       ${r.watched_on}, ${r.tags ?? []}, ${r.letterboxd_url ?? null}, ${r.tmdb_id ?? null})
    RETURNING id, title, year, poster_url, rating, liked, rewatch, review,
              to_char(watched_on, 'YYYY-MM-DD') as watched_on,
              tags, letterboxd_url, tmdb_id, created_at
  `) as unknown as Review[]
  return rows[0]
}

export async function deleteReview(id: string): Promise<boolean> {
  const s = sql()
  const rows = (await s`DELETE FROM reviews WHERE id = ${id} RETURNING id`) as unknown as {
    id: string
  }[]
  return rows.length > 0
}

/**
 * Idempotent schema initialization. Safe to run repeatedly.
 * Called on-demand from the admin endpoints so a fresh Neon DB just works.
 */
let _initialized = false
export async function ensureSchema() {
  if (_initialized) return
  const s = sql()
  await s`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`
  await s`
    CREATE TABLE IF NOT EXISTS reviews (
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
    )
  `
  await s`CREATE INDEX IF NOT EXISTS reviews_watched_on_idx ON reviews (watched_on DESC)`
  _initialized = true
}
