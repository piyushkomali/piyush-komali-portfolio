import { musicDashboardSchema, type MusicDashboard } from "./music-schema"

export interface MusicSnapshotRepository {
  read(username: string): Promise<MusicDashboard | null>
  write(data: MusicDashboard): Promise<void>
}

export async function loadMusicDashboard(
  load: () => Promise<MusicDashboard>,
  snapshots: MusicSnapshotRepository,
  runInBackground: (promise: Promise<unknown>) => void,
): Promise<MusicDashboard> {
  // runInBackground uses context.waitUntil to update the backup without delaying the response.
  try {
    const data = musicDashboardSchema.parse(await load())
    runInBackground(snapshots.write(data).catch(() => { console.error("music_snapshot_write_failed") }))
    return data
  } catch {
    const saved = await snapshots.read("piyushk12")
    if (!saved) throw new Error("No music snapshot available")
    // Preserve the original timestamp and the entire saved dashboard. A backup
    // must never advertise playback as live, even if the snapshot is very recent.
    return {
      ...saved,
      nowPlaying: null,
      lastTrack: saved.nowPlaying ? { ...saved.nowPlaying, isPlaying: false } : saved.lastTrack,
      recentTracks: saved.recentTracks.map((track) => ({ ...track, isPlaying: false })),
    }
  }
}
