"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { use } from "react"
import Link from "next/link"
import { Check, MessageCircle, Star, Search, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

// Mock order data
const mockOrders: Record<string, {
  id: string
  service: string
  orderDate: string
  estimatedCompletion: string
  assignedTo: string
  status: "Pending" | "Dikerjakan" | "Review" | "Selesai"
  progress: number
  updates: { date: string; time: string; message: string }[]
}> = {
  "ORD-001": {
    id: "ORD-001",
    service: "Landing Page",
    orderDate: "15 Januari 2024",
    estimatedCompletion: "1 Februari 2024",
    assignedTo: "Tim Design A",
    status: "Dikerjakan",
    progress: 65,
    updates: [
      { date: "20 Jan 2024", time: "14:30", message: "Wireframe telah disetujui, melanjutkan ke tahap desain visual." },
      { date: "18 Jan 2024", time: "10:15", message: "Wireframe selesai, menunggu review dari klien." },
      { date: "16 Jan 2024", time: "09:00", message: "Memulai pembuatan wireframe dan struktur halaman." },
      { date: "15 Jan 2024", time: "11:00", message: "Pesanan diterima dan sedang diproses." },
    ],
  },
  "ORD-002": {
    id: "ORD-002",
    service: "Company Profile",
    orderDate: "10 Januari 2024",
    estimatedCompletion: "25 Januari 2024",
    assignedTo: "Tim Design B",
    status: "Review",
    progress: 90,
    updates: [
      { date: "22 Jan 2024", time: "16:00", message: "Website sudah live di staging, menunggu feedback final." },
      { date: "20 Jan 2024", time: "11:30", message: "Development selesai, memulai QA testing." },
      { date: "15 Jan 2024", time: "14:00", message: "Desain disetujui, memulai development." },
    ],
  },
  "ORD-003": {
    id: "ORD-003",
    service: "E-Commerce",
    orderDate: "5 Januari 2024",
    estimatedCompletion: "15 Februari 2024",
    assignedTo: "Tim Development",
    status: "Pending",
    progress: 10,
    updates: [
      { date: "6 Jan 2024", time: "10:00", message: "Pesanan masuk antrian, akan segera diproses." },
      { date: "5 Jan 2024", time: "14:30", message: "Pesanan diterima." },
    ],
  },
  "ORD-004": {
    id: "ORD-004",
    service: "Portfolio Website",
    orderDate: "20 Desember 2023",
    estimatedCompletion: "10 Januari 2024",
    assignedTo: "Tim Design A",
    status: "Selesai",
    progress: 100,
    updates: [
      { date: "10 Jan 2024", time: "15:00", message: "Project selesai dan sudah di-deploy ke domain klien." },
      { date: "8 Jan 2024", time: "11:00", message: "Revisi minor selesai, menunggu approval final." },
      { date: "5 Jan 2024", time: "09:30", message: "Website sudah live di staging untuk review." },
    ],
  },
}

const steps = ["Pending", "Dikerjakan", "Review", "Selesai"]

export default function TrackPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const [order, setOrder] = useState(mockOrders[orderId] || null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
      // In production, this would fetch fresh data
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const getMinutesAgo = () => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000)
    if (diff === 0) return "Baru saja"
    return `${diff} menit lalu`
  }

  const getStepIndex = (status: string) => steps.indexOf(status)
  const currentStepIndex = order ? getStepIndex(order.status) : -1

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  // Not found state
  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="py-6 text-center border-b border-border">
          <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
            CuanPage.
          </Link>
          <p className="text-sm text-muted-foreground mt-1">Lacak Pesanan</p>
        </header>

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              Pesanan Tidak Ditemukan
            </h1>
            <p className="text-muted-foreground mb-6">
              Periksa kembali ID pesanan kamu atau hubungi kami untuk bantuan.
            </p>
            <Button asChild className="bg-foreground text-background hover:bg-foreground/90 rounded-full">
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-6 text-center border-b border-border">
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
          CuanPage.
        </Link>
        <p className="text-sm text-muted-foreground mt-1">Lacak Pesanan</p>
      </header>

      <main className="max-w-lg mx-auto px-6 py-12">
        {/* Order Summary Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">No. Pesanan</span>
              <span className="text-sm font-medium text-foreground">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Layanan</span>
              <span className="text-sm font-medium text-foreground">{order.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tanggal Pesan</span>
              <span className="text-sm font-medium text-foreground">{order.orderDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Estimasi Selesai</span>
              <span className="text-sm font-medium text-foreground">{order.estimatedCompletion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Dikerjakan oleh</span>
              <span className="text-sm font-medium text-foreground">{order.assignedTo}</span>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className="relative">
                  {/* Connector Line */}
                  {index > 0 && (
                    <div
                      className={`absolute right-1/2 top-1/2 -translate-y-1/2 h-0.5 w-[calc(100%-1rem)] -translate-x-full ${
                        index <= currentStepIndex ? "bg-indigo-600" : "bg-muted"
                      }`}
                      style={{ width: "calc(100vw / 8)" }}
                    />
                  )}
                  {/* Step Circle */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      index < currentStepIndex
                        ? "bg-indigo-600"
                        : index === currentStepIndex
                        ? "bg-indigo-600 ring-4 ring-indigo-200 dark:ring-indigo-900 animate-pulse"
                        : "border-2 border-muted bg-background"
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : index === currentStepIndex ? (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    ) : null}
                  </div>
                </div>
                <span
                  className={`mt-2 text-xs text-center ${
                    index === currentStepIndex
                      ? "font-bold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm font-medium text-foreground">{order.progress}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${order.progress}%` }}
            />
          </div>
        </div>

        {/* Completed Banner */}
        {order.status === "Selesai" && !submitted && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-green-700 dark:text-green-400 text-center mb-4">
              Pesanan Selesai!
            </h3>
            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div>
                <p className="text-sm text-green-700 dark:text-green-400 mb-2 text-center">
                  Bagaimana pengalaman kamu?
                </p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Tulis feedback kamu (opsional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="rounded-xl resize-none"
                rows={3}
              />
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
                disabled={rating === 0}
              >
                Kirim Rating
              </Button>
            </form>
          </div>
        )}

        {submitted && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-8 text-center">
            <Check className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-green-700 dark:text-green-400 font-medium">
              Terima kasih atas feedback kamu!
            </p>
          </div>
        )}

        {/* Update Timeline */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Riwayat Update</h3>
          <div className="border-l-2 border-indigo-200 dark:border-indigo-800 pl-4 space-y-4">
            {order.updates.map((update, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <p className="text-xs text-muted-foreground">
                  {update.date} • {update.time}
                </p>
                <p className="text-sm text-foreground mt-1">{update.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Button */}
        <Button
          variant="outline"
          className="w-full rounded-full gap-2"
          asChild
        >
          <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            Chat via WhatsApp
          </a>
        </Button>

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-1 mt-6 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Diperbarui {getMinutesAgo()}</span>
        </div>
      </main>
    </div>
  )
}
