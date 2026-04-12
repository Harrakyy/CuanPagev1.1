"use client"

import { motion } from "framer-motion"
import { Code2, Palette, Monitor, Zap, Search, Wrench } from "lucide-react"

const services = [
  {
    icon: Code2,
    title: "Web Development",
    description: "Pembuatan website custom dengan teknologi modern dan performa tinggi.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Desain antarmuka yang menarik dan pengalaman pengguna yang optimal.",
  },
  {
    icon: Monitor,
    title: "Responsive Design",
    description: "Website yang tampil sempurna di semua perangkat dan ukuran layar.",
  },
  {
    icon: Zap,
    title: "Optimasi Performa",
    description: "Website cepat dengan skor PageSpeed tinggi dan waktu muat minimal.",
  },
  {
    icon: Search,
    title: "SEO Optimization",
    description: "Optimasi mesin pencari untuk meningkatkan visibilitas online Anda.",
  },
  {
    icon: Wrench,
    title: "Maintenance & Support",
    description: "Dukungan teknis berkelanjutan dan pemeliharaan website Anda.",
  },
]

export function LayananSection() {
  return (
    <section id="layanan" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 block">
            LAYANAN
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Apa yang Kami Tawarkan
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              className="group bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-foreground/10 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="size-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-foreground transition-colors duration-300">
                <service.icon className="size-6 text-foreground group-hover:text-background transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
