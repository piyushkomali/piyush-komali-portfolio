# Piyush Komali Portfolio

The site is a static Next.js export hosted on Cloudflare Pages. Dynamic APIs live
in `functions/` as Pages Functions. Film reviews are stored in Neon Postgres and
the private review importer uses a native Cloudflare Workers AI binding.

## Local setup

1. Install the pinned Bun CLI once with
   `npm install -g bun@1.4.2-canary.20261008.1`, then run `bun install`.
   `bun --revision` should report `1.4.3-canary.1+620b50f6a`.
   npm is only used to bootstrap this exact Bun release; Bun manages project dependencies.
2. Create a Neon project and copy its pooled connection string.
3. Create `.env.local` with `DATABASE_URL=...`, then run `bun run db:migrate`.
4. Copy `.dev.vars.example` to `.dev.vars` and fill in the Pages Function secrets.
5. Run `bun run cf-typegen`, then `bun run preview:build` to build and test the complete Pages runtime.

After the first build, use `bun run preview` to start Pages Functions against the
existing `out/` directory. Leave it running while editing Functions. Re-run
`bun run build` after editing Next.js pages or components; Wrangler will serve the
updated static output without restarting.

`bun run dev` serves the static Next.js frontend only; API calls require the Wrangler
preview command.

## Cloudflare Pages setup

- Project name in `wrangler.jsonc`: `piyush-komali-portfolio` (change it if the
  existing Pages project uses a different name).
- Build command: `sh scripts/build-pages.sh`
- `wrangler.jsonc` sets `BUN_VERSION=1.4.2` for Pages’ initial tool detection
  and `SKIP_DEPENDENCY_INSTALL=1` so the explicit frozen Bun install controls dependencies.
  The build command bootstraps the pinned checker, since stable Bun 1.4.2 lacks it.
  The script also verifies the production Pages Functions bundle with Wrangler.
  Do not put this npm-only canary version in `packageManager` or `BUN_VERSION`:
  Pages interprets it as a GitHub release tag and fails before building.
- Build output directory: `out`
- Workers AI binding: `AI`
- Add `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `TMDB_API_KEY`,
  and `LASTFM_API_KEY` as encrypted variables for both preview and production.
- Redeploy after adding or changing bindings.

Run the Neon migration before the first deployment. Schema changes must be added
as new files in `db/migrations`; do not edit an already-applied migration.

## Validation

`bun run lint` runs Oxlint with React, Next.js, TypeScript, accessibility checks,
and the recommended `@interfere/landmines` rules. Warnings also fail the command.
`bun run lint:fix` applies available safe fixes. Landmines requires Node.js
22.18 or newer. Generated Next.js, Cloudflare, and build files are excluded.
The Landmines preset checks for hidden failures and unreliable tests; it does
not attempt to determine whether code was written by AI.
The prefetch caching suites retain file-scoped test-double exceptions for their
browser/storage and Cloudflare cache simulations. Narrow React exceptions preserve
loading, hydration, and clock-based cache freshness behavior.

`bun.lock` is the only project lockfile. Use `bun install --frozen-lockfile`
on build runners and `bun add` / `bun add -d` when adding packages.
The Pages build script pins and verifies the Bun distribution. Stable Bun 1.4.2
cannot run `bun check`, so this project currently uses the canary above.

`bun run typecheck` runs Bun's native checker before the Next.js build.
Next.js development and builds run on Bun via `bun --bun next`; tests still
use Vitest through `bun run test`. Wrangler keeps its supported Node runtime,
so keep Node.js installed for Cloudflare tooling. Production APIs continue to
run as Cloudflare Pages Functions.

TypeScript stays installed for Next.js and editor support. Node, React, and MDX
ambient types are listed explicitly, and CSS imports have a declaration in
`types/assets.d.ts`. The preview script preserves its existing Wrangler 4.141.0 pin through `bunx`;
start, deploy, and type generation use the Wrangler version in `bun.lock`.
Native install scripts are explicitly allowed for Tailwind oxide, esbuild, and workerd.

```sh
bun run lint
bun run test
bun run typecheck
bun run build
bun run cf-typegen
```

### Music outage backup

Apply `db/migrations/0002_music_snapshot.sql` with `bun run db:migrate`
**before deploying** the music backup API. It uses the existing `DATABASE_URL`;
no new Cloudflare bindings are required. After deployment, request
`/api/now-playing` while Last.fm is healthy to seed the first backup, then verify
that `music_snapshots` contains the `piyushk12` row.

Every successful complete Last.fm suite saves one dashboard in Neon. Concurrent
older responses cannot overwrite a newer backup. If any section fails, the API
returns the entire last successful dashboard without an age cutoff, preserving
its timestamp and disabling live playback. No stale-data notice appears in the
music UI. Individual upstream section caches are bypassed so failed suites
cannot create a backup mixing fresh and cached sections.

A first-time browser can use this server backup. Before the first successful
snapshot exists, or if both Last.fm and the database are unavailable, the API
still returns an error; it cannot produce music data that was never saved.
Snapshot write failures are logged and do not prevent live music from loading.
