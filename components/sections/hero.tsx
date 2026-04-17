"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonialCards = [
  {
    initial: "A",
    name: "Ahmad Rizki",
    quote: "Websitenya cepat dan super rapi!",
    position: { top: "15%", left: "5%" },
  },
  {
    initial: "D",
    name: "Dewi Sartika",
    quote: "CuanPage is the best! Project selesai on time!",
    position: { top: "20%", right: "5%" },
  },
  {
    initial: "B",
    name: "Budi Santoso",
    quote: "Hasil kerjanya sangat memuaskan!",
    position: { top: "65%", left: "3%" },
  },
  {
    initial: "S",
    name: "Siti Nurhaliza",
    quote: "Komunikasi lancar, hasil maksimal!",
    position: { top: "70%", right: "3%" },
  },
]

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Floating Testimonial Cards - Hidden on mobile */}
      {testimonialCards.map((card, index) => (
        <motion.div
          key={card.name}
          className="absolute hidden lg:block w-64 bg-card border border-border rounded-2xl p-4 shadow-sm"
          style={{
            top: card.position.top,
            left: card.position.left,
            right: card.position.right,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + index * 0.2, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
              {card.initial}
            </div>
            <span className="text-sm font-medium text-foreground">{card.name}</span>
          </div>
          <div className="flex gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-3 fill-foreground text-foreground" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{`"${card.quote}"`}</p>
        </motion.div>
      ))}

      {/* Hero Center Content */}
      <div className="container mx-auto px-4 text-center z-10">
        <motion.span
          className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          KEAHLIAN KAMI
        </motion.span>
        
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-center leading-[1.08] sm:leading-[1.05] tracking-tight max-w-4xl mx-auto text-foreground text-balance"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Website tampilan profesional kelar dalam 24 jam.
        </motion.h1>
        
        <motion.p
          className="text-muted-foreground text-center mt-6 text-base sm:text-lg max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Mentok di Budget?, Butuh cepat?. nego sama AI Assistent kami!.
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button className="w-full sm:w-auto rounded-full px-8 py-3 h-auto font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors duration-300">
            {"Mulai Project →"}
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto rounded-full px-8 py-3 h-auto font-medium border-border hover:border-foreground/20 transition-colors duration-300"
          >
            Lihat Portfolio
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
