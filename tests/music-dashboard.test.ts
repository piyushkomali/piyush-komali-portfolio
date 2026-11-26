import { describe, expect, it } from "vitest"
import { loadMusicDashboard, type MusicSnapshotRepository } from "@/lib/music-dashboard"
import type { MusicDashboard } from "@/lib/music-schema"

const track = { name: "Saved song", artist: "Artist", album: "Album", image: null, url: null, isPlaying: true, playedAt: null }
const backup: MusicDashboard = {
  username: "piyushk12", fetchedAt: 1, nowPlaying: track, lastTrack: null,
  recentTracks: [track], topArtists: [{ name: "Artist", playcount: 12, image: null, url: null }],
  topAlbums: [{ name: "Album", artist: "Artist", playcount: 8, image: null, url: null }],
}

function repository(initial: MusicDashboard | null) {
  let stored = initial
  const snapshots: MusicSnapshotRepository = {
    read: async () => stored,
    write: async (data) => { stored = data },
  }
  return snapshots
}
const unavailable = async (): Promise<MusicDashboard> => { throw new Error("Last.fm unavailable") }

describe("complete dashboard backup", () => {
  it("persists a successful full suite and serves it to a new visitor during an outage without expiry", async () => {
    const snapshots = repository(null)
    const work: Promise<unknown>[] = []
    const live = await loadMusicDashboard(async () => backup, snapshots, (promise) => { work.push(promise) })
    await Promise.all(work)
    expect(live.nowPlaying?.isPlaying).toBe(true)
    // This new request has no browser state and the saved timestamp is ancient.
    const saved = await loadMusicDashboard(unavailable, snapshots, () => {})
    expect(saved.topAlbums).toEqual(backup.topAlbums)
    expect(saved.topArtists).toEqual(backup.topArtists)
    expect(saved.recentTracks[0].name).toBe("Saved song")
    expect(saved.fetchedAt).toBe(1)
    expect(saved.nowPlaying).toBeNull()
    expect(saved.lastTrack?.isPlaying).toBe(false)
    expect(saved.recentTracks.every((song) => !song.isPlaying)).toBe(true)
  })

  it("does not replace the backup when one section of a new suite fails", async () => {
    const snapshots = repository(backup)
    const partialSuite = async () => {
      await Promise.all([Promise.resolve({ name: "New song" }), Promise.reject(new Error("Albums failed"))])
      return { ...backup, recentTracks: [], topAlbums: [] }
    }
    const saved = await loadMusicDashboard(partialSuite, snapshots, () => {})
    expect(saved.topAlbums).toEqual(backup.topAlbums)
    expect(saved.recentTracks[0].name).toBe("Saved song")
    expect(await snapshots.read("piyushk12")).toEqual(backup)
  })

  it("disables live playback even when the backup is less than 30 seconds old", async () => {
    const snapshots = repository({ ...backup, fetchedAt: Date.now() })
    const saved = await loadMusicDashboard(unavailable, snapshots, () => {})
    expect(saved.nowPlaying).toBeNull()
    expect(saved.lastTrack?.isPlaying).toBe(false)
    expect(saved.recentTracks[0].isPlaying).toBe(false)
  })

  it("replaces the full backup after recovery", async () => {
    const snapshots = repository(backup)
    const recovered = { ...backup, fetchedAt: Date.now(), topAlbums: [] }
    const work: Promise<unknown>[] = []
    expect(await loadMusicDashboard(async () => recovered, snapshots, (promise) => { work.push(promise) })).toEqual(recovered)
    await Promise.all(work)
    expect(await snapshots.read("piyushk12")).toEqual(recovered)
  })

  it("fails explicitly when no successful snapshot has ever been saved", async () => {
    await expect(loadMusicDashboard(unavailable, repository(null), () => {})).rejects.toThrow("No music snapshot")
  })
})
