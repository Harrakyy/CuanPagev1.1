import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/sections/hero"
import { LayananSection } from "@/components/sections/layanan"
import { ProjectSection } from "@/components/sections/project"
import { PricingSection } from "@/components/sections/pricing"
import { TestimoniSection } from "@/components/sections/testimoni"
import { FAQSection } from "@/components/sections/faq"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <LayananSection />
      <ProjectSection />
      <PricingSection />
      <TestimoniSection />
      <FAQSection />
      <Footer />
    </main>
  )
}
