"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Sparkles, ChevronRight, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getOrdersByCustomer, formatRupiah, formatDate, type Order } from "@/lib/supabase/queries"
import { useAuth } from "@/contexts/auth-context"

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:     { label: "Menunggu",  color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  in_progress: { label: "Dikerjakan", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  review:      { label: "Review",    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: AlertCircle },
  revision:    { label: "Revisi",    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: AlertCircle },
  completed:   { label: "Selesai",   color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  cancelled:   { label: "Dibatalkan", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: AlertCircle },
}

function OrderCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 flex-1 rounded-xl" />
      </div>
    </div>
  )
}

export default function PesananPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("semua")

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const data = await getOrdersByCustomer(user.id)
        setOrders(data)
      } catch {
        // silent
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user])

  const filters = [
    { key: "semua", label: "Semua" },
    { key: "active", label: "Aktif" },
    { key: "completed", label: "Selesai" },
    { key: "cancelled", label: "Dibatalkan" },
  ]

  const filteredOrders = orders.filter((o) => {
    if (filter === "semua") return true
    if (filter === "active") return ["pending", "in_progress", "review", "revision"].includes(o.status)
    return o.status === filter
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pesanan Saya</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {orders.length} total pesanan
            </p>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2"
            asChild
          >
            <Link href="/dashboard/layanan">
              <Sparkles className="h-4 w-4" />
              Pesan Baru
            </Link>
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                filter === f.key
                  ? "bg-indigo-600 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {filter === "semua" ? "Belum ada pesanan" : "Tidak ada pesanan di kategori ini"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Mulai project pertamamu sekarang!
            </p>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl" asChild>
              <Link href="/dashboard/layanan">Lihat Layanan</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending
              const StatusIcon = config.icon
              return (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-foreground">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {order.service?.nama || "-"}
                      </p>
                    </div>
                    <Badge className={cn("gap-1 rounded-full", config.color)} variant="secondary">
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-muted-foreground mb-0.5">Dibuat</p>
                      <p className="font-medium text-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-muted-foreground mb-0.5">Deadline</p>
                      <p className="font-medium text-foreground">
                        {order.deadline ? formatDate(order.deadline) : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Progress pengerjaan</span>
                      <span className="font-semibold text-foreground">{order.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          order.progress === 100
                            ? "bg-green-500"
                            : order.progress >= 50
                            ? "bg-indigo-500"
                            : "bg-indigo-400"
                        )}
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl h-9 text-xs gap-1.5"
                      asChild
                    >
                      <Link href={`/track/${order.order_number}`}>
                        <MapPin className="h-3.5 w-3.5" />
                        Lacak Progress
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 rounded-xl p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}