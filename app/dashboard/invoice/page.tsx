"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, AlertCircle, CheckCircle2, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getInvoicesByCustomer,
  formatRupiah,
  formatDate,
  type Invoice,
} from "@/lib/supabase/queries"
import { useAuth } from "@/contexts/auth-context"

const invoiceStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  paid:    { label: "Lunas",        color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",     icon: CheckCircle2 },
  unpaid:  { label: "Belum Bayar",  color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",             icon: AlertCircle },
  partial: { label: "Sebagian",     color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",         icon: Clock },
  overdue: { label: "Jatuh Tempo",  color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: AlertCircle },
}

function InvoiceSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-8 w-36" />
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 flex-1 rounded-xl" />
      </div>
    </div>
  )
}

export default function InvoicePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("semua")

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const data = await getInvoicesByCustomer(user.id)
        setInvoices(data)
      } catch {
        // silent
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user])

  const filters = [
    { key: "semua",  label: "Semua" },
    { key: "unpaid", label: "Belum Bayar" },
    { key: "paid",   label: "Lunas" },
    { key: "overdue",label: "Jatuh Tempo" },
  ]

  const filteredInvoices = invoices.filter((inv) =>
    filter === "semua" ? true : inv.status === filter
  )

  const totalUnpaid = invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + inv.total, 0)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="container mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Invoice Saya</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {invoices.length} total invoice
          </p>
        </div>

        {/* Unpaid banner */}
        {!isLoading && totalUnpaid > 0 && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
                  Ada tagihan yang belum dibayar
                </p>
                <p className="text-red-600 dark:text-red-500 text-xs mt-0.5">
                  Total: {formatRupiah(totalUnpaid)}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shrink-0"
              onClick={() => setFilter("unpaid")}
            >
              Lihat
            </Button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                filter === f.key
                  ? "bg-indigo-600 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Invoice list */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <InvoiceSkeleton key={i} />)}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🧾</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {filter === "semua" ? "Belum ada invoice" : "Tidak ada invoice di kategori ini"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Invoice akan muncul setelah admin membuat pesanan untukmu.
            </p>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl" asChild>
              <Link href="/dashboard/layanan">
                <Sparkles className="h-4 w-4 mr-2" />
                Pesan Layanan
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => {
              const config = invoiceStatusConfig[invoice.status] || invoiceStatusConfig.unpaid
              const StatusIcon = config.icon
              const isPaid = invoice.status === "paid"

              return (
                <div
                  key={invoice.id}
                  className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-foreground">{invoice.invoice_number}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {invoice.order?.order_number || "-"}
                      </p>
                    </div>
                    <Badge className={cn("gap-1 rounded-full", config.color)} variant="secondary">
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>

                  {/* Amount */}
                  <p className="text-2xl font-bold text-foreground mb-3">
                    {formatRupiah(invoice.total)}
                  </p>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-muted-foreground mb-0.5">Dibuat</p>
                      <p className="font-medium text-foreground">
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-muted-foreground mb-0.5">Jatuh Tempo</p>
                      <p className={cn(
                        "font-medium",
                        invoice.status === "overdue" ? "text-red-600" : "text-foreground"
                      )}>
                        {formatDate(invoice.due_date)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl h-9 text-xs gap-1.5"
                      onClick={() => router.push(`/dashboard/invoice/${invoice.id}`)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download / Print
                    </Button>
                    {!isPaid && (
                      <Button
                        size="sm"
                        className="flex-1 rounded-xl h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                        onClick={() => router.push(`/dashboard/invoice/${invoice.id}`)}
                      >
                        Konfirmasi Bayar
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
