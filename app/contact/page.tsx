import type { Metadata } from "next"
import { Contact } from "@/components/contact"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ScrollProgress } from "@/components/premium/scroll-progress"
import { FloatingCTA } from "@/components/premium/floating-cta"
import { LoadingScreen } from "@/components/premium/loading-screen"

export const metadata: Metadata = {
  title: "Contact Us | Events-Co | Luxury Event Management",
  description: "Get in touch with Events-Co for luxury event planning. Contact us for weddings, corporate events, and bespoke celebrations.",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Contact />
      <Footer />
      <ScrollProgress />
      <FloatingCTA />
      <LoadingScreen />
    </main>
  )
}