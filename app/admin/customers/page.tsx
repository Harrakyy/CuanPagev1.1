"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Eye, UserPlus } from "lucide-react"
import { getCustomers, getOrders, getInvoices, formatRupiah, formatDate, type Profile } from "@/lib/supabase/queries"

interface CustomerWithStats extends Profile {
  totalOrders: number
  totalSpent: number
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-16 ml-auto" />
        </div>
      ))}
    </div>
  )
}

export default function CustomersPage() {
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [customersData, ordersData, invoicesData] = await Promise.all([
          getCustomers(),
          getOrders(),
          getInvoices(),
        ])
        
        // Calculate stats for each customer
        const customersWithStats = customersData.map((customer) => {
          const customerOrders = ordersData.filter(o => o.customer_id === customer.id)
          const customerInvoices = invoicesData.filter(i => i.customer_id === customer.id)
          const totalSpent = customerInvoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0)
          
          return {
            ...customer,
            totalOrders: customerOrders.length,
            totalSpent,
          }
        })
        
        setCustomers(customersWithStats)
      } catch (error) {
        console.error("Error loading customers:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      (customer.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (customer.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (customer.whatsapp || "").includes(search)

    return matchesSearch
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pelanggan</h1>
          <p className="text-muted-foreground">Kelola data pelanggan Anda</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah Pelanggan
        </Button>
      </div>

      <Card className="bg-card border rounded-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pelanggan..."
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
                  <TableHead>Email</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead>Total Pesanan</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                            {(customer.full_name || "?").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.full_name || "-"}</p>
                          <Badge
                            variant="secondary"
                            className={
                              customer.totalOrders > 0
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                            }
                          >
                            {customer.totalOrders > 0 ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.email || "-"}</TableCell>
                    <TableCell>{customer.whatsapp || "-"}</TableCell>
                    <TableCell>{formatDate(customer.created_at)}</TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell>{formatRupiah(customer.totalSpent)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/customers/${customer.id}`}>
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

          {!isLoading && filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada pelanggan yang ditemukan.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
