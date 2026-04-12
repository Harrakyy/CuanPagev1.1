"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"

const testimonials = [
  {
    initial: "A",
    name: "Ahmad Rizki",
    role: "CEO, TechStartup",
    quote: "Websitenya cepat dan super rapi! Tim CuanPage sangat profesional dan komunikatif selama proses pengerjaan.",
  },
  {
    initial: "D",
    name: "Dewi Sartika",
    role: "Owner, Fashion Store",
    quote: "Project selesai on time dengan hasil yang memuaskan. E-commerce kami sekarang berjalan lancar!",
  },
  {
    initial: "B",
    name: "Budi Santoso",
    role: "Marketing Manager",
    quote: "Hasil kerjanya sangat memuaskan! Traffic website kami meningkat 200% setelah redesign.",
  },
  {
    initial: "S",
    name: "Siti Nurhaliza",
    role: "Founder, Agency Creative",
    quote: "Komunikasi lancar, hasil maksimal! Sangat recommended untuk kebutuhan website profesional.",
  },
  {
    initial: "R",
    name: "Rudi Hermawan",
    role: "Director, Consulting Firm",
    quote: "Proses cepat, revisi responsif, dan hasilnya sesuai ekspektasi. Terima kasih CuanPage!",
  },
  {
    initial: "M",
    name: "Maya Putri",
    role: "Owner, Cafe & Restaurant",
    quote: "Website kami jadi lebih menarik dan booking online meningkat drastis. Sangat puas!",
  },
]

export function TestimoniSection() {
  return (
    <section id="testimoni" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 block">
            TESTIMONI
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Apa Kata Klien Kami
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/10 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Quote className="size-8 text-muted-foreground/30 mb-4" />
              <p className="text-foreground mb-6 leading-relaxed">{`"${testimonial.quote}"`}</p>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                  {testimonial.initial}
                </div>
                <div>
                  <div className="font-medium text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
