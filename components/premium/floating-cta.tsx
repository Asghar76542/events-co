"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 800) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div
      className={`fixed bottom-8 right-8 z-40 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      }`}
    >
      <Button
        size="lg"
        onClick={scrollToContact}
        className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-2xl hover:shadow-accent/50 hover:scale-105 transition-all duration-300"
      >
        <Calendar className="mr-2" size={20} />
        Book Consultation
      </Button>
    </div>
  )
}
