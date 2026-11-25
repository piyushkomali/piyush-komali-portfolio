import { z } from "zod"

const track = z.object({
  name: z.string(), artist: z.string(), album: z.string(), image: z.string().nullable(),
  url: z.string().nullable(), isPlaying: z.boolean(), playedAt: z.number().nullable(),
})
const artist = z.object({ name: z.string(), playcount: z.number(), url: z.string().nullable(), image: z.string().nullable() })
export const musicSchema = z.object({
  username: z.string(), nowPlaying: track.nullable(), lastTrack: track.nullable(),
  recentTracks: z.array(track), topArtists: z.array(artist),
  topAlbums: z.array(artist.extend({ artist: z.string() })),
})

export const musicDashboardSchema = musicSchema.extend({ fetchedAt: z.number().finite().positive() })
export type MusicDashboard = z.infer<typeof musicDashboardSchema>
