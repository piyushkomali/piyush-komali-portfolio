import { Navigation } from "@/components/navigation"
import { ExperienceSection } from "@/components/experience-section"

export default function Experience() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <ExperienceSection />
      </div>
    </main>
  )
}
