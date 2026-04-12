"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Calculator,
  Download,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { 
  revenueData, 
  orders, 
  customers, 
  services, 
  getStats,
  formatRupiah 
} from "@/lib/dummy-data"

// Compute orders by status
const ordersByStatus = [
  { name: "Selesai", value: orders.filter(o => o.status === "completed").length, color: "#22c55e" },
  { name: "Dikerjakan", value: orders.filter(o => o.status === "in_progress").length, color: "#6366f1" },
  { name: "Review", value: orders.filter(o => o.status === "review").length, color: "#a855f7" },
  { name: "Pending", value: orders.filter(o => o.status === "pending").length, color: "#eab308" },
  { name: "Revisi", value: orders.filter(o => o.status === "revision").length, color: "#f97316" },
]

// Revenue by service (computed from orders)
const revenueByService = services.map(svc => ({
  service: svc.name,
  revenue: orders.filter(o => o.service === svc.name).reduce((sum, o) => sum + o.price, 0)
})).filter(s => s.revenue > 0).sort((a, b) => b.revenue - a.revenue)

// Top customers
const topCustomers = [...customers]
  .sort((a, b) => b.totalSpent - a.totalSpent)
  .slice(0, 5)
  .map((c, idx) => ({
    rank: idx + 1,
    name: c.name,
    orders: c.totalOrders,
    spent: c.totalSpent,
  }))

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("bulan-ini")
  const [isLoading, setIsLoading] = useState(true)
  const computedStats = getStats()
  const totalRevenue = orders.reduce((sum, o) => sum + o.price, 0)
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const stats = [
    { label: "Total Revenue", value: formatRupiah(totalRevenue), icon: DollarSign, color: "indigo" },
    { label: "Revenue Bulan Ini", value: formatRupiah(revenueData[revenueData.length - 1]?.revenue || 0), change: "+18%", icon: TrendingUp, color: "green" },
    { label: "Total Pesanan", value: orders.length.toString(), icon: ShoppingBag, color: "purple" },
    { label: "Avg Order Value", value: formatRupiah(avgOrderValue), icon: Calculator, color: "blue" },
  ]

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-card border rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    {stat.change && (
                      <p className="text-xs text-green-600 mt-1">{stat.change} vs bulan lalu</p>
                    )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Line Chart */}
        <Card className="bg-card border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Revenue 12 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
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
          </CardContent>
        </Card>

        {/* Orders by Status Donut */}
        <Card className="bg-card border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Pesanan by Status</CardTitle>
          </CardHeader>
          <CardContent>
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
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Service Bar Chart */}
        <Card className="bg-card border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Revenue by Layanan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByService} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
                  className="text-xs"
                />
                <YAxis type="category" dataKey="service" className="text-xs" width={100} />
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
          </CardContent>
        </Card>

        {/* Top Customers Table */}
        <Card className="bg-card border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Top 5 Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <TableRow key={customer.rank}>
                    <TableCell>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        customer.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                        customer.rank === 2 ? "bg-gray-100 text-gray-800" :
                        customer.rank === 3 ? "bg-orange-100 text-orange-800" :
                        "bg-gray-50 text-gray-600"
                      }`}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
