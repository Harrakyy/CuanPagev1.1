"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const pricingPlans = [
  {
    name: "Basic",
    price: "2.5 Juta IDR",
    popular: false,
    features: [
      "Landing Page 1 Halaman",
      "Desain Responsif",
      "Optimasi SEO Dasar",
      "Hosting 1 Tahun",
      "Revisi 2x",
    ],
  },
  {
    name: "Professional",
    price: "5 Juta IDR",
    popular: true,
    features: [
      "Website hingga 5 Halaman",
      "Desain Custom Premium",
      "Optimasi SEO Lengkap",
      "Hosting & Domain 1 Tahun",
      "Revisi Unlimited",
      "Integrasi Analytics",
      "Support 3 Bulan",
    ],
  },
  {
    name: "Enterprise",
    price: "10 Juta IDR",
    popular: false,
    features: [
      "Website Unlimited Halaman",
      "E-Commerce Integration",
      "Custom Backend/CMS",
      "Hosting Premium 1 Tahun",
      "Revisi Unlimited",
      "Maintenance 6 Bulan",
      "Priority Support 24/7",
    ],
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 block">
            PRICING
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Pilih Paket yang Sesuai
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative bg-card border rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                plan.popular ? "border-foreground/20" : "border-border"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {plan.popular && (
                <span className="absolute top-4 right-4 bg-foreground text-background text-xs rounded-full px-3 py-1">
                  Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-foreground mb-6">{plan.price}</div>
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="size-4 text-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`rounded-full w-full transition-colors duration-300 ${
                  plan.popular
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "border-border"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                Pilih Paket
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
