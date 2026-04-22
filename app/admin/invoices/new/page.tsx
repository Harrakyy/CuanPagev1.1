"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Download,
  FileText,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { getCustomers, getActiveServices, getOrdersForInvoice, createInvoice, createNotification, type Profile, type Service, type Order } from "@/lib/supabase/queries"

interface LineItem {
  id: number
  description: string
  qty: number
  price: number
}

export default function NewInvoicePage() {
  const [customers, setCustomers] = useState<Profile[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [selectedOrder, setSelectedOrder] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [taxRate, setTaxRate] = useState(11)
  const [notes, setNotes] = useState("Pembayaran dapat dilakukan melalui transfer bank ke rekening:\nBSI - 7219537462 a.n. Muhammad Rahadian Dzaki")
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: "", qty: 1, price: 0 },
  ])
  const [isSending, setIsSending] = useState(false)
  
  // Auto-generate invoice number for preview (will be regenerated on actual save)
  const currentYear = new Date().getFullYear()
  const previewInvoiceNumber = `INV-${currentYear}-001`

  useEffect(() => {
    async function loadData() {
      try {
        const [customersData, servicesData, ordersData] = await Promise.all([
          getCustomers(),
          getActiveServices(),
          getOrdersForInvoice(),
        ])
        setCustomers(customersData)
        setServices(servicesData)
        setOrders(ordersData)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    loadData()
  }, [])

  const handleOrderSelect = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    setSelectedOrder(orderId)
    if (order) {
      setSelectedCustomer(order.customer_id || "")
      setLineItems([
        { 
          id: 1, 
          description: order.service?.nama || "", 
          qty: 1, 
          price: order.service?.harga || order.price || 0 
        },
      ])
    }
  }

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    setSelectedService(serviceId)
    if (service) {
      setLineItems([
        { id: 1, description: service.nama, qty: 1, price: service.harga },
      ])
    }
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now(), description: "", qty: 1, price: 0 },
    ])
  }

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id))
    }
  }

  const updateLineItem = (id: number, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const subtotal = lineItems.reduce((acc, item) => acc + item.qty * item.price, 0)
  const taxAmount = (subtotal * taxRate) / 100
  const grandTotal = subtotal + taxAmount

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer)

const handleSendToCustomer = async () => {
  if (!selectedCustomer) {
    toast.error("Pilih pelanggan terlebih dahulu")
    return
  }
  if (!dueDate) {
    toast.error("Pilih tanggal jatuh tempo")
    return
  }
  if (lineItems.every(item => !item.description || item.price === 0)) {
    toast.error("Isi setidaknya satu item layanan")
    return
  }
  
  setIsSending(true)
  try {
    const items = lineItems
      .filter(item => item.description && item.price > 0)
      .map(item => ({
        nama_layanan: item.description,
        qty: item.qty,
        harga_satuan: item.price,
        subtotal: item.qty * item.price,
      }))
    
    await createInvoice({
      order_id: selectedOrder || null,
      customer_id: selectedCustomer,
      subtotal,
      tax_percent: taxRate,
      total: grandTotal,
      due_date: dueDate,
      notes: notes || undefined,
      items,
    })
    
    toast.success("Invoice berhasil dikirim ke pelanggan")
    // Redirect to invoices list after success
    window.location.href = "/admin/invoices"
  } catch (error) {
    console.error("Error sending invoice:", error)
    toast.error("Gagal mengirim invoice")
  } finally {
    setIsSending(false)
  }
}

