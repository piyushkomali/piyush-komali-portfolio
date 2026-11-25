"use client"

import type { UIMessage } from "ai"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ReviewCatalog } from "@/lib/db"

export function ReviewCatalogTable({ catalog }: { catalog: ReviewCatalog }) {
  return (
    <div className="space-y-2 min-w-0">
      <p className="text-sm font-medium">
        {catalog.totalReviews} {catalog.totalReviews === 1 ? "review" : "reviews"} across {catalog.totalMovies} {catalog.totalMovies === 1 ? "movie" : "movies"}
      </p>
      <p className="text-xs text-white/50">
        {catalog.hasMore
          ? `Showing the latest ${catalog.returnedReviews} of ${catalog.totalReviews} reviews. Ask for all reviews to see the complete catalog.`
          : `Showing all ${catalog.returnedReviews} reviews, most recent first.`}
      </p>
      {catalog.reviews.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-white/15">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">Saved film reviews from the database</caption>
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Movie</th>
                <th scope="col" className="px-3 py-2 font-medium">Year</th>
                <th scope="col" className="px-3 py-2 font-medium">Rating</th>
                <th scope="col" className="px-3 py-2 font-medium">Watched</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {catalog.reviews.map((review) => (
                <tr key={review.id}>
                  <th scope="row" className="px-3 py-2 font-normal">{review.title}</th>
                  <td className="px-3 py-2 text-white/60">{review.year ?? "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{review.rating} / 5</td>
                  <td className="px-3 py-2 whitespace-nowrap text-white/60">{review.watched_on}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ToolResult({ part }: { part: UIMessage["parts"][number] }) {
  if (!("state" in part)) return null
  const isCatalog = part.type === "tool-listReviews"
  if (part.state === "output-error") {
    return <p role="alert" className="text-xs text-red-400">{isCatalog ? "Could not load reviews. Please retry." : "The operation failed. Please retry."}</p>
  }
  if (isCatalog && part.state === "output-available" && "output" in part) {
    const output = part.output as ReviewCatalog
    if (Array.isArray(output?.reviews)) return <ReviewCatalogTable catalog={output} />
    // Earlier chat clients returned a bare array without full-catalog counts.
    return <p className="text-xs text-white/50">Earlier review results have no catalog totals. Ask for all reviews to refresh.</p>
  }
  if (part.type === "tool-requestDeleteReview" && part.state === "output-available" && "output" in part) {
    const result = part.output as { confirmationPhrase?: string }
    if (result.confirmationPhrase) return (
      <div className="space-y-2">
        <p>Send this exact phrase to confirm deletion.</p>
        <code className="block break-all rounded bg-white/5 p-3 text-xs">{result.confirmationPhrase}</code>
      </div>
    )
  }
  return <p className="text-xs text-white/50">{isCatalog ? "Loading reviews…" : `${part.type.replace(/^tool-/, "")} · ${part.state === "output-available" ? "Completed" : "Working…"}`}</p>
}

export function AdminChatMessage({ message }: { message: UIMessage }) {
  const showsCatalog = message.parts.some((part) => part.type === "tool-listReviews")
  return (
    <div className="space-y-2 min-w-0 text-sm leading-relaxed">
      {message.parts.map((part, index) => {
        if (part.type === "text") {
          if (message.role === "user") return <p key={index} className="whitespace-pre-wrap break-words">{part.text}</p>
          if (showsCatalog) return null
          return (
            <ReactMarkdown
              key={index}
              remarkPlugins={[remarkGfm]}
              skipHtml
              className="space-y-2 break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-white/5 [&_pre]:p-3 [&_a]:underline [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2 [&_tr]:border-b [&_tr]:border-white/10"
              components={{
                table: ({ children }) => <div className="overflow-x-auto rounded-md border border-white/15"><table className="w-full text-left text-xs">{children}</table></div>,
                a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
              }}
            >
              {part.text}
            </ReactMarkdown>
          )
        }
        if (part.type.startsWith("tool-")) return <ToolResult key={index} part={part} />
        return null
      })}
    </div>
  )
}
