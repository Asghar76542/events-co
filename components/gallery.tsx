"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { galleryImages } from "@/lib/gallery-data"

export function Gallery() {
  const previewImages = galleryImages.slice(0, 3)

  return (
    <section id="gallery" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            Portfolio
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Our Recent Work
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
            Explore our portfolio of beautifully executed events across Burton, Derby, Nottingham, Leicester, and Birmingham.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {previewImages.map((item) => (
            <div key={item.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-serif text-xl font-semibold text-primary-foreground">{item.title}</h3>
                  <p className="text-sm text-primary-foreground/90 mt-1">{item.venue}, {item.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/gallery">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              View Full Gallery
              <span className="ml-2">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
