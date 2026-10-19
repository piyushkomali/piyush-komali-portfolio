export function tmdbPosterVariants(src: string) {
  try {
    const url = new URL(src)
    const match = url.pathname.match(/^\/t\/p\/(?:w\d+|original)\/(.+)$/)
    if (url.protocol !== "https:" || url.hostname !== "image.tmdb.org" || !match) return null

    const poster = (size: string) => `${url.origin}/t/p/${size}/${match[1]}${url.search}`
    return { small: poster("w92"), medium: poster("w154"), large: poster("w185") }
  } catch {
    return null
  }
}

