"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { galleryImages } from "@/lib/gallery-data"
import Link from "next/link"
import { ArrowLeft, X } from 'lucide-react'

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeCity, setActiveCity] = useState("all")
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const categories = [
    { id: "all", label: "All Events" },
    { id: "weddings", label: "Weddings" },
    { id: "corporate", label: "Corporate" },
    { id: "decor", label: "Décor" },
  ]

  const cities = [
    { id: "all", label: "All Cities" },
    { id: "Burton", label: "Burton" },
    { id: "Derby", label: "Derby" },
    { id: "Nottingham", label: "Nottingham" },
    { id: "Leicester", label: "Leicester" },
    { id: "Birmingham", label: "Birmingham" },
  ]

  const filteredImages = galleryImages.filter((item) => {
    const categoryMatch = activeCategory === "all" || item.category === activeCategory
    const cityMatch = activeCity === "all" || item.city === activeCity
    return categoryMatch && cityMatch
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center text-accent hover:text-accent/80 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Our Portfolio
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Browse through our extensive collection of events across the Midlands. From intimate ceremonies to grand celebrations, each event showcases our commitment to excellence.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-12 space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Filter by Event Type</h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    onClick={() => setActiveCategory(category.id)}
                    className={activeCategory === category.id ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* City Filter */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Filter by Location</h3>
              <div className="flex flex-wrap gap-3">
                {cities.map((city) => (
                  <Button
                    key={city.id}
                    variant={activeCity === city.id ? "default" : "outline"}
                    onClick={() => setActiveCity(city.id)}
                    className={activeCity === city.id ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
                  >
                    {city.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredImages.length} {filteredImages.length === 1 ? 'event' : 'events'}
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((item) => (
              <div 
                key={item.id} 
                className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
                onClick={() => setLightboxImage(item.image)}
              >
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-serif text-lg font-semibold text-primary-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-primary-foreground/90">{item.venue}</p>
                    <p className="text-xs text-primary-foreground/80">{item.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredImages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No events found matching your filters.</p>
              <Button 
                variant="outline" 
                className="mt-4 bg-transparent"
                onClick={() => {
                  setActiveCategory("all")
                  setActiveCity("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-accent transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxImage || "/placeholder.svg"}
            alt="Gallery image"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  )
}
