# Piyush Komali Portfolio

The site is a static Next.js export hosted on Cloudflare Pages. Dynamic APIs live
in `functions/` as Pages Functions. Film reviews are stored in Neon Postgres and
the private review importer uses a native Cloudflare Workers AI binding.

## Local setup

1. Install dependencies with `pnpm install`.
2. Create a Neon project and copy its pooled connection string.
3. Create `.env.local` with `DATABASE_URL=...`, then run `pnpm db:migrate`.
4. Copy `.dev.vars.example` to `.dev.vars` and fill in the Pages Function secrets.
5. Run `pnpm cf-typegen`, then `pnpm preview` to test the complete Pages runtime.

`pnpm dev` serves the static Next.js frontend only; API calls require the Wrangler
preview command.

## Cloudflare Pages setup

- Project name in `wrangler.jsonc`: `piyush-komali-portfolio` (change it if the
  existing Pages project uses a different name).
- Build command: `pnpm build`
- Build output directory: `out`
- Workers AI binding: `AI`
- Add `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `TMDB_API_KEY`,
  and `LASTFM_API_KEY` as encrypted variables for both preview and production.
- Redeploy after adding or changing bindings.

Run the Neon migration before the first deployment. Schema changes must be added
as new files in `db/migrations`; do not edit an already-applied migration.

## Validation

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm cf-typegen
```
