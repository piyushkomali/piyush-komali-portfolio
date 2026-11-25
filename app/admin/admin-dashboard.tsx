"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"
import { AdminChatMessage } from "@/components/admin-chat-message"

type ReviewRow = {
  id: string
  title: string
  year: number | null
  poster_url: string | null
  rating: number
  liked: boolean
  rewatch: boolean
  review: string | null
  watched_on: string
  tags: string[]
  letterboxd_url: string | null
  tmdb_id: number | null
  created_at: string
}

function latestSuccessfulReviewMutationKey(messages: UIMessage[]): string | null {
  for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex--) {
    const message = messages[messageIndex]

    for (let partIndex = message.parts.length - 1; partIndex >= 0; partIndex--) {
      const part = message.parts[partIndex]
      const isReviewMutation =
        part.type === "tool-importReviews" || part.type === "tool-deleteReview"

      if (!isReviewMutation || !("state" in part) || part.state !== "output-available") {
        continue
      }

      const toolCallId =
        "toolCallId" in part && typeof part.toolCallId === "string"
          ? part.toolCallId
          : `${message.id}:${partIndex}`

      return `${part.type}:${toolCallId}`
    }
  }

  return null
}

export function AdminDashboard() {
  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const [input, setInput] = useState("")
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const latestRequestId = useRef(0)
  const reviewMutationKey = latestSuccessfulReviewMutationKey(messages)

  const loadReviews = useCallback(async () => {
    const requestId = ++latestRequestId.current
    setReviewsLoading(true)
    setReviewsError(null)
    try {
      const res = await fetch("/api/admin/reviews", { cache: "no-store" })
      if (requestId !== latestRequestId.current) return
      if (!res.ok) {
        setReviewsError(`Failed to load (${res.status})`)
        setReviews([])
      } else {
        const data = (await res.json()) as { reviews: ReviewRow[] }
        if (requestId !== latestRequestId.current) return
        setReviews(data.reviews || [])
      }
    } catch (e) {
      if (requestId !== latestRequestId.current) return
      setReviewsError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      if (requestId === latestRequestId.current) setReviewsLoading(false)
    }
  }, [])

  useEffect(() => {
    const requestCounter = latestRequestId
    // oxlint-disable-next-line react/set-state-in-effect -- Start the initial fetch with its loading and error state.
    loadReviews()
    return () => {
      requestCounter.current++
    }
  }, [loadReviews])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- Refresh reviews and loading state after a chat mutation.
    if (reviewMutationKey) loadReviews()
  }, [reviewMutationKey, loadReviews])

  async function onSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || status === "streaming" || status === "submitted") return
    const text = input
    setInput("")
    await sendMessage({ text })
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this review?")) return
    const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    if (res.ok) loadReviews()
  }

  async function onLogout() {
    const response = await fetch("/api/admin/login", { method: "DELETE" })
    if (response.ok) window.location.replace("/admin/login")
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Reviews CMS</h1>
          <p className="text-[11px] text-white/50">
            Paste Letterboxd reviews in the chat. The AI will parse, look up posters, and save.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="text-xs text-white/60 hover:text-white/90 border border-white/15 rounded-md px-2 py-1"
        >
          Log out
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:h-[calc(100dvh-61px)]">
        {/* Chat panel */}
        <section className="h-[80dvh] lg:h-auto min-h-0 min-w-0 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-xs text-white/40 space-y-2">
                <p>Paste one or more Letterboxd reviews here. For example:</p>
                <pre className="whitespace-pre-wrap font-mono bg-white/5 border border-white/10 rounded p-3 text-[11px] leading-relaxed">
{`Dune: Part Two (2024) ★★★★½
Watched 02 Mar 2024
Villeneuve delivers a masterclass in world-building. The sandworm riding sequence alone justifies the price of admission.`}
                </pre>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className="text-sm">
                <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
                  {m.role === "user" ? "You" : "Assistant"}
                </div>
                <AdminChatMessage message={m} />
              </div>
            ))}

            {error && (
              <div className="text-xs text-red-400 border border-red-500/30 rounded p-2">
                {error.message}
              </div>
            )}
          </div>

          <form
            onSubmit={onSend}
            className="border-t border-white/10 p-3 flex gap-2 items-end"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a Letterboxd review…"
              aria-label="Message the reviews assistant"
              rows={3}
              className="flex-1 resize-none rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30 font-mono"
              onKeyDown={(e) => {
                if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }}
            />
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={
                  !input.trim() || status === "streaming" || status === "submitted"
                }
                className="rounded-md bg-white text-black text-sm font-medium px-3 py-2 disabled:opacity-40"
              >
                {status === "streaming" || status === "submitted" ? "…" : "Send"}
              </button>
              <button
                type="button"
                disabled={status === "streaming" || status === "submitted"}
                onClick={() => setMessages([])}
                className="rounded-md border border-white/15 text-xs text-white/60 px-2 py-1 hover:text-white"
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        {/* Reviews list panel */}
        <section className="min-h-0 min-w-0 flex flex-col">
          <div className="border-b border-white/10 px-4 py-2 flex items-center justify-between">
            <h2 className="text-xs font-medium tracking-wider uppercase text-white/60">
              Saved Reviews
            </h2>
            <button
              onClick={loadReviews}
              className="text-[11px] text-white/50 hover:text-white/90"
            >
              Refresh
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {reviewsLoading && (
              <p className="text-xs text-white/40">Loading…</p>
            )}
            {reviewsError && (
              <p className="text-xs text-red-400">{reviewsError}</p>
            )}
            {!reviewsLoading && reviews.length === 0 && !reviewsError && (
              <p className="text-xs text-white/40">
                No reviews yet. Paste one in the chat to get started.
              </p>
            )}
            <ul className="space-y-2">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="flex gap-3 items-start bg-white/5 border border-white/10 rounded-md p-2"
                >
                  {r.poster_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.poster_url}
                      alt={r.title}
                      className="w-10 h-14 object-cover rounded-sm bg-white/5 border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded-sm bg-white/5 border border-white/10 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {r.title}
                      </span>
                      {r.year && (
                        <span className="text-[11px] text-white/40">
                          ({r.year})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-white/50 mt-0.5">
                      {r.rating}★ · {r.watched_on}
                      {r.liked && " · liked"}
                      {r.rewatch && " · rewatch"}
                    </div>
                    {r.review && (
                      <p className="text-[12px] text-white/70 mt-1 line-clamp-2">
                        {r.review}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onDelete(r.id)}
                    className="text-[11px] text-white/40 hover:text-red-400"
                    title="Delete"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  )
}
