export type ResourceSnapshot<T> = {
  data: T | null
  fetchedAt: number
  error: boolean
}

/** Shared across client navigations; never populated during server rendering. */
export function createBrowserResource<T>(options: {
  key: string
  freshness: number
  retention: number
  load: () => Promise<{ data: T; fetchedAt: number }>
  validate: (data: unknown) => data is T
  warm?: (data: T) => void
}) {
  const empty: ResourceSnapshot<T> = { data: null, fetchedAt: 0, error: false }
  let snapshot = empty
  let restored = false
  let pending: Promise<void> | null = null
  let retryAt = 0
  const listeners = new Set<() => void>()
  const publish = (next: ResourceSnapshot<T>) => {
    snapshot = next
    listeners.forEach((listener) => listener())
  }
  const restore = () => {
    if (restored || typeof window === "undefined") return
    restored = true
    try {
      const saved = JSON.parse(sessionStorage.getItem(options.key) || "null")
      const age = Date.now() - saved?.fetchedAt
      if (saved && Number.isFinite(age) && age >= 0 && age < options.retention && options.validate(saved.data)) {
        publish({ data: saved.data, fetchedAt: saved.fetchedAt, error: false })
        options.warm?.(saved.data)
      }
    } catch {
      // Storage may be unavailable or contain an older schema. Memory still works.
    }
  }
  const refresh = (force = false): Promise<void> => {
    if (typeof window === "undefined") return Promise.resolve()
    restore()
    if (pending) return pending
    if ((!force && snapshot.data && Date.now() - snapshot.fetchedAt < options.freshness) || Date.now() < retryAt) {
      return Promise.resolve()
    }
    pending = options.load().then(({ data, fetchedAt }) => {
      publish({ data, fetchedAt, error: false })
      try {
        sessionStorage.setItem(options.key, JSON.stringify({ data, fetchedAt }))
      } catch {
        // Best effort persistence; do not turn a successful request into an error.
      }
      options.warm?.(data)
    }).catch(() => {
      retryAt = Date.now() + 5_000
      publish({ ...snapshot, error: true })
    }).finally(() => { pending = null })
    return pending
  }
  return {
    freshness: options.freshness,
    restore,
    refresh,
    getSnapshot: () => snapshot,
    getServerSnapshot: () => empty,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
}
