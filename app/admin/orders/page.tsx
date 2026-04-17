"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Eye, Plus, RefreshCw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getOrders, formatDate, formatRupiah, type Order } from "@/lib/supabase/queries"
import { useAuth } from "@/contexts/auth-context"

const orderStatusLabels: Record<string, string> = {
  pending: "Menunggu",
  in_progress: "Dikerjakan",
  review: "Review",
  revision: "Revisi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
}

const statusColors: Record<string, string> = {
  pending: "bg-black/5 text-black border border-black/10",
  in_progress: "bg-[#BEFF47] text-black border border-black/10",
  review: "bg-black/5 text-black border border-black/10",
  revision: "bg-black/5 text-black border border-black/10",
  completed: "bg-black/5 text-black border border-black/10",
  cancelled: "bg-black/5 text-black border border-black/10",
}

const statusTabs = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "in_progress", label: "Dikerjakan" },
  { value: "review", label: "Review" },
  { value: "revision", label: "Revisi" },
  { value: "completed", label: "Selesai" },
]

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-2 w-20" />
          <Skeleton className="h-8 w-16 ml-auto" />
        </div>
      ))}
    </div>
  )
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])

  const loadOrders = useCallback(async (silent = false) => {
    if (authLoading || !user || user.role !== "admin") {
      setOrders([])
      setIsLoading(false)
      setIsRefreshing(false)
      return
    }

    if (!silent) setIsLoading(true)
    else setIsRefreshing(true)
    try {
      const data = await getOrders()
      setOrders(data)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [authLoading, user])

  useEffect(() => {
    if (authLoading) return

    loadOrders()
    // Auto-refresh setiap 30 detik
    const interval = setInterval(() => loadOrders(true), 30000)
    return () => clearInterval(interval)
  }, [authLoading, loadOrders])

  const filteredOrders = orders.filter((order) => {
    const serviceName = order.service?.nama || (order.service as any)?.name || ""
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (order.customer?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      serviceName.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = activeTab === "all" || order.status === activeTab
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Pesanan</h1>
          <p className="text-muted-foreground">Kelola semua pesanan pelanggan</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadOrders(true)}
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button className="bg-[#BEFF47] hover:bg-[#BEFF47]/90 text-black w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Pesanan Baru
          </Button>
        </div>
      </div>

      <Card className="bg-card border rounded-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4 min-w-0">
            <div className="relative flex-1 w-full md:max-w-sm min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pesanan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0">
              <TabsList className="flex-wrap h-auto justify-start">
                {statusTabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const serviceName = order.service?.nama || (order.service as any)?.name || "-"
                  const price = order.price ?? (order.service?.harga ?? 0)
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.customer?.full_name || "-"}</TableCell>
                      <TableCell>{serviceName}</TableCell>
                      <TableCell>{formatRupiah(price)}</TableCell>
                      <TableCell>{order.deadline ? formatDate(order.deadline) : "-"}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]} variant="secondary">
                          {orderStatusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={order.progress} className="w-20 h-2" />
                          <span className="text-sm text-muted-foreground">{order.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada pesanan yang ditemukan.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}