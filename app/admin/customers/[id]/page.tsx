"use client"

import * as React from "react"
import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Edit,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  Send,
  Eye,
} from "lucide-react"

// Mock data
const customerData = {
  id: "CUS-001",
  name: "Ahmad Rizki",
  email: "ahmad.rizki@example.com",
  whatsapp: "+6281234567890",
  joinDate: "2024-01-01",
  totalOrders: 5,
  totalSpent: "Rp 12.500.000",
  status: "Active",
  address: "Jl. Sudirman No. 123, Jakarta Selatan",
}

const customerOrders = [
  { id: "ORD-001", service: "Landing Page", status: "Dikerjakan", date: "2024-01-15", price: "Rp 2.500.000" },
  { id: "ORD-012", service: "Company Profile", status: "Selesai", date: "2024-01-02", price: "Rp 3.500.000" },
  { id: "ORD-025", service: "E-Commerce", status: "Selesai", date: "2023-12-15", price: "Rp 5.000.000" },
]

const customerInvoices = [
  { id: "CP-2024-001", amount: "Rp 2.500.000", status: "Belum Bayar", dueDate: "2024-01-25" },
  { id: "CP-2024-002", amount: "Rp 3.500.000", status: "Lunas", dueDate: "2024-01-10" },
  { id: "CP-2023-045", amount: "Rp 5.000.000", status: "Lunas", dueDate: "2023-12-25" },
]

const internalNotes = [
  { date: "2024-01-15", note: "Client sangat kooperatif dan responsif. Prefer komunikasi via WA." },
  { date: "2024-01-02", note: "Sudah deal untuk project landing page baru bulan depan." },
]

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Dikerjakan: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Review: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  Selesai: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "Belum Bayar": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  Lunas: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
}

export default function CustomerDetailPage() {
  const params = useParams()
  const [newNote, setNewNote] = useState("")
  const [message, setMessage] = useState("")

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Detail Pelanggan</h1>
          <p className="text-muted-foreground">{params.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="bg-white dark:bg-gray-900 border rounded-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {customerData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{customerData.name}</h2>
              <Badge
                variant="secondary"
                className={
                  customerData.status === "Active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mt-2"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 mt-2"
                }
              >
                {customerData.status}
              </Badge>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customerData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customerData.whatsapp}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Bergabung {customerData.joinDate}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                <ShoppingBag className="h-5 w-5 mx-auto mb-1 text-indigo-600" />
                <p className="text-lg font-bold">{customerData.totalOrders}</p>
                <p className="text-xs text-muted-foreground">Pesanan</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <p className="text-lg font-bold">{customerData.totalSpent}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-6">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profil
            </Button>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders">
            <TabsList className="mb-4">
              <TabsTrigger value="orders">Pesanan</TabsTrigger>
              <TabsTrigger value="invoices">Invoice</TabsTrigger>
              <TabsTrigger value="notes">Catatan Internal</TabsTrigger>
              <TabsTrigger value="message">Kirim Pesan</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card className="bg-white dark:bg-gray-900 border rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Riwayat Pesanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.service}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[order.status]} variant="secondary">
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>{order.price}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices">
              <Card className="bg-white dark:bg-gray-900 border rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Riwayat Invoice</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Invoice</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Jatuh Tempo</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>{invoice.amount}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[invoice.status]} variant="secondary">
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{invoice.dueDate}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/invoices/${invoice.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card className="bg-white dark:bg-gray-900 border rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Catatan Internal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {internalNotes.map((note, index) => (
                      <div key={index} className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">{note.date}</p>
                        <p className="text-sm">{note.note}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <Textarea
                      placeholder="Tambahkan catatan baru..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white">
                      Simpan Catatan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="message">
              <Card className="bg-white dark:bg-gray-900 border rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Kirim Pesan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Tulis pesan untuk pelanggan..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                  />
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Pesan
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
