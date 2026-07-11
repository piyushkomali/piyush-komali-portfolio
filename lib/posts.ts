import type { ComponentType } from "react"

import * as mcpSseToStreamableHttp from "@/content/posts/mcp-sse-to-streamable-http.mdx"

export type PostMeta = {
  slug: string
  title: string
  date: string
  readingTime: string
  category: string
  excerpt: string
}

export type TocEntry = {
  id: string
  title: string
  level: number
}

type PostModule = {
  meta: PostMeta
  toc: TocEntry[]
  default: ComponentType
}

const postModules: Record<string, PostModule> = {
  "mcp-sse-to-streamable-http": mcpSseToStreamableHttp as unknown as PostModule,
}

export const posts: PostMeta[] = Object.values(postModules)
  .map((m) => m.meta)
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export function getPostBySlug(slug: string): PostModule | undefined {
  return postModules[slug]
}

export function getAllPostSlugs(): string[] {
  return Object.keys(postModules)
}
