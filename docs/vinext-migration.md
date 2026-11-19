# ViNext migration

Do not start this until the client caching PR (`lib/browser-resource.ts` and
`docs/page-data-caching.md`) has been reviewed and merged. That PR is the
behavior spec for music and reviews. This document is the follow-up plan, not
a change to make inside that PR.

Today the site is a Next.js 14 static export (`output: "export"`) on Cloudflare
Pages. HTML is baked into `out/`. Anything that needs a secret, Neon, Last.fm,
or Workers AI lives in `functions/` as Pages Functions. The browser then fetches
`/api/now-playing` and `/api/reviews`, caches the JSON, and prefetches it from
the nav shell because the HTML cannot contain it.

[vinext](https://github.com/cloudflare/vinext) runs the Next.js app surface on
Vite and deploys it as one Cloudflare Worker. Pages, route handlers, and
bindings share a process. That removes the reason most of the client cache
exists. Cloudflare’s current guide:
[Next.js on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/).

Start the actual migration with `npx vinext check`, then `npx vinext init`
(Cloudflare target). Adopt the config and deploy command that init emits.
As of November 2026 that path uses vinext’s Cloudflare config and
`npx @vinext/cloudflare deploy`, and it keeps `app/`, `next.config`, and
`public/`. Do not run `wrangler setup`; that configures OpenNext.

## Target shape

```text
Browser
  home, work, posts     static or server-rendered from files, no API
  /reviews              server component reads Neon, HTML includes reviews
  /music                server component sends the first dashboard
                        client island polls every 30s while visible
  /admin, /api/chat     route handlers, session cookie, Workers AI binding

One Worker
  app routes + route handlers
  env from cloudflare:workers (AI, secrets)
  Last.fm Cache API stays next to the music loader
  Neon stays the reviews database
```

`functions/` goes away. `lib/lastfm.ts`, `lib/db.ts`, `lib/auth.ts`, and
`lib/tmdb.ts` stay, and server code imports them directly.

## What changes

### Hosting

| Now | After |
| --- | --- |
| `next build` writes `out/`, `wrangler pages deploy out` | vinext build, deploy one Worker |
| `wrangler.jsonc` `pages_build_output_dir: ./out` | vinext Cloudflare config from `vinext init` |
| `bun run dev` has no APIs; `preview` serves `out/` plus Functions | one `dev:vinext` server for pages and APIs |
| Secrets and `AI` are Pages bindings | same secrets and `AI` binding on the Worker |

Drop `output: "export"`. Keep `trailingSlash` only if vinext check accepts it
and existing URLs must not change.

### APIs

Move each Pages Function to an App Router route handler. Behavior stays the
same; the wrapper changes from `onRequest(context)` to `export async function GET/POST`.

| Pages Function | Route handler |
| --- | --- |
| `functions/api/now-playing.ts` | `app/api/now-playing/route.ts` |
| `functions/api/reviews.ts` | `app/api/reviews/route.ts`, or delete the public GET once the page reads Neon itself |
| `functions/api/admin/login.ts` | `app/api/admin/login/route.ts` |
| `functions/api/admin/reviews.ts` | `app/api/admin/reviews/route.ts` |
| `functions/api/admin/_middleware.ts` | `middleware.ts` or a shared `requireAdmin()` in those handlers |
| `functions/api/chat.ts` | `app/api/chat/route.ts` |
| `functions/admin/[[path]].ts` | fold into the admin handlers or one catch-all route |

Read bindings with `import { env } from "cloudflare:workers"` inside server
components and route handlers. `context.env.AI` becomes `env.AI`.
`context.waitUntil` becomes the Workers execution context available to the
handler. The named Last.fm cache (`caches.open("portfolio-lastfm-v1")`) can
stay; it is an upstream cache, not a static-export workaround.

### Music and reviews

This is the simplification the caching PR is buying time for.

Reviews are a list that is fresh for minutes, not seconds. Load them in a
server component on `/reviews` with the same Zod schema and Neon repository.
The first HTML contains the reviews. Delete the reviews half of
`prefetchPage`, the reviews `sessionStorage` key, and the reviews call to
`usePageData`. Keep a short server cache (about 5 minutes) so every navigation
does not hit Neon. The public `/api/reviews` route can remain for the admin
tools if they need it; the page should not depend on it.

Music still changes while the tab is open. Split it:

1. Server component fetches the dashboard once per request and renders the
   first track, artists, and albums. Reuse `getLastFmDashboard` and the
   existing Cache API TTLs (recent tracks ~15s, tops ~10min).
2. A small client island receives that payload as its initial value and polls
   every 30 seconds while the document is visible. On failure, keep the last
   good payload and clear the live flag when freshness expires. That behavior
   is already specified in `docs/page-data-caching.md`.

After that split, delete:

- `prefetchPage` and the hover, focus, touch, and 1s shell prefetch in
  `components/site-shell.tsx`
- `getServerSnapshot` and the empty-snapshot rule, because the server and the
  first client render share the same payload
- `sessionStorage` retention for these two resources
- `warm()` image preloads, once posters are normal `<img>` tags in the server
  HTML
- `lib/browser-resource.ts` and `lib/use-page-data.ts` if the music island is
  the only remaining caller. A local `useEffect` interval is enough for one
  poll. Do not add a data-fetching library for this.

`SiteShell` can become a server component again. Only the music island and the
admin UI stay client components. Home, work, and posts do not need this layer.

### What stays

- Neon, `db/migrations`, and `scripts/migrate.mjs`
- Last.fm request shaping, schema version, and “do not cache failed upstream
  payloads”
- Admin password session, review import, and the Workers AI chat route
- MDX posts via `lib/posts.ts` and `generateStaticParams`
- Public music URL with no cache-busting query string
- Visibility rule for music polling: no requests while the tab is hidden

## Suggested order

1. Review and merge the caching PR. Treat `docs/page-data-caching.md` as the
   regression list. ViNext work starts only after that merge.
2. `npx vinext check` on this repo. Stop if MDX, `next/font/google`, or
   `trailingSlash` is unsupported; fix those before moving APIs.
3. `npx vinext init` beside the current Next scripts. Keep `bun run dev` and
   `bun run build` working until the Worker preview matches Pages.
4. Move `functions/` into route handlers. Point them at the same libs. Compare
   status codes, cache headers, and `X-Music-Fetched-At` against the Pages
   versions.
5. Turn `/reviews` into a server page. Confirm a cold load shows reviews with
   no `/api/reviews` call from the document.
6. Turn `/music` into server first paint plus the poll island. Confirm one
   forced poll updates the track, a failed poll keeps the previous track, and
   hiding the tab stops requests.
7. Delete the shell prefetch and `lib/browser-resource.ts` once nothing
   imports them. Update `docs/page-data-caching.md` to describe the server
   path.
8. Deploy the Worker to a preview hostname. Cut production over only after
   admin login, chat import, and a direct `/music` visit work there.

## Compatibility checks

Run these during step 2. They are the likely gaps for this repo, not a claim
that vinext rejects them.

- Next `14.2.16` is inside vinext’s stated range (Next 14+). Re-check the
  [compatibility dashboard](https://vinext.dev/compatibility) at migration time.
- `@next/mdx`, `remark-gfm`, and `rehype-slug` on `app/posts/[slug]`.
- `next/font/google` (`Space_Grotesk`) and `geist/font/mono`.
- `images.unoptimized: true` is already set; leave optimization off unless
  vinext’s image support is turned on deliberately.
- `@vercel/analytics` does not belong on a Worker. Remove it or replace it.
- `@neondatabase/serverless` from a route handler. Hyperdrive is optional, not
  required for the first cut.
- Pages `caches.open` plus `waitUntil` must be rewritten to the Worker cache
  and execution-context APIs.
- Bun stays the package runner. The Worker runtime is workerd, not Bun.

## Out of scope

- Rewriting the admin chat agent or the review schema
- Moving Neon to D1
- Adding SWR, React Query, or a second cache in front of the Worker
- Changing Last.fm or TMDB product behavior

The success test is smaller client code, not a new caching design. A direct
visit to `/reviews` and `/music` should render data before any client fetch,
and the only client loop left should be the visible-tab music poll.
