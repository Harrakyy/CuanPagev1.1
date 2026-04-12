"use client"

import * as React from "react"
import { useState } from "react"
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
} from "lucide-react"

// Mock customers
const customers = [
  { id: "CUS-001", name: "Ahmad Rizki" },
  { id: "CUS-002", name: "Siti Nurhaliza" },
  { id: "CUS-003", name: "Budi Santoso" },
  { id: "CUS-004", name: "Dewi Lestari" },
]

interface LineItem {
  id: number
  description: string
  qty: number
  price: number
}

export default function NewInvoicePage() {
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [taxRate, setTaxRate] = useState(11)
  const [notes, setNotes] = useState("Pembayaran dapat dilakukan melalui transfer bank ke rekening:\nBCA - 1234567890 a.n. CuanPage")
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: "", qty: 1, price: 0 },
  ])

  const invoiceNumber = "CP-2024-009" // Would be auto-generated

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

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buat Invoice Baru</h1>
          <p className="text-muted-foreground">No. Invoice: {invoiceNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-900 border rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Detail Invoice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Pelanggan</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Pilih pelanggan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
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

          <Card className="bg-white dark:bg-gray-900 border rounded-xl">
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

          <Card className="bg-white dark:bg-gray-900 border rounded-xl">
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

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Simpan Draft
            </Button>
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Send className="h-4 w-4 mr-2" />
              Kirim ke Pelanggan
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Preview */}
        <Card className="bg-white dark:bg-gray-900 border rounded-xl sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg">Preview Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white dark:bg-gray-950">
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
                  <p className="text-sm text-muted-foreground mt-1">{invoiceNumber}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Kepada:</p>
                  <p className="font-medium">
                    {selectedCustomerData?.name || "Pilih pelanggan"}
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
