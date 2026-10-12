export type Track = {
  name: string
  artist: string
  album: string
  image: string | null
  url: string | null
  isPlaying: boolean
  playedAt: number | null
}

export type Artist = {
  name: string
  playcount: number
  url: string | null
  image: string | null
}

export type Album = {
  name: string
  artist: string
  playcount: number
  url: string | null
  image: string | null
}

export type MusicData = {
  username: string
  nowPlaying: Track | null
  lastTrack: Track | null
  recentTracks: Track[]
  topArtists: Artist[]
  topAlbums: Album[]
}

