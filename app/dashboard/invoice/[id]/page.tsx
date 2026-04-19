"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import {
  getInvoiceById,
  formatRupiah,
  formatDate,
  type Invoice,
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
      <div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  )
}

export default function CustomerInvoiceDetailPage() {
  const params = useParams()
  const invoiceId = params.id as string
  const { user } = useAuth()
  
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        const data = await getInvoiceById(invoiceId)
        if (data.customer_id !== user.id) {
          throw new Error("Unauthorized")
        }
        setInvoice(data)
      } catch (error) {
        console.error("Error loading invoice:", error)
        toast.error("Gagal memuat invoice atau Anda tidak memiliki akses.")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [invoiceId, user])

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
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div>
              <Skeleton className="h-7 w-40 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <DetailSkeleton />
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Invoice Tidak Ditemukan</h1>
            </div>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Invoice dengan ID ini tidak ada atau Anda tidak memiliki akses.</p>
          </div>
        </div>
      </div>
    )
  }

  const invoiceItems = invoice.items || []
  const subtotal = invoice.subtotal || invoiceItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  const taxAmount = (subtotal * (invoice.tax_percent || 11)) / 100
  const grandTotal = invoice.total || subtotal + taxAmount

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Detail Invoice</h1>
              <p className="text-muted-foreground">{invoice.invoice_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={statusColors[invoice.status] || statusColors.unpaid} variant="secondary">
              {statusLabels[invoice.status] || invoice.status}
            </Badge>
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download / Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Detail */}
          <Card className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-900 border rounded-xl">
            <CardContent className="p-0 sm:p-8">
              <div id="invoice-card" className="p-6 sm:p-8 bg-white dark:bg-gray-950">
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
                          <td className="py-3 text-sm">{item.nama_layanan}</td>
                          <td className="py-3 text-right text-sm">{item.qty}</td>
                          <td className="py-3 text-right text-sm">{formatRupiah(item.harga_satuan)}</td>
                          <td className="py-3 text-right text-sm font-medium">{formatRupiah(item.subtotal)}</td>
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
                    <span className="text-muted-foreground text-sm">Subtotal</span>
                    <span className="w-32 text-sm">{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-end gap-8">
                    <span className="text-muted-foreground text-sm">
                      Pajak ({invoice.tax_percent || 11}%)
                    </span>
                    <span className="w-32 text-sm">{formatRupiah(taxAmount)}</span>
                  </div>
                  <div className="flex justify-end gap-8 pt-4 border-t mt-4">
                    <span className="font-bold text-lg">Grand Total</span>
                    <span className="font-bold text-lg w-32 text-indigo-600 dark:text-indigo-400">
                      {formatRupiah(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                  <div className="pt-6 border-t mt-8">
                    <p className="text-sm font-medium mb-2">Catatan & Pembayaran:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed bg-muted/30 p-4 rounded-lg">
                      {invoice.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-900 border rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Informasi Tagihan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm gap-y-4">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Status Payment</span>
                  <Badge className={statusColors[invoice.status] || statusColors.unpaid} variant="secondary">
                    {statusLabels[invoice.status] || invoice.status}
                  </Badge>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Jatuh Tempo</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{invoice.due_date ? formatDate(invoice.due_date) : "-"}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Tanggal Dibuat</span>
                  <span>{formatDate(invoice.created_at)}</span>
                </div>
                {invoice.paid_at && (
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Dibayar Pada</span>
                    <span className="font-medium">{formatDate(invoice.paid_at)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {invoice.status !== "paid" && (
              <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 p-4 rounded-xl">
                <h4 className="font-semibold text-indigo-800 dark:text-indigo-400 mb-2">Cara Pembayaran</h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  Silakan lakukan pembayaran sesuai dengan total tagihan ke rekening yang tertera pada catatan. Setelah melakukan pembayaran, Anda dapat menginformasikan admin melalui halaman order atau WhatsApp.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}