export const REVIEWS_API_URL = "/api/reviews"
export const PRIORITY_REVIEW_POSTERS = 3

export type ApiReview = {
  id: string
  title: string
  year: number | null
  poster_url: string | null
  rating: number
  liked: boolean
  rewatch: boolean
  review: string | null
  watched_on: string // "YYYY-MM-DD"
  tags: string[]
  letterboxd_url: string | null
  tmdb_id: number | null
  created_at: string
}

