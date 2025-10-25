"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Building2, Flower2, UtensilsCrossed, Music, Car } from "lucide-react"

export function Services() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  const services = [
    {
      icon: Sparkles,
      title: "Weddings",
      description:
        "From intimate ceremonies to grand celebrations, we create unforgettable wedding experiences tailored to your love story.",
      image: "/luxury-wedding-ceremony-elegant-aisle-floral-arran.jpg",
    },
    {
      icon: Building2,
      title: "Corporate Events",
      description:
        "Professional galas, conferences, and corporate celebrations that leave lasting impressions on your guests.",
      image: "/corporate-gala-event-elegant-ballroom-professional.jpg",
    },
    {
      icon: Flower2,
      title: "Décor & Florals",
      description: "Stunning visual designs and floral arrangements that transform venues into breathtaking spaces.",
      image: "/luxury-floral-arrangements-gold-centerpieces-elega.jpg",
    },
    {
      icon: UtensilsCrossed,
      title: "Catering & Dining",
      description: "Exquisite culinary experiences with premium catering services and bespoke menu design.",
      image: "/luxury-catering-elegant-food-presentation-fine-din.jpg",
    },
    {
      icon: Music,
      title: "Entertainment & AV",
      description:
        "World-class entertainment, lighting, sound systems, fireworks, and drone shows for spectacular moments.",
      image: "/fireworks-display-celebration-night-sky-spectacula.jpg",
    },
    {
      icon: Car,
      title: "Luxury Transport",
      description:
        "Premium vehicle services including vintage cars, limousines, and executive transport for your special day.",
      image: "/luxury-vintage-wedding-car-classic-automobile-eleg.jpg",
    },
  ]

  return (
    <section id="services" ref={ref} className="py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className={`text-center max-w-3xl mx-auto mb-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            Our Services
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Comprehensive Event Solutions
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
            From concept to execution, we provide end-to-end event management services that bring your vision to life
            with elegance and precision.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={service.title}
              className={`group overflow-hidden border-border hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 hover:-translate-y-2 ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-[3/2] overflow-hidden relative">
                <img
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 group-hover:scale-110">
                    <service.icon size={24} />
                  </div>
                  <h3 className="font-serif text-xl font-semibold">{service.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                <Button variant="link" className="text-accent p-0 h-auto font-medium group/btn">
                  Learn More
                  <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div
          className={`text-center mt-12 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          style={{ animationDelay: "0.6s" }}
        >
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-accent/30"
          >
            Explore All Services
            <ArrowRight className="ml-2" size={18} />
          </Button>
        </div>
      </div>
    </section>
  )
}
