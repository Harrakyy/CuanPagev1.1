"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  ShoppingBag,
  FileText,
  DollarSign,
  Plus,
  Eye,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { 
  getOrders,
  getAdminDashboardStats,
  getMonthlyRevenue,
  getCustomers,
  formatRupiah, 
  formatDate,
  type Order,
} from "@/lib/supabase/queries"

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

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-8 ml-auto" />
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
      totalOrders: 0,
      activeOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      unpaidInvoices: 0,
      unreadMessages: 0,
      overdueInvoices: 0,
    })
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [chartData, setChartData] = useState<{ month: string; revenue: number }[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersData, statsData, revenueData, customersData] = await Promise.all([
          getOrders(),
          getAdminDashboardStats(),
          getMonthlyRevenue(),
          getCustomers(),
        ])
        
        setOrders(ordersData)
        setStats(statsData)
        setTotalCustomers(customersData.length)
        setChartData(revenueData.slice(-6))
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  const recentOrders = orders.slice(0, 10)

  const statsData = [
    { label: "Total Pelanggan", value: totalCustomers.toString(), icon: Users, change: "" },
    { label: "Pesanan Aktif", value: stats.activeOrders.toString(), icon: ShoppingBag, change: "" },
    { label: "Invoice Belum Bayar", value: stats.overdueInvoices.toString(), icon: FileText, change: "" },
    { label: "Revenue", value: formatRupiah(stats.totalRevenue), icon: DollarSign, change: "" },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang kembali, Admin!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-card border rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-24 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    )}
                  </div>
                  <div className="p-2 bg-black/5 rounded-lg">
                    <Icon className="h-5 w-5 text-black" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button className="bg-[#BEFF47] hover:bg-[#BEFF47]/90 text-black" asChild>
          <Link href="/admin/orders">
            <Plus className="h-4 w-4 mr-2" />
            Pesanan Baru
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            Buat Invoice
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/customers">
            <Plus className="h-4 w-4 mr-2" />
            Lihat Pelanggan
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2 bg-card border rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pesanan Terbaru</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">Lihat Semua</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton />
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada pesanan
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.customer?.full_name || "-"}</TableCell>
                      <TableCell>{order.service?.nama || "-"}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]} variant="secondary">
                          {orderStatusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-card border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Revenue 6 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
                    className="text-xs"
                  />
                  <Tooltip
                    formatter={(value) => [formatRupiah(value as number), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#000000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
