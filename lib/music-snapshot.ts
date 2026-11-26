import { getSql } from "./db"
import { musicDashboardSchema, type MusicDashboard } from "./music-schema"

/** Keep one complete successful dashboard indefinitely, shared by all visitors. */
export function createMusicSnapshotRepository(databaseUrl: string) {
  return {
    async read(username: string): Promise<MusicDashboard | null> {
      const sql = getSql(databaseUrl)
      const rows = await sql`SELECT dashboard FROM music_snapshots WHERE username = ${username}`
      const saved = musicDashboardSchema.safeParse(rows[0]?.dashboard)
      return saved.success && saved.data.username === username ? saved.data : null
    },
    async write(data: MusicDashboard): Promise<void> {
      const sql = getSql(databaseUrl)
      await sql`
        INSERT INTO music_snapshots (username, dashboard, fetched_at)
        VALUES (${data.username}, ${JSON.stringify(data)}::jsonb, ${data.fetchedAt})
        ON CONFLICT (username) DO UPDATE
        SET dashboard = EXCLUDED.dashboard, fetched_at = EXCLUDED.fetched_at
        WHERE music_snapshots.fetched_at < EXCLUDED.fetched_at
      `
    },
  }
}
