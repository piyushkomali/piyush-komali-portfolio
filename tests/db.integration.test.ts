import { randomUUID } from "node:crypto"
import { afterAll, describe, expect, it } from "vitest"
import { createReviews, deleteReview, getSql } from "@/lib/db"

const databaseUrl = process.env.TEST_DATABASE_URL
const integration = databaseUrl ? describe : describe.skip
const createdIds: string[] = []

integration("Neon review writes", () => {
  afterAll(async () => {
    if (!databaseUrl) return
    await Promise.all(createdIds.map((id) => deleteReview(databaseUrl, id)))
  })

  it("skips an exact URL but keeps numbered reviews distinct", async () => {
    const token = randomUUID()
    const base = `https://letterboxd.com/test/film/${token}/`
    const common = { title: token, rating: 4, watched_on: "2026-08-29" }
    const first = await createReviews(databaseUrl!, [
      { ...common, letterboxd_url: base },
      { ...common, letterboxd_url: `${base}1/` },
      { ...common, letterboxd_url: `${base}2/` },
    ])
    createdIds.push(...first.created.map((review) => review.id))
    expect(first.created).toHaveLength(3)

    const duplicate = await createReviews(databaseUrl!, [{ ...common, letterboxd_url: base }])
    expect(duplicate.created).toHaveLength(0)
    expect(duplicate.duplicateIndexes).toEqual([0])
  })

  it("allows multiple rows without Letterboxd URLs", async () => {
    const rows = await createReviews(databaseUrl!, [
      { title: randomUUID(), rating: 3, watched_on: "2026-08-29" },
      { title: randomUUID(), rating: 3, watched_on: "2026-08-29" },
    ])
    createdIds.push(...rows.created.map((review) => review.id))
    expect(rows.created).toHaveLength(2)
  })

  it("rolls back the batch on an unexpected constraint failure", async () => {
    const token = randomUUID()
    const url = `https://letterboxd.com/test/film/${token}/`
    await expect(
      createReviews(databaseUrl!, [
        { title: token, rating: 4, watched_on: "2026-08-29", letterboxd_url: url },
        { title: "invalid", rating: 9, watched_on: "2026-08-29" },
      ]),
    ).rejects.toThrow()
    const sql = getSql(databaseUrl!)
    const rows = await sql`SELECT id FROM reviews WHERE letterboxd_url = ${url}`
    expect(rows).toHaveLength(0)
  })
})
