"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Lock,
  Eye,
  Copy,
  Check,
  Send,
  Clock,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { orders, customers, orderStatusLabels, formatDate, formatRupiah, type Order } from "@/lib/dummy-data"

const statusColors: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  review: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  revision: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const statusOptions: Order["status"][] = ["pending", "in_progress", "review", "revision", "completed", "cancelled"]

const mockTimeline = [
  { date: "2024-05-28 14:30", type: "update", message: "Revisi halaman About sesuai feedback. Tinggal finishing section contact.", visible: true },
  { date: "2024-05-25 10:00", type: "update", message: "Homepage sudah selesai 80%. Menunggu konten dari client untuk halaman About.", visible: true },
  { date: "2024-05-20 09:15", type: "status", message: "Status diubah menjadi Dikerjakan", visible: true },
  { date: "2024-05-15 16:00", type: "status", message: "Pesanan dibuat", visible: true },
]

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="bg-card border rounded-xl">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
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
        <Card className="bg-card border rounded-xl">
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="bg-card border rounded-xl">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingUpdate, setIsSendingUpdate] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [customer, setCustomer] = useState<typeof customers[0] | null>(null)
  const [status, setStatus] = useState<Order["status"]>("pending")
  const [progress, setProgress] = useState([0])
  const [internalNote, setInternalNote] = useState("")
  const [customerUpdate, setCustomerUpdate] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      const foundOrder = orders.find((o) => o.id === params.id)
      if (foundOrder) {
        setOrder(foundOrder)
        setStatus(foundOrder.status)
        setProgress([foundOrder.progress])
        const foundCustomer = customers.find((c) => c.id === foundOrder.customerId)
        setCustomer(foundCustomer || null)
      }
      setIsLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [params.id])

  const handleCopyLink = () => {
    const trackUrl = `${window.location.origin}/track/${params.id}`
    navigator.clipboard.writeText(trackUrl)
    setCopied(true)
    toast.info("Link tracker disalin ke clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSaving(false)
    toast.success("Status dan progress berhasil diperbarui")
  }

  const handleSaveNote = async () => {
    if (!internalNote.trim()) {
      toast.error("Catatan tidak boleh kosong")
      return
    }
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success("Catatan internal berhasil disimpan")
    setInternalNote("")
  }

  const handleSendUpdate = async () => {
    if (!customerUpdate.trim()) {
      toast.error("Update tidak boleh kosong")
      return
    }
    setIsSendingUpdate(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSendingUpdate(false)
    toast.success("Update berhasil dikirim ke pelanggan")
    setCustomerUpdate("")
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

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Pesanan tidak ditemukan</h2>
          <p className="text-muted-foreground mb-4">Pesanan dengan ID {params.id} tidak ada.</p>
          <Button asChild>
            <Link href="/admin/orders">Kembali ke Daftar Pesanan</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Detail Pesanan</h1>
          <p className="text-muted-foreground">{order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Order Info Card */}
          <Card className="bg-card border rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pelanggan</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{customer?.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{customer?.whatsapp || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Layanan</p>
                  <p className="font-medium">{order.service}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Harga</p>
                  <p className="font-medium">{formatRupiah(order.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-medium">{formatDate(order.deadline)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dibuat</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Progress Card */}
          <Card className="bg-card border rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Status & Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as Order["status"])}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        <Badge className={statusColors[opt]} variant="secondary">
                          {orderStatusLabels[opt]}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Progress: {progress[0]}%
                </label>
                <Slider
                  value={progress}
                  onValueChange={setProgress}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Internal Note Card */}
          <Card className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-yellow-600" />
                <CardTitle className="text-lg">Catatan Internal</CardTitle>
              </div>
              <CardDescription className="text-yellow-700 dark:text-yellow-400">
                Tidak terlihat oleh pelanggan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.notes && (
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg text-sm">
                  {order.notes}
                </div>
              )}
              <Textarea
                placeholder="Tambahkan catatan internal..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                rows={3}
              />
              <Button variant="outline" className="w-full" onClick={handleSaveNote}>
                Simpan Catatan
              </Button>
            </CardContent>
          </Card>

          {/* Customer Update Card */}
          <Card className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-600" />
                <CardTitle className="text-lg">Update ke Pelanggan</CardTitle>
              </div>
              <CardDescription className="text-green-700 dark:text-green-400">
                Terlihat pada halaman tracker
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Tulis update untuk pelanggan..."
                value={customerUpdate}
                onChange={(e) => setCustomerUpdate(e.target.value)}
                rows={3}
              />
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSendUpdate}
                disabled={isSendingUpdate}
              >
                {isSendingUpdate ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Update
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className="bg-card border rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTimeline.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${item.type === "update" ? "bg-indigo-500" : "bg-gray-400"}`} />
                      {index < mockTimeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                        {item.visible && (
                          <Eye className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm">{item.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Copy Tracker Link */}
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
                Copy Link Tracker
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
