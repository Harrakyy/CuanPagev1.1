"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Search, Plus, DollarSign, CreditCard, Wallet } from "lucide-react"
import { toast } from "sonner"
import { invoices, customers, formatRupiah, formatDate } from "@/lib/dummy-data"

// Generate payments from paid invoices
const payments = invoices
  .filter(inv => inv.paidAmount > 0)
  .map((inv, idx) => ({
    id: `PAY-00${idx + 1}`,
    customer: inv.customerName,
    invoice: inv.id,
    amount: inv.paidAmount,
    method: ["Transfer", "QRIS", "Tunai"][idx % 3],
    date: inv.createdAt,
  }))

// Outstanding balances from unpaid invoices
const outstandingBalances = invoices
  .filter(inv => inv.status !== "paid")
  .map(inv => ({
    customer: inv.customerName,
    balance: inv.total - inv.paidAmount,
  }))
  .slice(0, 3)

const methodIcons: Record<string, React.ReactNode> = {
  Transfer: <CreditCard className="h-4 w-4" />,
  QRIS: <Wallet className="h-4 w-4" />,
  Tunai: <DollarSign className="h-4 w-4" />,
}

const methodColors: Record<string, string> = {
  Transfer: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  QRIS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  Tunai: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export default function PaymentsPage() {
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleSavePayment = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setIsDialogOpen(false)
      toast.success("Pembayaran berhasil dicatat")
    }, 1000)
  }

  const filteredPayments = payments.filter((payment) => {
    return (
      payment.customer.toLowerCase().includes(search.toLowerCase()) ||
      payment.invoice.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pembayaran</h1>
          <p className="text-muted-foreground">Kelola pembayaran dan outstanding</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Catat Pembayaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat Pembayaran Baru</DialogTitle>
              <DialogDescription>
                Masukkan detail pembayaran yang diterima
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Pelanggan</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih pelanggan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ahmad">Ahmad Rizki</SelectItem>
                    <SelectItem value="budi">Budi Santoso</SelectItem>
                    <SelectItem value="gunawan">Gunawan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>No. Invoice</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cp-001">CP-2024-001</SelectItem>
                    <SelectItem value="cp-003">CP-2024-003</SelectItem>
                    <SelectItem value="cp-007">CP-2024-007</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Jumlah (Rp)</Label>
                <Input type="number" placeholder="0" className="mt-1" />
              </div>
              <div>
                <Label>Metode Pembayaran</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih metode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="qris">QRIS</SelectItem>
                    <SelectItem value="tunai">Tunai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tanggal</Label>
                <Input type="date" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Batal
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleSavePayment}
                disabled={isSaving}
              >
                {isSaving ? <><Spinner className="mr-2" />Menyimpan...</> : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Outstanding Balances */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Outstanding Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {outstandingBalances.map((item, index) => (
            <Card key={index} className="bg-card border rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.customer}</p>
                    <p className="text-xl font-bold text-red-600">{formatRupiah(item.balance)}</p>
                  </div>
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <DollarSign className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <Card className="bg-card border rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Riwayat Pembayaran</CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pembayaran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>No. Invoice</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.customer}</TableCell>
                    <TableCell>{payment.invoice}</TableCell>
                    <TableCell>{formatRupiah(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge className={methodColors[payment.method]} variant="secondary">
                        <span className="mr-1">{methodIcons[payment.method]}</span>
                        {payment.method}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredPayments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada pembayaran yang ditemukan.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
