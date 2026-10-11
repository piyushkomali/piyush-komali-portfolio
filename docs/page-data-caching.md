# Music and reviews loading

The shared shell starts a one-time prefetch one second after mounting. Hover,
keyboard focus, and touch on the music/reviews links also start it immediately.
Automatic speculative requests are skipped for Save-Data and 2G connections.
Only the first five review posters and the music hero/first three album covers
are warmed; the browser selects the same responsive poster source as the page.

`lib/browser-resource.ts` shares completed results and in-flight requests across
client navigation. `useSyncExternalStore` supplies a stable empty server snapshot
for static export/hydration, then restores the browser snapshot. No API data is
stored in module state during server rendering. This small cache needs no new
package or infrastructure binding.

| Data | Client freshness | Session snapshot retention | Refresh |
| --- | --- | --- | --- |
| Music dashboard | 30 seconds from the Last.fm recent-track fetch | 15 minutes | Every 30 seconds while music is mounted and visible; stale mount/focus/resume |
| Reviews | 5 minutes | 24 hours | Stale mount/focus/resume; no polling |

Fresh snapshots suppress navigation requests. Stale snapshots display immediately
while a request runs. API errors preserve the last successful result and allow
retry after a five-second cooldown. Mounted, visible pages automatically retry
failed requests when the cooldown expires, including reviews (which have no
polling interval). Retry timers are removed on unmount; hidden tabs defer retries
until visibility resumes. A failed/expired music snapshot does not
present a cached track as live. The live indicator expires even while a slow
refresh is pending. Session persistence is best effort, schema checked, versioned,
and bounded by age; memory caching works when storage is blocked.

Music polling forces revalidation rather than checking freshness at each interval:
a slow previous response must not cause every other 30-second tick to be skipped.
Concurrent requests still share one promise. Leaving the music page removes its
polling interval. Hidden pages skip requests and refresh stale data on resume.

The public music URL is stable, without a timestamp query parameter. The Pages
Function uses a named Cloudflare Cache API cache for Last.fm payloads:

- Recent tracks: 15 seconds; the original fetch timestamp reaches the browser.
- Top artists/albums: 10 minutes each.
- The unused user-info request is removed.
- Only successful payloads are cached; upstream HTTP errors and Last.fm JSON errors
  fail the request rather than replacing successful data with empty arrays.
- Upstream requests time out after eight seconds; client requests after 15 seconds.
- Cache writes use `context.waitUntil`; cache failures fall back to live requests.
- Cache keys include deployment origin, schema version, username, and method, and
  never include API credentials. Public responses require browser revalidation;
  browser freshness is controlled by the shared resource.

Cloudflare Cache API entries are local to each data center, may be evicted, and do
not collapse simultaneous cold requests. Cloudflare Access-protected previews
may not support Cache API operations. Browser caching still works there. No
always-running server, database change, or new Cloudflare binding is required.
See [Cloudflare Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/).

A first-ever direct visit still needs a request. Prefetching can only hide that
wait when the user gives it a head start. Existing reviews API HTTP cache headers
remain in place; the client cache additionally prevents repeated navigation waits.

## Validation

Unit tests cover prefetch/mount deduplication, persistence restoration/expiry,
blocked storage, failure preservation/retry, force polling, and Last.fm caching
and upstream failure behavior. Browser checks should cover:

1. Throttle the network; load home and confirm music/review requests start before
   navigation. Navigate during the request and after it finishes; neither should
   start a duplicate API request.
2. Switch repeatedly between music and reviews, then reload music. Fresh results
   should render without another music request.
3. Keep music visible for two polling ticks. Data should update without a skeleton.
4. Fail the next refresh. Previous content should remain and live status expire.
5. Hide the browser tab, wait, and return: no hidden polling requests; stale data
   refreshes on return. Navigate away: no recurring music requests.
6. Test an empty session/direct load, unavailable APIs, and blocked sessionStorage.
