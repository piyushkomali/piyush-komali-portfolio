import { createHash } from "node:crypto"
import { readdir, readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error("DATABASE_URL is required")

const here = dirname(fileURLToPath(import.meta.url))
const migrationsDirectory = join(here, "..", "db", "migrations")
const sql = neon(databaseUrl)

await sql`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename   TEXT PRIMARY KEY,
    checksum   TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`

const appliedRows = await sql`SELECT filename, checksum FROM schema_migrations`
const applied = new Map(appliedRows.map((row) => [row.filename, row.checksum]))
const files = (await readdir(migrationsDirectory))
  .filter((name) => /^\d+.*\.sql$/.test(name))
  .sort()

for (const filename of files) {
  const source = await readFile(join(migrationsDirectory, filename), "utf8")
  const checksum = createHash("sha256").update(source).digest("hex")
  const previousChecksum = applied.get(filename)

  if (previousChecksum) {
    if (previousChecksum !== checksum) {
      throw new Error(`Applied migration was modified: ${filename}`)
    }
    console.log(`already applied ${filename}`)
    continue
  }

  const statements = source
    .split(/^\s*-- statement-breakpoint\s*$/m)
    .map((statement) => statement.trim())
    .filter(Boolean)

  await sql.transaction([
    ...statements.map((statement) => sql.query(statement)),
    sql`INSERT INTO schema_migrations (filename, checksum) VALUES (${filename}, ${checksum})`,
  ])
  console.log(`applied ${filename}`)
}
