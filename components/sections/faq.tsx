"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Berapa lama waktu pengerjaan website?",
    answer: "Waktu pengerjaan tergantung pada kompleksitas project. Untuk landing page sederhana, kami bisa menyelesaikannya dalam 24 jam. Untuk website multi-halaman atau e-commerce, estimasi waktu pengerjaan adalah 3-7 hari kerja.",
  },
  {
    question: "Apakah termasuk hosting dan domain?",
    answer: "Ya! Semua paket kami sudah termasuk hosting selama 1 tahun. Untuk paket Professional dan Enterprise, kami juga menyediakan domain gratis selama 1 tahun pertama.",
  },
  {
    question: "Apakah bisa request revisi?",
    answer: "Tentu saja! Paket Basic mendapat 2x revisi, sedangkan paket Professional dan Enterprise mendapat revisi unlimited hingga Anda puas dengan hasilnya.",
  },
  {
    question: "Bagaimana proses pembayaran?",
    answer: "Pembayaran dilakukan secara bertahap: 50% di awal sebagai DP untuk memulai project, dan 50% sisanya setelah project selesai dan Anda puas dengan hasilnya. Kami menerima transfer bank dan e-wallet.",
  },
  {
    question: "Apakah ada garansi setelah website jadi?",
    answer: "Ya, kami memberikan garansi bug fix selama 30 hari setelah website live. Untuk paket Professional mendapat support 3 bulan, dan Enterprise mendapat maintenance 6 bulan.",
  },
  {
    question: "Bisakah website dikelola sendiri?",
    answer: "Tentu! Kami akan memberikan training dan dokumentasi lengkap cara mengelola website Anda. Untuk paket dengan CMS, Anda bisa dengan mudah update konten tanpa perlu coding.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 block">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Pertanyaan Umum
          </h2>
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-foreground/20 transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
