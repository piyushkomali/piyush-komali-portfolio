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
- Build command: `npm install -g bun@1.4.2-canary.20261008.1 && bun install --frozen-lockfile && bun run build`
- Set `SKIP_DEPENDENCY_INSTALL=1` so the explicit frozen Bun install controls dependencies.
  The build command bootstraps the pinned checker, since stable Bun 1.4.2 lacks it.
  Apply these build settings in the Cloudflare Pages dashboard for preview and production.
- Build output directory: `out`
- Workers AI binding: `AI`
- Add `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `TMDB_API_KEY`,
  and `LASTFM_API_KEY` as encrypted variables for both preview and production.
- Redeploy after adding or changing bindings.

Run the Neon migration before the first deployment. Schema changes must be added
as new files in `db/migrations`; do not edit an already-applied migration.

## Validation

`bun.lock` is the only project lockfile. Use `bun install --frozen-lockfile`
on build runners and `bun add` / `bun add -d` when adding packages.
`packageManager` records the pinned Bun distribution version. Stable Bun 1.4.2
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
bun run test
bun run typecheck
bun run build
bun run cf-typegen
```
