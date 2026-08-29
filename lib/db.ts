import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

export type Sql = NeonQueryFunction<false, false>

const clients = new Map<string, Sql>()

/** Return one Neon HTTP client per connection string for this isolate. */
export function getSql(databaseUrl: string): Sql {
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured")
  const existing = clients.get(databaseUrl)
  if (existing) return existing
  const client = neon(databaseUrl)
  clients.set(databaseUrl, client)
  return client
}

export type Review = {
  id: string
  title: string
  year: number | null
  poster_url: string | null
  rating: number
  liked: boolean
  rewatch: boolean
  review: string | null
  watched_on: string
  tags: string[]
  letterboxd_url: string | null
  tmdb_id: number | null
  created_at: string
}

type DatabaseReview = Omit<Review, "rating"> & { rating: number | string }

function normalizeReview(row: DatabaseReview): Review {
  return { ...row, rating: Number(row.rating) }
}

export async function listReviews(databaseUrl: string, limit = 100): Promise<Review[]> {
  const sql = getSql(databaseUrl)
  const rows = (await sql`
    SELECT id, title, year, poster_url, rating, liked, rewatch, review,
           to_char(watched_on, 'YYYY-MM-DD') AS watched_on,
           tags, letterboxd_url, tmdb_id, created_at
    FROM reviews
    ORDER BY watched_on DESC, created_at DESC
    LIMIT ${limit}
  `) as unknown as DatabaseReview[]
  return rows.map(normalizeReview)
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

export type BatchInsertResult = {
  created: Review[]
  duplicateIndexes: number[]
}

/** Insert a validated review batch atomically, skipping exact URL conflicts. */
export async function createReviews(
  databaseUrl: string,
  reviews: NewReview[],
): Promise<BatchInsertResult> {
  if (reviews.length === 0) return { created: [], duplicateIndexes: [] }
  const sql = getSql(databaseUrl)
  const queries = reviews.map((review) => sql`
    INSERT INTO reviews
      (title, year, poster_url, rating, liked, rewatch, review, watched_on, tags, letterboxd_url, tmdb_id)
    VALUES
      (${review.title}, ${review.year ?? null}, ${review.poster_url ?? null}, ${review.rating},
       ${review.liked ?? false}, ${review.rewatch ?? false}, ${review.review ?? null},
       ${review.watched_on}, ${review.tags ?? []}, ${review.letterboxd_url ?? null},
       ${review.tmdb_id ?? null})
    ON CONFLICT (letterboxd_url) WHERE letterboxd_url IS NOT NULL DO NOTHING
    RETURNING id, title, year, poster_url, rating, liked, rewatch, review,
              to_char(watched_on, 'YYYY-MM-DD') AS watched_on,
              tags, letterboxd_url, tmdb_id, created_at
  `)
  const resultSets = (await sql.transaction(queries)) as unknown as DatabaseReview[][]
  const created: Review[] = []
  const duplicateIndexes: number[] = []
  resultSets.forEach((rows, index) => {
    if (rows[0]) created.push(normalizeReview(rows[0]))
    else duplicateIndexes.push(index)
  })
  return { created, duplicateIndexes }
}

export async function deleteReview(databaseUrl: string, id: string): Promise<boolean> {
  const sql = getSql(databaseUrl)
  const rows = (await sql`
    DELETE FROM reviews WHERE id = ${id} RETURNING id
  `) as unknown as { id: string }[]
  return rows.length > 0
}
