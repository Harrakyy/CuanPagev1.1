"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { DollarSign, TrendingUp, ShoppingBag, Calculator, Download } from "lucide-react"
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import {
  getOrders,
  getCustomers,
  getPayments,
  getMonthlyRevenue,
  formatRupiah,
  type Order,
  type Profile,
  type Payment,
} from "@/lib/supabase/queries"

const STATUS_COLORS: Record<string, string> = {
  completed: "#22c55e",
  in_progress: "#6366f1",
  review: "#a855f7",
  pending: "#eab308",
  revision: "#f97316",
  cancelled: "#ef4444",
}

const STATUS_LABELS: Record<string, string> = {
  completed: "Selesai",
  in_progress: "Dikerjakan",
  review: "Review",
  pending: "Pending",
  revision: "Revisi",
  cancelled: "Dibatalkan",
}

function StatSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-card border rounded-xl">
          <CardContent className="p-5">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("tahun-ini")
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Profile[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersData, customersData, paymentsData, revenueMonthly] =
          await Promise.all([
            getOrders(),
            getCustomers(),
            getPayments(),
            getMonthlyRevenue(new Date().getFullYear()),
          ])
        setOrders(ordersData)
        setCustomers(customersData)
        setPayments(paymentsData)
        setRevenueData(revenueMonthly)
      } catch (error) {
        console.error("Error loading reports:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Computed stats
  const totalRevenue = payments.reduce((sum, p) => sum + (p.jumlah || 0), 0)
  const currentMonth = new Date().getMonth()
  const revenueThisMonth = revenueData[currentMonth]?.revenue || 0
  const avgOrderValue =
    orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0

  const stats = [
    {
      label: "Total Revenue",
      value: formatRupiah(totalRevenue),
      icon: DollarSign,
    },
    {
      label: "Revenue Bulan Ini",
      value: formatRupiah(revenueThisMonth),
      icon: TrendingUp,
    },
    {
      label: "Total Pesanan",
      value: orders.length.toString(),
      icon: ShoppingBag,
    },
    {
      label: "Avg Order Value",
      value: formatRupiah(avgOrderValue),
      icon: Calculator,
    },
  ]

  // Orders by status for pie chart
  const ordersByStatus = Object.entries(
    orders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})
  )
    .map(([status, value]) => ({
      name: STATUS_LABELS[status] || status,
      value,
      color: STATUS_COLORS[status] || "#94a3b8",
    }))
    .filter((s) => s.value > 0)

  // Revenue by service for bar chart
  const revenueByService = Object.entries(
    orders.reduce<Record<string, number>>((acc, order) => {
      const serviceName = order.service?.nama || "Lainnya"
      acc[serviceName] = (acc[serviceName] || 0) + (order.service?.harga || 0)
      return acc
    }, {})
  )
    .map(([service, revenue]) => ({ service, revenue }))
    .filter((s) => s.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)

  // Top customers
  const topCustomers = customers
    .map((c) => {
      const customerOrders = orders.filter((o) => o.customer_id === c.id)
      const customerPayments = payments.filter((p) => p.customer_id === c.id)
      return {
        id: c.id,
        name: c.full_name || c.email || "-",
        orders: customerOrders.length,
        spent: customerPayments.reduce((sum, p) => sum + (p.jumlah || 0), 0),
      }
    })
    .filter((c) => c.orders > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5)
    .map((c, idx) => ({ ...c, rank: idx + 1 }))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laporan</h1>
          <p className="text-muted-foreground">Analisis performa bisnis Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minggu-ini">Minggu Ini</SelectItem>
              <SelectItem value="bulan-ini">Bulan Ini</SelectItem>
              <SelectItem value="3-bulan">3 Bulan</SelectItem>
              <SelectItem value="tahun-ini">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <StatSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="bg-card border rounded-xl">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Line Chart */}
        <Card className="bg-card border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Revenue 12 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                    className="text-xs"
                  />
                  <Tooltip
                    formatter={(value: number) => [formatRupiah(value), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={{ fill: "#6366F1", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status Donut */}
        <Card className="bg-card border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Pesanan by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : ordersByStatus.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Belum ada data pesanan
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Service */}
        <Card className="bg-card border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Revenue by Layanan</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : revenueByService.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Belum ada data layanan
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByService} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                    className="text-xs"
                  />
                  <YAxis
                    type="category"
                    dataKey="service"
                    className="text-xs"
                    width={100}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatRupiah(value), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#6366F1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="bg-card border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Top 5 Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : topCustomers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Belum ada data pelanggan
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Pesanan</TableHead>
                    <TableHead>Total Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            customer.rank === 1
                              ? "bg-yellow-100 text-yellow-800"
                              : customer.rank === 2
                              ? "bg-gray-100 text-gray-800"
                              : customer.rank === 3
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {customer.rank}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.orders}</TableCell>
                      <TableCell>{formatRupiah(customer.spent)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}