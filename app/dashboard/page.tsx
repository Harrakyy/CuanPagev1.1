"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Download,
  Eye,
  MapPin,
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

const orderStatusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "Dikerjakan",
  review: "Review",
  revision: "Revisi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
}

const statusColors: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  review: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  revision: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

const invoiceStatusLabels: Record<string, string> = {
  paid: "Lunas",
  unpaid: "Belum Bayar",
  partial: "Sebagian",
  overdue: "Jatuh Tempo",
}

const invoiceStatusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  unpaid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  partial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  overdue: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
}

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
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
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
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (user) {
      loadData()
    }
  }, [user])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <main className="container mx-auto px-4 py-8">
        {/* Greeting */}
        <h1 className="text-2xl font-bold text-foreground mb-8">
          Halo, {user.name}!
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pesanan Aktif</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-12 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.activeOrders}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pesanan Selesai</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-12 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.completedOrders}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Belum Bayar</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-12 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.unpaidInvoices}</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Pesanan Saya */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Pesanan Saya</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Belum ada pesanan. Mulai project pertamamu sekarang!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Pesanan</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                    <TableHead className="hidden md:table-cell">Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Progress</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.service?.name || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(order.created_at)}</TableCell>
                      <TableCell className="hidden md:table-cell">{order.deadline ? formatDate(order.deadline) : "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[order.status]
                          }`}
                        >
                          {orderStatusLabels[order.status]}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-foreground rounded-full transition-all"
                              style={{ width: `${order.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {order.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Detail</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            asChild
                          >
                            <Link href={`/track/${order.order_number}`}>
                              <MapPin className="h-4 w-4" />
                              <span className="hidden sm:inline ml-1">Lacak</span>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>

        {/* Invoice Saya */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Invoice Saya</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Belum ada invoice.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Invoice</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Jatuh Tempo</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{formatRupiah(invoice.total)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoiceStatusColors[invoice.status]
                          }`}
                        >
                          {invoiceStatusLabels[invoice.status]}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(invoice.due_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Download</span>
                          </Button>
                          {invoice.status !== "paid" && (
                            <Button size="sm" className="h-8 bg-foreground text-background hover:bg-foreground/90">
                              Bayar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>

        {/* CTA Card */}
        <section>
          <div className="bg-foreground text-background rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Butuh website baru?</h3>
              <p className="text-background/70 mt-1">
                Wujudkan website impianmu bersama CuanPage
              </p>
            </div>
            <Button
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90 rounded-xl gap-2"
              asChild
            >
              <Link href="/#layanan">
                Mulai Project
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
