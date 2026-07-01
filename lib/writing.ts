import fs from "node:fs/promises"
import path from "node:path"

export type PostMeta = {
  slug: string
  title: string
  description: string
  date: string
  readingTime: string
}

const CONTENT_DIR = path.join(process.cwd(), "content", "writing")

/** very small frontmatter parser — no yaml dependency */
function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }
  const [, fm, content] = match
  const data: Record<string, string> = {}
  for (const line of fm.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!m) continue
    let value = m[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    data[m[1]] = value
  }
  return { data, content }
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const files = await fs.readdir(CONTENT_DIR)
  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8")
        const { data } = parseFrontmatter(raw)
        return {
          slug: file.replace(/\.mdx$/, ""),
          title: data.title,
          description: data.description,
          date: data.date,
          readingTime: data.readingTime ?? "",
        }
      })
  )
  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

export async function getPost(
  slug: string
): Promise<{ meta: PostMeta; content: string } | null> {
  const file = path.join(CONTENT_DIR, `${slug}.mdx`)
  try {
    const raw = await fs.readFile(file, "utf8")
    const { data, content } = parseFrontmatter(raw)
    return {
      meta: {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        readingTime: data.readingTime ?? "",
      },
      content,
    }
  } catch {
    return null
  }
}
