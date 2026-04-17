"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  Download,
  Eye,
  MapPin,
  Sparkles,
  ShoppingBag,
  FileText,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getOrdersByCustomer,
  getInvoicesByCustomer,
  getCustomerDashboardStats,
  formatRupiah,
  formatDate,
  type Order,
  type Invoice,
} from "@/lib/supabase/queries"

// ─── Label Maps ──────────────────────────────────────────────────────────────
const orderStatusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "Dikerjakan",
  review: "Review",
  revision: "Revisi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
}

// Minimalist palette: zinc grays + lime accent only for "in_progress"
const statusColors: Record<string, string> = {
  pending:
    "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  in_progress:
    "bg-[#BEFF47]/10 text-[#5f8800] dark:bg-[#BEFF47]/10 dark:text-[#BEFF47]",
  review:
    "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
  revision:
    "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400",
  completed:
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300",
  cancelled:
    "bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600",
}

const invoiceStatusLabels: Record<string, string> = {
  paid: "Lunas",
  unpaid: "Belum Bayar",
  partial: "Sebagian",
  overdue: "Jatuh Tempo",
}

const invoiceStatusColors: Record<string, string> = {
  paid: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400",
  unpaid: "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400",
  partial: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  overdue: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Selamat pagi"
  if (h < 17) return "Selamat siang"
  return "Selamat malam"
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${value}%`,
            background: value === 100 ? "#71717a" : "#BEFF47",
          }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground tabular-nums w-8">
        {value}%
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    unpaidInvoices: 0,
  })

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login")
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        const [ordersData, invoicesData, statsData] = await Promise.all([
          getOrdersByCustomer(user.id),
          getInvoicesByCustomer(user.id),
          getCustomerDashboardStats(user.id),
        ])
        setOrders(ordersData)
        setInvoices(invoicesData)
        setStats(statsData)
      } catch (err) {
        console.error("Error loading dashboard data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    if (user) loadData()
  }, [user])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Memuat…</span>
      </div>
    )
  }
  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl space-y-8">

        {/* ① GREETING — first point of eye contact */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
            {getGreeting()}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {user.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Pantau progres project dan tagihan kamu di sini.
          </p>
        </div>

        {/* ② STATS — 3 numbers, L→R scan (most important first) */}
        <div className="grid grid-cols-3 gap-3">
          {/* Active — lime accent: most important action item */}
          <div className="relative bg-card border border-border rounded-2xl p-4 sm:p-5 overflow-hidden">
            <span className="absolute inset-y-0 left-0 w-[3px] rounded-l-2xl bg-[#BEFF47]" />
            <p className="text-[11px] font-medium text-muted-foreground mb-2 leading-none">
              Aktif
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {stats.activeOrders}
              </p>
            )}
          </div>

          {/* Completed — neutral zinc */}
          <div className="relative bg-card border border-border rounded-2xl p-4 sm:p-5 overflow-hidden">
            <span className="absolute inset-y-0 left-0 w-[3px] rounded-l-2xl bg-zinc-300 dark:bg-zinc-600" />
            <p className="text-[11px] font-medium text-muted-foreground mb-2 leading-none">
              Selesai
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {stats.completedOrders}
              </p>
            )}
          </div>

          {/* Unpaid — red only when > 0 */}
          <div className="relative bg-card border border-border rounded-2xl p-4 sm:p-5 overflow-hidden">
            <span
              className={`absolute inset-y-0 left-0 w-[3px] rounded-l-2xl transition-colors ${
                stats.unpaidInvoices > 0
                  ? "bg-red-400 dark:bg-red-500"
                  : "bg-zinc-200 dark:bg-zinc-700"
              }`}
            />
            <p className="text-[11px] font-medium text-muted-foreground mb-2 leading-none">
              Belum Bayar
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <p
                className={`text-2xl sm:text-3xl font-bold transition-colors ${
                  stats.unpaidInvoices > 0
                    ? "text-red-500 dark:text-red-400"
                    : "text-foreground"
                }`}
              >
                {stats.unpaidInvoices}
              </p>
            )}
          </div>
        </div>

        {/* ③ QUICK ACTION — above table for higher engagement */}
        <div className="rounded-2xl border border-[#BEFF47]/20 bg-[#BEFF47]/[0.04] dark:bg-[#BEFF47]/[0.04] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-[#BEFF47]/15 dark:bg-[#BEFF47]/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-[#5f8800] dark:text-[#BEFF47]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">
                Mulai project baru
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Website, Landing Page, Custom Web App, dan lainnya
              </p>
            </div>
          </div>
          <Button
            className="w-full sm:w-auto shrink-0 bg-foreground text-background hover:bg-foreground/90 rounded-xl gap-2 text-sm"
            asChild
          >
            <Link href="/dashboard/layanan">
              Lihat Layanan
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* ④ ORDERS */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Pesanan Saya
            </h2>
            <Link
              href="/dashboard/pesanan"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Lihat semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-5 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-3.5 w-36 rounded" />
                    <Skeleton className="h-5 w-14 rounded-full ml-auto" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center px-6">
                <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Belum ada pesanan
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mulai project pertamamu dan wujudkan idemu!
                  </p>
                </div>
                <Link
                  href="/dashboard/layanan"
                  className="text-xs font-medium text-[#5f8800] dark:text-[#BEFF47] hover:underline"
                >
                  Jelajahi layanan →
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <TableHead className="pl-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          No. Pesanan
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Layanan
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Dibuat
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Deadline
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Status
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Progress
                        </TableHead>
                        <TableHead className="pr-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="pl-5 font-mono text-[11px] text-muted-foreground">
                            {order.order_number}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-foreground">
                            {order.service?.nama || "–"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(order.created_at)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {order.deadline ? formatDate(order.deadline) : "–"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[order.status]}`}
                            >
                              {orderStatusLabels[order.status]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <ProgressBar value={order.progress} />
                          </TableCell>
                          <TableCell className="pr-5">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Detail
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                asChild
                              >
                                <Link href={`/track/${order.order_number}`}>
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  Lacak
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-border/50">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {order.order_number}
                          </span>
                          <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
                            {order.service?.nama || "–"}
                          </p>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[order.status]}`}
                        >
                          {orderStatusLabels[order.status]}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <div>
                          <p className="text-muted-foreground">Dibuat</p>
                          <p className="font-medium text-foreground mt-0.5">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Deadline</p>
                          <p className="font-medium text-foreground mt-0.5">
                            {order.deadline ? formatDate(order.deadline) : "–"}
                          </p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-foreground tabular-nums">
                            {order.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${order.progress}%`,
                              background:
                                order.progress === 100 ? "#71717a" : "#BEFF47",
                            }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-0.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Detail
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          asChild
                        >
                          <Link href={`/track/${order.order_number}`}>
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            Lacak
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ⑤ INVOICES */}
        <section className="pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Invoice Saya
            </h2>
            <Link
              href="/dashboard/invoice"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Lihat semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-5 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-3.5 w-28 rounded" />
                    <Skeleton className="h-5 w-14 rounded-full ml-auto" />
                  </div>
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center px-6">
                <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Belum ada invoice
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Invoice muncul otomatis setelah pesanan dikonfirmasi.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <TableHead className="pl-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          No. Invoice
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Jumlah
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Status
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Jatuh Tempo
                        </TableHead>
                        <TableHead className="pr-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow
                          key={invoice.id}
                          className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="pl-5 font-mono text-[11px] text-muted-foreground">
                            {invoice.invoice_number}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-foreground">
                            {formatRupiah(invoice.total)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${invoiceStatusColors[invoice.status]}`}
                            >
                              {invoiceStatusLabels[invoice.status]}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(invoice.due_date)}
                          </TableCell>
                          <TableCell className="pr-5">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                              >
                                <Download className="h-3.5 w-3.5 mr-1" />
                                Unduh
                              </Button>
                              {invoice.status !== "paid" && (
                                <Button
                                  size="sm"
                                  className="h-7 px-3 text-xs bg-foreground text-background hover:bg-foreground/90 rounded-lg"
                                >
                                  Bayar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-border/50">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {invoice.invoice_number}
                          </span>
                          <p className="text-base font-bold text-foreground mt-0.5">
                            {formatRupiah(invoice.total)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${invoiceStatusColors[invoice.status]}`}
                        >
                          {invoiceStatusLabels[invoice.status]}
                        </span>
                      </div>

                      {/* Due date */}
                      <p className="text-xs text-muted-foreground">
                        Jatuh Tempo:{" "}
                        <span className="font-medium text-foreground">
                          {formatDate(invoice.due_date)}
                        </span>
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 pt-0.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Unduh
                        </Button>
                        {invoice.status !== "paid" && (
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs bg-foreground text-background hover:bg-foreground/90"
                          >
                            Bayar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
