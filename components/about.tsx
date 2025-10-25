"use client"

import { useEffect, useRef, useState } from "react"
import { Award, Heart, Users } from "lucide-react"
import { StatCounter } from "./stats-counter"

export function About() {
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

  const features = [
    {
      icon: Heart,
      title: "Passion for Perfection",
      description: "Every detail meticulously crafted to exceed your expectations",
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Seasoned professionals dedicated to bringing your vision to life",
    },
    {
      icon: Award,
      title: "Proven Excellence",
      description: "Years of experience creating unforgettable moments",
    },
  ]

  return (
    <section id="about" ref={ref} className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className={`space-y-6 ${isVisible ? "animate-slide-in-left" : "opacity-0"}`}>
            <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
              About Events-Co
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Artistry and Precision in Every Celebration
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                Events-Co brings artistry and precision to every celebration. From elegant weddings to corporate galas,
                our experts handle every detail — décor, catering, entertainment, transport, and beyond.
              </p>
              <p className="text-lg">
                We believe that exceptional events are born from meticulous planning, creative vision, and unwavering
                dedication. Our team works tirelessly to transform your dreams into reality, ensuring every moment is
                perfectly orchestrated.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <StatCounter end={500} suffix="+" />
                <p className="text-sm text-muted-foreground mt-2">Events Delivered</p>
              </div>
              <div className="text-center">
                <StatCounter end={15} suffix="+" />
                <p className="text-sm text-muted-foreground mt-2">Years Experience</p>
              </div>
              <div className="text-center">
                <StatCounter end={98} suffix="%" />
                <p className="text-sm text-muted-foreground mt-2">Client Satisfaction</p>
              </div>
            </div>
          </div>

          <div className={`relative ${isVisible ? "animate-slide-in-right" : "opacity-0"}`}>
            <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-2xl">
              <img
                src="/luxury-wedding-setup-elegant-table-settings-gold-c.jpg"
                alt="Luxury event setup"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-accent/20 rounded-lg -z-10 animate-pulse-slow" />
            <div
              className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-lg -z-10 animate-pulse-slow"
              style={{ animationDelay: "1s" }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`text-center space-y-4 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-accent/30">
                <feature.icon size={28} />
              </div>
              <h3 className="font-serif text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
