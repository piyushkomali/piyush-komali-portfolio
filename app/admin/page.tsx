import type { Metadata } from "next"
import { AdminDashboard } from "./admin-dashboard"

export const metadata: Metadata = {
  title: "Admin — Reviews CMS",
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminPage() {
  return <AdminDashboard />
}
