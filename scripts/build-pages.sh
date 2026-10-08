#!/bin/sh
set -eu

# The checker canary is published to npm, not as a GitHub release tag.
# Bootstrap it explicitly rather than asking Pages to resolve packageManager.
portfolio_bun_dir=$(mktemp -d)
trap 'rm -rf "$portfolio_bun_dir"' EXIT HUP INT TERM
npm install --prefix "$portfolio_bun_dir" --no-package-lock --no-audit --no-fund bun@1.4.2-canary.20261008.1
PATH="$portfolio_bun_dir/node_modules/.bin:$PATH"
export PATH

portfolio_bun_revision=$(bun --revision)
if [ "$portfolio_bun_revision" != "1.4.3-canary.1+620b50f6a" ]; then
  echo "Unexpected Bun revision: $portfolio_bun_revision" >&2
  exit 1
fi
bun install --frozen-lockfile
bun run build
# Validate the Functions bundle with the same compatibility settings as production.
# Keep the artifact outside out/; Pages bundles functions/ when it deploys.
node node_modules/wrangler/bin/wrangler.js pages functions build functions \
  --outdir .wrangler/pages-build \
  --build-output-directory out \
  --compatibility-date 2026-09-14 \
  --compatibility-flags nodejs_compat
