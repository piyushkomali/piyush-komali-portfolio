import { Navigation } from "@/components/navigation"
import { MobileNavigation } from "@/components/mobile-navigation"
import { AboutSection } from "@/components/about-section"

export default function About() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <MobileNavigation />
      <div className="pt-16">
        <AboutSection />
      </div>
    </main>
  )
}
