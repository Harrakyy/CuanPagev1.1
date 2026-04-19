"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Eye, Plus, FileText } from "lucide-react"
import { getInvoices, formatRupiah, formatDate, type Invoice } from "@/lib/supabase/queries"

const invoiceStatusLabels: Record<string, string> = {
  unpaid: "Belum Bayar",
  paid: "Lunas",
  partial: "Sebagian",
  overdue: "Jatuh Tempo",
}

const statusColors: Record<string, string> = {
  unpaid: "bg-[#BEFF47] text-black border border-black/10",
  paid: "bg-black/5 text-black border border-black/10",
  partial: "bg-black/5 text-black border border-black/10",
  overdue: "bg-[#BEFF47] text-black border border-black/10",
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-16 ml-auto" />
        </div>
      ))}
    </div>
  )
}

export default function InvoicesPage() {
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    async function loadInvoices() {
      try {
        const data = await getInvoices()
        setInvoices(data)
      } catch (error) {
        console.error("Error loading invoices:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInvoices()
  }, [])

  const filteredInvoices = invoices.filter((invoice) => {
    return (
      invoice.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (invoice.customer?.full_name || "").toLowerCase().includes(search.toLowerCase())
    )
  })

  // Summary stats
  const totalUnpaid = invoices.filter(i => i.status === "unpaid" || i.status === "partial").length
  const totalOverdue = invoices.filter(i => i.status === "overdue").length
  const totalAmount = invoices
    .filter(i => i.status !== "paid")
    .reduce((acc, i) => acc + i.total, 0)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoice</h1>
          <p className="text-muted-foreground">Kelola invoice pelanggan</p>
        </div>
        <Button className="bg-[#BEFF47] hover:bg-[#BEFF47]/90 text-black" asChild>
          <Link href="/admin/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            Buat Invoice
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black/5 rounded-lg">
                <FileText className="h-5 w-5 text-foreground" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{totalUnpaid}</p>
                )}
                <p className="text-sm text-muted-foreground">Belum Bayar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black/5 rounded-lg">
                <FileText className="h-5 w-5 text-foreground" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{totalOverdue}</p>
                )}
                <p className="text-sm text-muted-foreground">Jatuh Tempo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black/5 rounded-lg">
                <FileText className="h-5 w-5 text-foreground" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold">{formatRupiah(totalAmount)}</p>
                )}
                <p className="text-sm text-muted-foreground">Total Outstanding</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border rounded-xl">
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Invoice</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.customer?.full_name || "-"}</TableCell>
                    <TableCell>{formatRupiah(invoice.total)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status]} variant="secondary">
                        {invoiceStatusLabels[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(invoice.due_date)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/invoices/${invoice.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredInvoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada invoice yang ditemukan.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
