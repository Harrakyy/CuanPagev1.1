"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Receipt } from "lucide-react"
import { formatRupiah, formatDate, getPaymentsByCustomer, type Payment } from "@/lib/supabase/queries"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const statusColors: Record<string, string> = {
  unpaid: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  partial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  overdue: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
}

const statusLabels: Record<string, string> = {
  unpaid: "Belum Bayar",
  paid: "Lunas",
  partial: "Sebagian",
  overdue: "Jatuh Tempo",
}

export default function PaymentHistoryPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const data = await getPaymentsByCustomer(user.id)
        setPayments(data)
      } catch (error) {
        console.error("Gagal memuat pembayaran:", error)
        toast.error("Gagal memuat data histori pembayaran")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user])

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Histori Pembayaran</h1>
          <p className="text-muted-foreground mt-2">Daftar semua pembayaran untuk layanan CuanPage.</p>
        </div>

        <Card className="bg-white dark:bg-gray-900 border rounded-xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-500" />
              <CardTitle>Riwayat Pembayaran Anda</CardTitle>
            </div>
            <CardDescription>
              Status dan rincian transaksi terkait invoice yang ditagihkan.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Belum ada riwayat pembayaran.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Tanggal Bayar</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Jumlah (Rp)</TableHead>
                    <TableHead className="text-center">Status Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((py) => {
                    const status = py.invoice?.status || "unpaid"
                    return (
                      <TableRow key={py.id}>
                        <TableCell className="font-medium">
                          {py.invoice?.invoice_number || "-"}
                        </TableCell>
                        <TableCell>{formatDate(py.created_at)}</TableCell>
                        <TableCell>{py.metode || "Transfer Bank"}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatRupiah(py.jumlah)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={statusColors[status]} variant="secondary">
                            {statusLabels[status] || status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}