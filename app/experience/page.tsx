import { Navigation } from "@/components/navigation"
import { MobileNavigation } from "@/components/mobile-navigation"
import { ExperienceSection } from "@/components/experience-section"

export default function Experience() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <MobileNavigation />
      <div className="pt-16">
        <ExperienceSection />
      </div>
    </main>
  )
}
