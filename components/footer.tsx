import Image from "next/image"
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/eventsco-logo.png"
                alt="Events-Co"
                width={40}
                height={40}
                className="object-contain brightness-0 invert"
              />
              <span className="font-serif text-xl font-semibold tracking-tight">
                EVENTS<span className="text-accent">CO</span>
              </span>
            </div>
            <p className="text-primary-foreground/70 leading-relaxed">
              Creating unforgettable moments through meticulous planning and exceptional execution.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-3 text-primary-foreground/70">
              <li>
                <a href="#services" className="hover:text-accent transition-colors">
                  Weddings
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-accent transition-colors">
                  Corporate Events
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-accent transition-colors">
                  Décor & Florals
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-accent transition-colors">
                  Catering
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-accent transition-colors">
                  Entertainment
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-primary-foreground/70">
              <li>
                <a href="#about" className="hover:text-accent transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-accent transition-colors">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-accent transition-colors">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-accent transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-primary-foreground/70">
              <li>+44 (0) 7440 251667</li>
              <li>enquiry@events-co.co.uk</li>
              <li>Serving clients nationwide across the UK</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <p>© {currentYear} Events-Co. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-accent transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
