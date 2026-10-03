export interface Env {
  AI: Ai
  DATABASE_URL: string
  ADMIN_PASSWORD: string
  ADMIN_SESSION_SECRET?: string
  TMDB_API_KEY?: string
  LASTFM_API_KEY?: string
}

export type AppPagesFunction<Params extends string = any> = PagesFunction<Env, Params>
