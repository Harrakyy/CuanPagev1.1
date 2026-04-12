"use client"

import * as React from "react"
import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  CheckCircle,
  FileText,
} from "lucide-react"

// Mock data
const invoiceData = {
  id: "CP-2024-001",
  customer: "Ahmad Rizki",
  email: "ahmad.rizki@example.com",
  status: "Belum Bayar",
  dueDate: "2024-01-25",
  createdAt: "2024-01-15",
  items: [
    { description: "Landing Page - Professional Package", qty: 1, price: 2500000 },
  ],
  subtotal: 2500000,
  taxRate: 11,
  taxAmount: 275000,
  grandTotal: 2775000,
  notes: "Pembayaran dapat dilakukan melalui transfer bank ke rekening:\nBCA - 1234567890 a.n. CuanPage",
}

const statusColors: Record<string, string> = {
  "Belum Bayar": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Lunas: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const [copied, setCopied] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleCopyLink = () => {
    const invoiceUrl = `${window.location.origin}/invoice/${params.id}`
    navigator.clipboard.writeText(invoiceUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detail Invoice</h1>
            <p className="text-muted-foreground">{params.id}</p>
          </div>
        </div>
        <Badge className={statusColors[invoiceData.status]} variant="secondary">
          {invoiceData.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Preview */}
        <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border rounded-xl">
          <CardContent className="p-8">
            <div className="border rounded-lg p-8 bg-white dark:bg-gray-950">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">CuanPage.</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Jasa Pembuatan Website Professional
                  </p>
                  <p className="text-sm text-muted-foreground">
                    hello@cuanpage.com | +62 812-3456-7890
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span className="font-bold text-lg">INVOICE</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{invoiceData.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Tanggal: {invoiceData.createdAt}
                  </p>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Kepada:</p>
                  <p className="font-medium">{invoiceData.customer}</p>
                  <p className="text-sm text-muted-foreground">{invoiceData.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Jatuh Tempo:</p>
                  <p className="font-medium">{invoiceData.dueDate}</p>
                </div>
              </div>

              {/* Items */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-sm font-medium">Deskripsi</th>
                    <th className="text-right py-3 text-sm font-medium">Qty</th>
                    <th className="text-right py-3 text-sm font-medium">Harga</th>
                    <th className="text-right py-3 text-sm font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-right">{item.qty}</td>
                      <td className="py-3 text-right">{formatCurrency(item.price)}</td>
                      <td className="py-3 text-right">
                        {formatCurrency(item.qty * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="space-y-2 text-right mb-8">
                <div className="flex justify-end gap-8">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="w-32">{formatCurrency(invoiceData.subtotal)}</span>
                </div>
                <div className="flex justify-end gap-8">
                  <span className="text-muted-foreground">
                    Pajak ({invoiceData.taxRate}%)
                  </span>
                  <span className="w-32">{formatCurrency(invoiceData.taxAmount)}</span>
                </div>
                <div className="flex justify-end gap-8 pt-2 border-t">
                  <span className="font-bold text-lg">Grand Total</span>
                  <span className="font-bold text-lg w-32">
                    {formatCurrency(invoiceData.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Catatan:</p>
                <p className="text-sm whitespace-pre-line">{invoiceData.notes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-4">
          <Card className="bg-white dark:bg-gray-900 border rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoiceData.status === "Belum Bayar" && (
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tandai Lunas
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Link Disalin!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link Invoice
                  </>
                )}
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibuat</span>
                <span>{invoiceData.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jatuh Tempo</span>
                <span>{invoiceData.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={statusColors[invoiceData.status]} variant="secondary">
                  {invoiceData.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
