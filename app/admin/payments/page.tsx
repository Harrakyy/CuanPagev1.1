"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Search, Plus, DollarSign, CreditCard, Wallet } from "lucide-react"
import { toast } from "sonner"
import {
  getPayments,
  getInvoices,
  getCustomers,
  createPayment,
  formatRupiah,
  formatDate,
  type Payment,
  type Invoice,
  type Profile,
} from "@/lib/supabase/queries"

const methodIcons: Record<string, React.ReactNode> = {
  Transfer: <CreditCard className="h-4 w-4" />,
  QRIS: <Wallet className="h-4 w-4" />,
  Tunai: <DollarSign className="h-4 w-4" />,
}

const methodColors: Record<string, string> = {
  Transfer: "bg-black/5 text-black border border-black/10",
  QRIS: "bg-black/5 text-black border border-black/10",
  Tunai: "bg-black/5 text-black border border-black/10",
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
  const [payments, setPayments] = useState<Payment[]>([])
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<Profile[]>([])

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("")
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const [paymentsData, invoicesData, customersData] = await Promise.all([
          getPayments(),
          getInvoices(),
          getCustomers(),
        ])
        setPayments(paymentsData)
        setUnpaidInvoices(
          invoicesData.filter((inv) => inv.status !== "paid")
        )
        setCustomers(customersData)
      } catch (error) {
        console.error("Error loading payments:", error)
        toast.error("Gagal memuat data pembayaran")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter invoices by selected customer
  const customerInvoices = unpaidInvoices.filter(
    (inv) => !selectedCustomerId || inv.customer_id === selectedCustomerId
  )

  // Outstanding balances
  const outstandingBalances = unpaidInvoices
    .reduce<{ customerId: string; customerName: string; balance: number }[]>(
      (acc, inv) => {
        const existing = acc.find((a) => a.customerId === inv.customer_id)
        const balance = inv.total - (inv.status === "partial" ? 0 : 0)
        if (existing) {
          existing.balance += inv.total
        } else {
          acc.push({
            customerId: inv.customer_id,
            customerName: inv.customer?.full_name || inv.customer?.email || "-",
            balance: inv.total,
          })
        }
        return acc
      },
      []
    )
    .slice(0, 3)

  const handleSavePayment = async () => {
    if (!selectedCustomerId || !selectedInvoiceId || !amount || !method) {
      toast.error("Semua field wajib diisi")
      return
    }
    setIsSaving(true)
    try {
      const newPayment = await createPayment({
        invoice_id: selectedInvoiceId,
        customer_id: selectedCustomerId,
        jumlah: Number(amount),
        metode: method,
      })
      setPayments((prev) => [newPayment, ...prev])
      setUnpaidInvoices((prev) =>
        prev.filter((inv) => inv.id !== selectedInvoiceId)
      )
      setIsDialogOpen(false)
      setSelectedCustomerId("")
      setSelectedInvoiceId("")
      setAmount("")
      setMethod("")
      toast.success("Pembayaran berhasil dicatat")
    } catch (error) {
      toast.error("Gagal mencatat pembayaran")
    } finally {
      setIsSaving(false)
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const customerName =
      payment.invoice?.customer?.full_name ||
      payment.invoice?.customer?.email ||
      ""
    const invoiceNumber = payment.invoice?.invoice_number || ""
    return (
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      invoiceNumber.toLowerCase().includes(search.toLowerCase())
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
            <Button className="bg-[#BEFF47] hover:bg-[#BEFF47]/90 text-black">
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
                <Select
                  value={selectedCustomerId}
                  onValueChange={(v) => {
                    setSelectedCustomerId(v)
                    setSelectedInvoiceId("")
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih pelanggan" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.full_name || c.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>No. Invoice</Label>
                <Select
                  value={selectedInvoiceId}
                  onValueChange={setSelectedInvoiceId}
                  disabled={!selectedCustomerId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerInvoices.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Tidak ada invoice unpaid
                      </SelectItem>
                    ) : (
                      customerInvoices.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.invoice_number} — {formatRupiah(inv.total)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Jumlah (Rp)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="mt-1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <Label>Metode Pembayaran</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih metode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transfer">Transfer Bank</SelectItem>
                    <SelectItem value="QRIS">QRIS</SelectItem>
                    <SelectItem value="Tunai">Tunai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button
                className="bg-[#BEFF47] hover:bg-[#BEFF47]/90 text-black"
                onClick={handleSavePayment}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Spinner className="mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Outstanding Balances */}
      {outstandingBalances.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Outstanding Balance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {outstandingBalances.map((item, index) => (
              <Card key={index} className="bg-card border rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {item.customerName}
                      </p>
                      <p className="text-xl font-bold text-black">
                        {formatRupiah(item.balance)}
                      </p>
                    </div>
                    <div className="p-2 bg-black/5 rounded-lg">
                      <DollarSign className="h-5 w-5 text-black" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

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
                {filteredPayments.map((payment) => {
                  const metode = payment.metode || "Transfer"
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.invoice?.customer?.full_name ||
                          payment.invoice?.customer?.email ||
                          "-"}
                      </TableCell>
                      <TableCell>
                        {payment.invoice?.invoice_number || "-"}
                      </TableCell>
                      <TableCell>{formatRupiah(payment.jumlah)}</TableCell>
                      <TableCell>
                        <Badge
                          className={methodColors[metode] ?? methodColors["Transfer"]}
                          variant="secondary"
                        >
                          <span className="mr-1">
                            {methodIcons[metode] ?? methodIcons["Transfer"]}
                          </span>
                          {metode}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(payment.created_at)}</TableCell>
                    </TableRow>
                  )
                })}
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