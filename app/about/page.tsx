import { Navigation } from "@/components/navigation"
import { AboutSection } from "@/components/about-section"

export default function About() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <AboutSection />
      </div>
    </main>
  )
}
