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
import { ArrowLeft, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import {
  getInvoiceById,
  formatRupiah,
  formatDate,
  type Invoice,
} from "@/lib/supabase/queries"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const statusColors: Record<string, string> = {
  unpaid: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  paid:   "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  partial:"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  overdue:"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
}

const statusLabels: Record<string, string> = {
  unpaid:  "Belum Bayar",
  paid:    "Lunas",
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
  const [isDownloading, setIsDownloading] = useState(false)

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

  const handleDownload = async () => {
    const element = document.getElementById("invoice-card")
    if (!element) return

    setIsDownloading(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Invoice-${invoice?.invoice_number || "download"}.pdf`)
      toast.success("Invoice berhasil didownload")
    } catch (err) {
      console.error(err)
      toast.error("Gagal generate PDF, coba lagi")
    } finally {
      setIsDownloading(false)
    }
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
              <Link href="/dashboard/invoice">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Invoice Tidak Ditemukan</h1>
            </div>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Invoice dengan ID ini tidak ada atau Anda tidak memiliki akses.
            </p>
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/invoice">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Detail Invoice</h1>
              <p className="text-muted-foreground">{invoice.invoice_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={statusColors[invoice.status] || statusColors.unpaid}
              variant="secondary"
            >
              {statusLabels[invoice.status] || invoice.status}
            </Badge>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="gap-2"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Invoice Card — ini yang di-capture jadi PDF */}
          <Card className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-900 border rounded-xl">
            <CardContent className="p-0 sm:p-8">
              <div
                id="invoice-card"
                className="p-6 sm:p-8 bg-white"
                style={{ backgroundColor: "#ffffff", color: "#111111" }}
              >
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: "#111111" }}>
                      CuanPage.
                    </h2>
                    <p style={{ color: "#6b7280", fontSize: "13px" }}>
                      Jasa Pembuatan Website Professional
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "13px" }}>
                      hello@cuanpage.com
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      className="font-bold"
                      style={{ fontSize: "18px", color: "#111111" }}
                    >
                      INVOICE
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>
                      {invoice.invoice_number}
                    </p>
                  </div>
                </div>

                {/* Bill To */}
                <div className="flex justify-between mb-8">
                  <div>
                    <p style={{ color: "#6b7280", fontSize: "12px", marginBottom: "4px" }}>
                      Kepada:
                    </p>
                    <p className="font-semibold" style={{ color: "#111111" }}>
                      {invoice.customer?.full_name || invoice.customer?.email || "-"}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "13px" }}>
                      {invoice.customer?.email || ""}
                    </p>
                    {invoice.customer?.whatsapp && (
                      <p style={{ color: "#6b7280", fontSize: "13px" }}>
                        {invoice.customer.whatsapp}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "#6b7280", fontSize: "12px", marginBottom: "4px" }}>
                      Jatuh Tempo:
                    </p>
                    <p className="font-semibold" style={{ color: "#111111" }}>
                      {invoice.due_date ? formatDate(invoice.due_date) : "-"}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "8px", marginBottom: "4px" }}>
                      Tanggal Dibuat:
                    </p>
                    <p style={{ color: "#111111", fontSize: "13px" }}>
                      {formatDate(invoice.created_at)}
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <th style={{ textAlign: "left", padding: "8px 0", fontSize: "13px", color: "#374151" }}>
                        Deskripsi
                      </th>
                      <th style={{ textAlign: "right", padding: "8px 0", fontSize: "13px", color: "#374151" }}>
                        Qty
                      </th>
                      <th style={{ textAlign: "right", padding: "8px 0", fontSize: "13px", color: "#374151" }}>
                        Harga
                      </th>
                      <th style={{ textAlign: "right", padding: "8px 0", fontSize: "13px", color: "#374151" }}>
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.length > 0 ? (
                      invoiceItems.map((item, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "10px 0", fontSize: "13px", color: "#111111" }}>
                            {item.nama_layanan}
                          </td>
                          <td style={{ padding: "10px 0", textAlign: "right", fontSize: "13px", color: "#111111" }}>
                            {item.qty}
                          </td>
                          <td style={{ padding: "10px 0", textAlign: "right", fontSize: "13px", color: "#111111" }}>
                            {formatRupiah(item.harga_satuan)}
                          </td>
                          <td style={{ padding: "10px 0", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#111111" }}>
                            {formatRupiah(item.subtotal)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td colSpan={4} style={{ padding: "10px 0", fontSize: "13px", color: "#6b7280", textAlign: "center" }}>
                          Tidak ada item
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Totals */}
                <div style={{ textAlign: "right", marginBottom: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "4rem", marginBottom: "6px" }}>
                    <span style={{ color: "#6b7280", fontSize: "13px" }}>Subtotal</span>
                    <span style={{ width: "8rem", fontSize: "13px", color: "#111111" }}>
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "4rem", marginBottom: "6px" }}>
                    <span style={{ color: "#6b7280", fontSize: "13px" }}>
                      Pajak ({invoice.tax_percent || 11}%)
                    </span>
                    <span style={{ width: "8rem", fontSize: "13px", color: "#111111" }}>
                      {formatRupiah(taxAmount)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "4rem",
                      paddingTop: "12px",
                      borderTop: "1px solid #e5e7eb",
                      marginTop: "8px",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: "16px", color: "#111111" }}>
                      Grand Total
                    </span>
                    <span style={{ width: "8rem", fontWeight: 700, fontSize: "16px", color: "#4f46e5" }}>
                      {formatRupiah(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                  <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem", marginTop: "1rem" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "#111111" }}>
                      Catatan & Pembayaran:
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        whiteSpace: "pre-line",
                        lineHeight: "1.6",
                        backgroundColor: "#f9fafb",
                        padding: "12px",
                        borderRadius: "8px",
                      }}
                    >
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
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Status Payment</span>
                  <Badge
                    className={statusColors[invoice.status] || statusColors.unpaid}
                    variant="secondary"
                  >
                    {statusLabels[invoice.status] || invoice.status}
                  </Badge>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Jatuh Tempo</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {invoice.due_date ? formatDate(invoice.due_date) : "-"}
                  </span>
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
                <h4 className="font-semibold text-indigo-800 dark:text-indigo-400 mb-2">
                  Cara Pembayaran
                </h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  Silakan lakukan pembayaran sesuai dengan total tagihan ke rekening yang tertera pada catatan. Setelah melakukan pembayaran, Anda dapat menginformasikan admin melalui halaman order atau WhatsApp.
                </p>
              </div>
            )}

            {/* Download button mobile — tampil di bawah info panel */}
            <Button
              onClick={handleDownload}
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}