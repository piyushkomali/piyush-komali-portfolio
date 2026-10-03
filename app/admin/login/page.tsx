import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Admin</h1>
        <p className="text-sm text-white/60 mb-6">Enter password to continue.</p>
        <Suspense fallback={<p className="text-sm text-white/60">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
