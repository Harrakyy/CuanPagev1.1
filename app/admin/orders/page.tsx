"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Eye, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getOrders, formatDate, formatRupiah, type Order } from "@/lib/supabase/queries"

const orderStatusLabels: Record<string, string> = {
  pending: "Menunggu",
  in_progress: "Dikerjakan",
  review: "Review",
  revision: "Revisi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  review: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  revision: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
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
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getOrders()
        setOrders(data)
      } catch (error) {
        console.error("Error loading orders:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadOrders()
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (order.customer?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (order.service?.name || "").toLowerCase().includes(search.toLowerCase())

    const matchesStatus = activeTab === "all" || order.status === activeTab

    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pesanan</h1>
          <p className="text-muted-foreground">Kelola semua pesanan pelanggan</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Pesanan Baru
        </Button>
      </div>

      <Card className="bg-card border rounded-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pesanan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap h-auto">
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
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.customer?.full_name || "-"}</TableCell>
                    <TableCell>{order.service?.name || "-"}</TableCell>
                    <TableCell>{formatRupiah(order.price)}</TableCell>
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
                ))}
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
