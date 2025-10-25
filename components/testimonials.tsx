import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah & James",
      location: "Derby",
      text: "Events-Co delivered beyond our imagination — flawless planning and execution. Our wedding day was absolutely perfect, and we couldn't have asked for a better team to bring our vision to life.",
      rating: 5,
    },
    {
      name: "Priya & Raj",
      location: "London",
      text: "The attention to detail for our Indian wedding was extraordinary. Every element, from the mandap to the catering, was executed with precision and cultural sensitivity. Truly exceptional service.",
      rating: 5,
    },
    {
      name: "Michael Thompson",
      location: "Manchester",
      text: "Our corporate gala was a resounding success thanks to Events-Co. Professional, creative, and incredibly organized. They handled everything seamlessly and our clients were thoroughly impressed.",
      rating: 5,
    },
  ]

  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            Testimonials
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
            Don't just take our word for it — hear from the clients who trusted us with their most important
            celebrations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border">
              <CardContent className="p-8 space-y-6">
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={20} className="fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed italic">"{testimonial.text}"</p>
                <div className="pt-4 border-t border-border">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
