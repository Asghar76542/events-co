"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      <div className="absolute inset-0 z-0" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
        <img
          src="/luxury-wedding-venue-elegant-ballroom-chandelier-g.jpg"
          alt="Luxury event venue"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent text-sm font-medium mb-6 animate-fade-in-down">
            <Sparkles size={16} className="animate-pulse-slow" />
            <span>Luxury Event Management</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-tight text-balance animate-fade-in-up">
            Complete Peace of Mind.
            <br />
            <span className="text-gradient-gold">Every Event,</span> Perfectly Planned.
          </h1>

          <p
            className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed text-pretty animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Luxury weddings, corporate events, and bespoke celebrations — designed and delivered nationwide with
            meticulous attention to every detail.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 h-12 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/50"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Request a Quote
              <ArrowRight className="ml-2" size={18} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 h-12 bg-transparent hover:scale-105 transition-all duration-300"
              onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Gallery
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
        <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-accent rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
