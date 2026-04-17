"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Loader2,
  Info,
  Layers,
  Timer,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getActiveServices, createOrder, type Service } from "@/lib/supabase/queries"
import { useAuth } from "@/contexts/auth-context"

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "Company Profile":  <Layers className="h-6 w-6" />,
  "Landing Page":     <ArrowRight className="h-6 w-6" />,
  "E-Commerce":       <Layers className="h-6 w-6" />,
  "Portfolio Website":<Layers className="h-6 w-6" />,
  "Custom System":    <Layers className="h-6 w-6" />,
  "Maintenance":      <Timer className="h-6 w-6" />,
}

/* ─── Skeleton ─────────────────────────────────────────── */
function ServiceCardSkeleton() {
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────── */
export default function LayananPage() {
  const { user } = useAuth()
  const [services, setServices]           = useState<Service[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isDialogOpen, setIsDialogOpen]   = useState(false)
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [deadline, setDeadline]           = useState("")
  const [notes, setNotes]                 = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await getActiveServices()
        setServices(data)
      } catch {
        toast.error("Gagal memuat layanan")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleOrder = (service: Service) => {
    setSelectedService(service)
    setDeadline("")
    setNotes("")
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!user || !selectedService) return
    setIsSubmitting(true)
    try {
      await createOrder({
        customer_id: user.id,
        service_id: selectedService.id,
        deadline: deadline || undefined,
        internal_notes: notes || undefined,
      })
      setIsDialogOpen(false)
      toast.success("Pesanan berhasil dikirim! Admin akan segera menghubungi kamu.", {
        duration: 5000,
      })
    } catch {
      toast.error("Gagal membuat pesanan, coba lagi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const slotsLeft    = (s: Service) => s.max_slots - s.current_slots
  const slotsPercent = (s: Service) => Math.round((s.current_slots / s.max_slots) * 100)
  const isFull       = (s: Service) => s.current_slots >= s.max_slots

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <main className="container mx-auto px-4 sm:px-6 py-16">

        {/* ── Page Header ─────────────────────────────────── */}
        <div className="mb-16 text-center">
          <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4 block">
            LAYANAN KAMI
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            Pilih Layanan Kamu
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-base">
            Dikerjakan profesional, revisi hingga puas, garansi tepat waktu.
          </p>
        </div>

        {/* ── Feature Pills ────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {[
            { icon: CheckCircle, text: "Revisi hingga puas" },
            { icon: Clock,       text: "Pengerjaan tepat waktu" },
            { icon: Users,       text: "Support after launch" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 border border-border rounded-full px-4 py-1.5 text-sm text-muted-foreground"
            >
              <Icon className="h-3.5 w-3.5" />
              {text}
            </div>
          ))}
        </div>

        {/* ── Services Grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)
            : services.map((service) => {
                const full    = isFull(service)
                const slots   = slotsPercent(service)
                const left    = slotsLeft(service)
                const almostFull = !full && slots >= 70

                return (
                  <div
                    key={service.id}
                    className={cn(
                      "group relative border border-border rounded-2xl overflow-hidden flex flex-col",
                      "bg-card transition-all duration-300",
                      "hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-1",
                      full && "opacity-50 pointer-events-none"
                    )}
                  >
                    {/* Top accent line */}
                    <div
                      className={cn(
                        "h-0.5 w-full transition-all duration-500",
                        full        ? "bg-border"
                        : almostFull ? "bg-foreground/40"
                        : "bg-foreground/0 group-hover:bg-foreground/20"
                      )}
                    />

                    {/* Icon area */}
                    <div className="h-36 flex items-center justify-center bg-muted/40 relative">
                      <div className="flex items-center justify-center size-14 rounded-2xl bg-card border border-border text-foreground shadow-sm">
                        {SERVICE_ICONS[service.nama] ?? <Layers className="h-6 w-6" />}
                      </div>

                      {/* Slot penuh overlay */}
                      {full && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                          <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground border border-border px-3 py-1 rounded-full">
                            Slot Penuh
                          </span>
                        </div>
                      )}

                      {/* Almost full tag */}
                      {almostFull && (
                        <span className="absolute top-3 right-3 text-[10px] font-semibold tracking-widest uppercase bg-foreground text-background px-2 py-0.5 rounded-full">
                          Hampir Penuh
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-base font-bold text-foreground mb-1.5 tracking-tight">
                        {service.nama}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                        {service.deskripsi}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {service.estimasi === "0"
                              ? "Bulanan"
                              : `${service.estimasi} hari`}
                          </span>
                        </div>
                        <span className="text-xs tracking-wider font-semibold uppercase text-foreground border border-border px-2.5 py-0.5 rounded-full">
                          Harga Sesuai Kebutuhan
                        </span>
                      </div>

                      {/* Slot progress */}
                      <div className="mb-5">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                          <span>Slot tersedia</span>
                          <span className={cn(slots >= 90 && "text-foreground font-semibold")}>
                            {left} / {service.max_slots}
                          </span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              slots >= 90
                                ? "bg-foreground"
                                : slots >= 70
                                ? "bg-foreground/60"
                                : "bg-foreground/30"
                            )}
                            style={{ width: `${slots}%` }}
                          />
                        </div>
                      </div>

                      {/* CTA */}
                      <Button
                        className={cn(
                          "w-full rounded-xl font-semibold gap-2 transition-all duration-200",
                          full
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-foreground text-background hover:bg-foreground/85"
                        )}
                        disabled={full}
                        onClick={() => handleOrder(service)}
                      >
                        Pesan Sekarang
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Button>
                    </div>
                  </div>
                )
              })}
        </div>

        {!isLoading && services.length === 0 && (
          <div className="text-center py-20 text-muted-foreground text-sm tracking-wide">
            Belum ada layanan tersedia saat ini.
          </div>
        )}
      </main>

      {/* ── Order Dialog ─────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight text-foreground">
              {selectedService?.nama}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Isi detail pesanan kamu. Admin akan menghubungi untuk konfirmasi dan diskusi lebih lanjut.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Info alur harga */}
            <div className="border border-border rounded-xl p-4 bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-full border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Harga menyesuaikan kebutuhanmu
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Setelah kamu submit, admin akan menghubungi untuk mendiskusikan kebutuhan secara detail dan memberikan penawaran terbaik.
                  </p>
                </div>
              </div>
              {selectedService?.estimasi && (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Estimasi:{" "}
                    <strong className="text-foreground">
                      {selectedService.estimasi === "0"
                        ? "Bulanan"
                        : `${selectedService.estimasi} hari`}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="deadline" className="text-sm font-medium text-foreground">
                Target Selesai{" "}
                <span className="text-muted-foreground font-normal">(opsional)</span>
              </Label>
              <Input
                id="deadline"
                type="date"
                className="mt-1.5 border-border rounded-xl"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                Ceritakan Kebutuhanmu{" "}
                <span className="text-muted-foreground font-normal">(opsional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Ceritakan kebutuhan websitemu, referensi desain, fitur yang diinginkan..."
                className="mt-1.5 resize-none border-border rounded-xl"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Notice */}
            <div className="flex items-start gap-2 border border-border rounded-xl p-3 bg-muted/20">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pesananmu akan berstatus{" "}
                <strong className="text-foreground">Menunggu Konfirmasi</strong>{" "}
                hingga admin mereview kebutuhanmu. Kamu akan dihubungi via WhatsApp.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
              className="rounded-xl border-border"
            >
              Batal
            </Button>
            <Button
              className="bg-foreground text-background hover:bg-foreground/85 rounded-xl gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Kirim Pesanan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}