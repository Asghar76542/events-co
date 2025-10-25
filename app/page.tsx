import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Services } from "@/components/services"
import { Gallery } from "@/components/gallery"
import { Testimonials } from "@/components/testimonials"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { ScrollProgress } from "@/components/premium/scroll-progress"
import { FloatingCTA } from "@/components/premium/floating-cta"
import { LoadingScreen } from "@/components/premium/loading-screen"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <Services />
      <Gallery />
      <Testimonials />
      <Contact />
      <Footer />
      <ScrollProgress />
      <FloatingCTA />
      <LoadingScreen />
    </main>
  )
}
