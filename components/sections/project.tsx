"use client"
import NextImage from "next/image"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"

const projects = [
  {
    number: "01",
    category: "Web Development",
    title: "Web Layanan Jasa",
    description: "Platform e-commerce modern dengan sistem pembayaran terintegrasi.",
    tech: ["Next.js", "Stripe", "Tailwind"],
    image: "/n1.png",
  },
  {
    number: "02",
    category: "Integrated Manufacturing Systems",
    title: "Web Custom",
    description: "Sistem internal tracking perusahaan manufaktur mesin.",
    tech: ["Laravel", "Vite", "SQL"],
    image: "/n2.png",
  },
  {
    number: "03",
    category: "Web App",
    title: "Dashboard Analytics",
    description: "Dashboard analitik real-time untuk monitoring bisnis.",
    tech: ["TypeScript", "Chart.js", "API"],
  },
  {
    number: "04",
    category: "Landing Page",
    title: "Mobile Landing Page",
    description: "Landing page responsif dengan konversi tinggi.",
    tech: ["HTML/CSS", "JavaScript", "SEO"],
  },
]

export function ProjectSection() {
  return (
    <section id="project" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 block">
            PROJECT
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Portfolio Terbaru
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              className="group bg-muted/50 border border-border rounded-2xl overflow-hidden hover:border-foreground/20 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
          <div className="aspect-video relative overflow-hidden bg-muted">
            {project.image ? (
              <NextImage
                src={project.image}
                alt={project.title}
                width={800}
                height={450}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <span className="text-4xl font-bold text-muted-foreground/30">
                  {project.number}
                </span>
              </div>
            )}
          </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {project.category}
                  </span>
                  <ExternalLink className="size-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs bg-muted rounded-full px-3 py-1 text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
