"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { use } from "react"
import Link from "next/link"
import { Check, MessageCircle, Star, Search, Clock, Lock, Eye as EyeIcon, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import {
  getOrderByOrderNumber,
  getOrderUpdates,
  formatDate,
  type Order,
  type OrderUpdate,
} from "@/lib/supabase/queries"

const steps: Array<Order["status"]> = ["pending", "in_progress", "review", "completed"]

const statusLabels: Record<Order["status"], string> = {
  pending: "Menunggu",
  in_progress: "Dikerjakan",
  review: "Review",
  revision: "Revisi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
}

const statusBadge: Record<Order["status"], string> = {
  pending: "bg-black/5 text-black border border-black/10",
  in_progress: "bg-[#BEFF47] text-black border border-black/10",
  review: "bg-black/5 text-black border border-black/10",
  revision: "bg-black/5 text-black border border-black/10",
  completed: "bg-black/5 text-black border border-black/10",
  cancelled: "bg-black/5 text-black border border-black/10",
}

const approvalLabel: Record<Order["approval_status"], string> = {
  pending_approval: "Menunggu Approval",
  approved: "Approved",
  rejected: "Rejected",
}

const approvalBadge: Record<Order["approval_status"], string> = {
  pending_approval: "bg-black/5 text-black border border-black/10",
  approved: "bg-[#BEFF47] text-black border border-black/10",
  rejected: "bg-black text-white border border-black",
}

export default function TrackPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const { user, isLoading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [updates, setUpdates] = useState<OrderUpdate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function load() {
      if (authLoading) return
      if (!user) {
        setIsLoading(false)
        return
      }
      try {
        const orderData = await getOrderByOrderNumber(orderId)
        const isOwner = orderData.customer_id === user.id
        const isAdmin = user.role === "admin"
        if (!isOwner && !isAdmin) {
          setOrder(null)
          setUpdates([])
          return
        }

        const visibleUpdates = await getOrderUpdates(orderData.id, { visibleOnly: !isAdmin })
        setOrder(orderData)
        setUpdates(visibleUpdates)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [authLoading, orderId, user])

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

  const getStepIndex = (status: Order["status"]) => steps.indexOf(status)
  const currentStepIndex = order ? getStepIndex(order.status) : -1

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="py-6 text-center border-b border-border">
          <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
            CuanPage.
          </Link>
          <p className="text-sm text-muted-foreground mt-1">Lacak Pesanan</p>
        </header>
        <main className="flex-1 flex items-center justify-center px-6">
          <p className="text-sm text-muted-foreground">Memuat…</p>
        </main>
      </div>
    )
  }

  if (!user) {
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
            <h1 className="text-xl font-bold text-foreground mb-2">Login diperlukan</h1>
            <p className="text-muted-foreground mb-6">
              Silakan login untuk melihat progress pesananmu.
            </p>
            <Button asChild className="bg-foreground text-background hover:bg-foreground/90 rounded-full">
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Not found / no access
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
            <h1 className="text-xl font-bold text-foreground mb-2">Pesanan Tidak Ditemukan</h1>
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
              <span className="text-sm font-medium text-foreground">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Layanan</span>
              <span className="text-sm font-medium text-foreground">{order.service?.nama || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tanggal Pesan</span>
              <span className="text-sm font-medium text-foreground">{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Estimasi Selesai</span>
              <span className="text-sm font-medium text-foreground">{order.deadline ? formatDate(order.deadline) : "-"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Approval</span>
              <Badge className={cn("rounded-full", approvalBadge[order.approval_status])} variant="secondary">
                {approvalLabel[order.approval_status]}
              </Badge>
            </div>
            {order.approval_status === "rejected" && order.rejection_reason && (
              <div className="flex gap-2 items-start bg-black/5 border border-black/10 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 text-black/70" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-black">Alasan ditolak</p>
                  <p className="text-xs text-black/70 mt-0.5">{order.rejection_reason}</p>
                </div>
              </div>
            )}
            {order.approval_status === "approved" && (
              <div className="flex gap-2 items-start bg-black/5 border border-black/10 rounded-xl p-3">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-black/70" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-black">Pesanan kamu sedang diproses</p>
                  <p className="text-xs text-black/70 mt-0.5">
                    {order.status === "pending" ? "Menunggu admin memulai pengerjaan." : "Pantau update terbaru di bawah."}
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={cn("rounded-full", statusBadge[order.status])} variant="secondary">
                {statusLabels[order.status]}
              </Badge>
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
                        index <= currentStepIndex ? "bg-foreground" : "bg-muted"
                      }`}
                      style={{ width: "calc(100vw / 8)" }}
                    />
                  )}
                  {/* Step Circle */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      index < currentStepIndex
                        ? "bg-foreground"
                        : index === currentStepIndex
                        ? "bg-foreground ring-4 ring-muted animate-pulse"
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
                  {statusLabels[step]}
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
              className="h-full bg-foreground rounded-full transition-all duration-500"
              style={{ width: `${order.progress}%` }}
            />
          </div>
        </div>

        {/* Completed Banner */}
        {order.status === "completed" && !submitted && (
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
          {updates.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground">Belum ada update dari admin.</p>
            </div>
          ) : (
            <div className="border-l-2 border-muted pl-4 space-y-4">
              {updates.map((u) => (
                <div key={u.id} className="relative">
                  <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full bg-foreground" />
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{formatDate(u.created_at)}</p>
                    <Badge className={cn("rounded-full", statusBadge[order.status])} variant="secondary">
                      {statusLabels[order.status]}
                    </Badge>
                    <div className="ml-auto flex items-center gap-1 text-muted-foreground">
                      <EyeIcon className="h-3 w-3" />
                      <span className="text-[11px]">Update dari admin</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mt-1">{u.message}</p>
                </div>
              ))}
            </div>
          )}
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
