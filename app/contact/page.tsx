import { Navigation } from "@/components/navigation"
import { MobileNavigation } from "@/components/mobile-navigation"
import { ContactSection } from "@/components/contact-section"

export default function Contact() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <MobileNavigation />
      <div className="pt-16">
        <ContactSection />
      </div>
    </main>
  )
}
