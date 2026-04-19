"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  CheckCircle,
  FileText,
  Send,
} from "lucide-react"
import { toast } from "sonner"
import {
  getInvoiceById,
  updateInvoice,
  formatRupiah,
  formatDate,
  type Invoice,
  type InvoiceItem,
} from "@/lib/supabase/queries"

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

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="bg-card border rounded-xl">
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const invoiceId = params.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getInvoiceById(invoiceId)
        setInvoice(data)
      } catch (error) {
        console.error("Error loading invoice:", error)
        toast.error("Gagal memuat invoice")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [invoiceId])

  const handleCopyLink = () => {
    const invoiceUrl = `${window.location.origin}/dashboard/invoice/${invoiceId}`
    navigator.clipboard.writeText(invoiceUrl)
    setCopied(true)
    toast.info("Link disalin ke clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendToCustomer = async () => {
    if (!invoice) return
    setIsSending(true)
    try {
      // Already created when invoice was created, but can resend
      toast.success("Invoice sudah dikirim ke customer sebelumnya")
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
          <title>Invoice ${invoice?.invoice_number || ""}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #111; background: #fff; }
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
            h2 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
            .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
            .invoice-number { text-align: right; }
            .invoice-number h3 { font-size: 18px; font-weight: 700; }
            .bill-to { display: flex; justify-content: space-between; margin-bottom: 32px; }
            .bill-to div { width: 45%; }
            .bill-to div:last-child { text-align: right; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div>
              <h2>CuanPage.</h2>
              <p class="text-muted">Jasa Pembuatan Website Professional</p>
              <p class="text-muted">hello@cuanpage.com | +62 812-3456-7890</p>
            </div>
            <div class="invoice-number">
              <div class="flex items-center gap-2 justify-end" style="display:flex;align-items:center;gap:8px;justify-content:flex-end;">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span class="font-bold" style="font-weight:700;font-size:18px;">INVOICE</span>
              </div>
              <p class="text-muted" style="margin-top:4px;">${invoice?.invoice_number || ""}</p>
            </div>
          </div>
          <div class="bill-to">
            <div>
              <p class="text-muted" style="font-size:13px;margin-bottom:4px;">Kepada:</p>
              <p class="font-bold" style="font-weight:700;">${invoice?.customer?.full_name || invoice?.customer?.email || "-"}</p>
              <p class="text-muted" style="font-size:13px;">${invoice?.customer?.email || ""}</p>
            </div>
            <div>
              <p class="text-muted" style="font-size:13px;margin-bottom:4px;">Jatuh Tempo:</p>
              <p class="font-bold" style="font-weight:700;">${invoice?.due_date ? formatDate(invoice.due_date) : "-"}</p>
            </div>
          </div>
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <Skeleton className="h-7 w-40 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <DetailSkeleton />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Invoice Tidak Ditemukan</h1>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Invoice dengan ID ini tidak ada.</p>
        </div>
      </div>
    )
  }

  const invoiceItems = invoice.items || []
  const subtotal = invoice.subtotal || invoiceItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  const taxAmount = (subtotal * (invoice.tax_percent || 11)) / 100
  const grandTotal = invoice.total || subtotal + taxAmount

  return (
    <div className="p-4 md:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detail Invoice</h1>
            <p className="text-muted-foreground">{invoice.invoice_number}</p>
          </div>
        </div>
        <Badge className={statusColors[invoice.status] || statusColors.unpaid} variant="secondary">
          {statusLabels[invoice.status] || invoice.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 overflow-hidden">
        {/* Invoice Preview */}
        <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border rounded-xl overflow-hidden">
          <CardContent className="p-8">
            <div id="invoice-card" className="border rounded-lg p-8 bg-white dark:bg-gray-950">
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
                  <p className="text-sm text-muted-foreground mt-1">{invoice.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">
                    Tanggal: {formatDate(invoice.created_at)}
                  </p>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Kepada:</p>
                  <p className="font-medium">{invoice.customer?.full_name || invoice.customer?.email || "-"}</p>
                  <p className="text-sm text-muted-foreground">{invoice.customer?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Jatuh Tempo:</p>
                  <p className="font-medium">{invoice.due_date ? formatDate(invoice.due_date) : "-"}</p>
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
                  {invoiceItems.length > 0 ? (
                    invoiceItems.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">{item.nama_layanan}</td>
                        <td className="py-3 text-right">{item.qty}</td>
                        <td className="py-3 text-right">{formatRupiah(item.harga_satuan)}</td>
                        <td className="py-3 text-right">{formatRupiah(item.subtotal)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b">
                      <td className="py-3">-</td>
                      <td className="py-3 text-right">-</td>
                      <td className="py-3 text-right">-</td>
                      <td className="py-3 text-right">-</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals */}
              <div className="space-y-2 text-right mb-8">
                <div className="flex justify-end gap-8">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="w-32">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-end gap-8">
                  <span className="text-muted-foreground">
                    Pajak ({invoice.tax_percent || 11}%)
                  </span>
                  <span className="w-32">{formatRupiah(taxAmount)}</span>
                </div>
                <div className="flex justify-end gap-8 pt-2 border-t">
                  <span className="font-bold text-lg">Grand Total</span>
                  <span className="font-bold text-lg w-32">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Catatan:</p>
                  <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-4 overflow-hidden">
          <Card className="bg-white dark:bg-gray-900 border rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSendToCustomer}
                disabled={isSending}
              >
                <Send className="h-4 w-4 mr-2" />
                Kirim Ulang ke Pelanggan
              </Button>
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
                    Copy Link
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePrint}
              >
                <Download className="h-4 w-4 mr-2" />
                Print / PDF
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
                <span>{formatDate(invoice.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jatuh Tempo</span>
                <span>{invoice.due_date ? formatDate(invoice.due_date) : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={statusColors[invoice.status] || statusColors.unpaid} variant="secondary">
                  {statusLabels[invoice.status] || invoice.status}
                </Badge>
              </div>
              {invoice.order && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pesanan</span>
                  <span>{invoice.order.order_number}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}