const handlePrint = () => {
  const printContents = document.getElementById("invoice-card")?.innerHTML
  if (!printContents) return

  const printWindow = window.open("", "_blank", "width=800,height=600")
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice INV-${currentYear}-XXX</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: sans-serif; padding: 40px; color: #111; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
          th { text-align: left; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #ddd; }
          td { padding: 8px 0; font-size: 13px; }
          .text-right { text-align: right; }
          .text-muted { color: #6b7280; }
          .font-bold { font-weight: 700; }
          .border-t { border-top: 1px solid #ddd; padding-top: 8px; }
          .flex-between { display: flex; justify-content: space-between; margin-bottom: 2rem; }
          .totals { text-align: right; margin-bottom: 2rem; }
          .totals div { display: flex; justify-content: flex-end; gap: 4rem; margin-bottom: 4px; }
          .notes { border-top: 1px solid #ddd; padding-top: 1rem; }
          pre { white-space: pre-wrap; font-family: sans-serif; font-size: 13px; }
          .justify-end { justify-content: flex-end; }
        .gap-8 { gap: 2rem; }
        .w-32 { width: 8rem; display: inline-block; text-align: right; }
        </style>
      </head>
      <body>
        ${printContents}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)
}

  return (
    <div className="p-4 md:p-6 overflow-hidden">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buat Invoice Baru</h1>
          <p className="text-muted-foreground">No. Invoice: INV-{currentYear}-XXX</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 overflow-hidden">
        {/* Form */}
        <div className="space-y-4 md:space-y-6">
          <Card className="bg-white dark:bg-gray-950 border rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Detail Invoice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Pelanggan</Label>
                <Select value={selectedCustomer} onValueChange={(v) => { setSelectedCustomer(v); setSelectedOrder(""); }}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Pilih pelanggan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        Belum ada pelanggan
                      </SelectItem>
                    ) : (
                      customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.full_name || customer.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Pesanan (Opsional)</Label>
                <Select value={selectedOrder} onValueChange={handleOrderSelect}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Pilih pesanan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        Belum ada pesanan
                      </SelectItem>
                    ) : (
                      orders
                        .filter(o => !selectedCustomer || o.customer_id === selectedCustomer)
                        .filter(o => o.status !== "cancelled")
                        .map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            {order.order_number} - {order.service?.nama || "Layanan"} ({order.customer?.full_name || order.customer?.email || "-"})
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Atau Layanan (Manual)</Label>
                <Select value={selectedService} onValueChange={handleServiceSelect}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Pilih layanan (alternatif)..." />
                  </SelectTrigger>
                  <SelectContent>
                    {services.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        Belum ada layanan
                      </SelectItem>
                    ) : (
                      services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.nama} - Rp {service.harga.toLocaleString("id-ID")}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Jatuh Tempo</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Pajak (%)</Label>
                  <Input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-950 border rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Item</CardTitle>
              <Button variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Deskripsi</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          placeholder="Nama layanan"
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(item.id, "description", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) =>
                            updateLineItem(item.id, "qty", Number(e.target.value))
                          }
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={item.price}
                          onChange={(e) =>
                            updateLineItem(item.id, "price", Number(e.target.value))
                          }
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(item.qty * item.price)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 space-y-2 text-right">
                <div className="flex justify-end gap-8">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium w-32">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-end gap-8">
                  <span className="text-muted-foreground">Pajak ({taxRate}%)</span>
                  <span className="font-medium w-32">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-end gap-8 text-lg">
                  <span className="font-bold">Grand Total</span>
                  <span className="font-bold w-32">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-950 border rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Catatan / Syarat Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 overflow-hidden">
            <Button variant="outline" className="w-full sm:flex-1 overflow-hidden">
              <Save className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">Simpan Draft</span>
            </Button>
            <Button 
              className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white overflow-hidden"
              onClick={handleSendToCustomer}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim ke Pelanggan
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={handlePrint}
            >
              <Download className="h-4 w-4 mr-2" />
              Print / PDF
            </Button>
          </div>
        </div>

        {/* Preview */}
        <Card className="bg-white dark:bg-gray-950 border rounded-xl sticky top-6 print-container">
          <CardHeader className="print-hidden">
            <CardTitle className="text-lg">Preview Invoice</CardTitle>
          </CardHeader>
          <CardContent className="print-invoice-content">
            <div id="invoice-card" className="border rounded-lg p-6 dark:bg-gray-950 print:border-0 print:p-0">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">CuanPage.</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Jasa Pembuatan Website Professional
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span className="font-bold text-lg">INVOICE</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">INV-{currentYear}-XXX</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Kepada:</p>
                  <p className="font-medium">
                    {selectedCustomerData?.full_name || selectedCustomerData?.email || "Pilih pelanggan"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Jatuh Tempo:</p>
                  <p className="font-medium">{dueDate || "-"}</p>
                </div>
              </div>

              {/* Items */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm">Deskripsi</th>
                    <th className="text-right py-2 text-sm">Qty</th>
                    <th className="text-right py-2 text-sm">Harga</th>
                    <th className="text-right py-2 text-sm">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2 text-sm">{item.description || "-"}</td>
                      <td className="py-2 text-sm text-right">{item.qty}</td>
                      <td className="py-2 text-sm text-right">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-2 text-sm text-right">
                        {formatCurrency(item.qty * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="space-y-2 text-right mb-8">
                <div className="flex justify-end gap-8">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm w-28">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-end gap-8">
                  <span className="text-sm text-muted-foreground">
                    Pajak ({taxRate}%)
                  </span>
                  <span className="text-sm w-28">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-end gap-8 pt-2 border-t">
                  <span className="font-bold">Grand Total</span>
                  <span className="font-bold w-28">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Catatan:</p>
                <p className="text-sm whitespace-pre-line">{notes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}