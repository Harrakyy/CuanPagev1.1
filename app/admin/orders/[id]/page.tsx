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
import { ArrowLeft, Lock, Eye, Copy, Check, Send, Clock, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import {
  getOrderById,
  getOrderUpdates,
  updateOrder,
  createOrderUpdate,
  approveOrder,
  rejectOrder,
  formatDate,
  formatRupiah,
  type Order,
  type OrderUpdate,
} from "@/lib/supabase/queries"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const statusColors: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  review: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  revision: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const statusLabels: Record<Order["status"], string> = {
  pending: "Menunggu",
  in_progress: "Dikerjakan",
  review: "Review",
  revision: "Revisi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
}

const statusOptions: Order["status"][] = [
  "pending", "in_progress", "review", "revision", "completed", "cancelled",
]

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
        <Card className="bg-card border rounded-xl">
          <CardHeader><Skeleton className="h-6 w-36" /></CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="bg-card border rounded-xl">
          <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
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
  const orderId = params.id as string
  const { user } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingUpdate, setIsSendingUpdate] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [timeline, setTimeline] = useState<OrderUpdate[]>([])
  const [status, setStatus] = useState<Order["status"]>("pending")
  const [progress, setProgress] = useState([0])
  const [internalNote, setInternalNote] = useState("")
  const [customerUpdate, setCustomerUpdate] = useState("")
  const [copied, setCopied] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const [orderData, updates] = await Promise.all([
          getOrderById(orderId),
          getOrderUpdates(orderId),
        ])
        setOrder(orderData)
        setStatus(orderData.status)
        setProgress([orderData.progress])
        setTimeline(updates)
      } catch (error) {
        console.error("Error loading order:", error)
        toast.error("Gagal memuat data pesanan")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [orderId])

  const handleCopyLink = () => {
    const trackUrl = `${window.location.origin}/track/${orderId}`
    navigator.clipboard.writeText(trackUrl)
    setCopied(true)
    toast.info("Link tracker disalin ke clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      await updateOrder(orderId, { status, progress: progress[0] })
      setOrder((prev) => prev ? { ...prev, status, progress: progress[0] } : prev)
      toast.success("Status dan progress berhasil diperbarui")
    } catch (error) {
      toast.error("Gagal menyimpan perubahan")
    } finally {
      setIsSaving(false)
    }
  }

  const handleApprove = async () => {
    if (!user) return
    setIsApproving(true)
    try {
      const updated = await approveOrder(orderId, user.id)
      setOrder((prev) => prev ? { ...prev, ...updated } : prev)
      toast.success("Pesanan di-approve")
    } catch {
      toast.error("Gagal approve pesanan")
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!user) return
    if (!rejectReason.trim()) {
      toast.error("Alasan reject wajib diisi")
      return
    }
    setIsRejecting(true)
    try {
      const updated = await rejectOrder(orderId, user.id, rejectReason.trim())
      setOrder((prev) => prev ? { ...prev, ...updated } : prev)
      toast.success("Pesanan di-reject")
      setRejectReason("")
    } catch {
      toast.error("Gagal reject pesanan")
    } finally {
      setIsRejecting(false)
    }
  }

  const handleSaveNote = async () => {
    if (!internalNote.trim()) {
      toast.error("Catatan tidak boleh kosong")
      return
    }
    setIsSavingNote(true)
    try {
      const update = await createOrderUpdate({
        order_id: orderId,
        message: internalNote.trim(),
        is_customer_visible: false,
      })
      setTimeline((prev) => [update, ...prev])
      setInternalNote("")
      toast.success("Catatan internal berhasil disimpan")
    } catch (error) {
      toast.error("Gagal menyimpan catatan")
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleSendUpdate = async () => {
    if (!customerUpdate.trim()) {
      toast.error("Update tidak boleh kosong")
      return
    }
    setIsSendingUpdate(true)
    try {
      const update = await createOrderUpdate({
        order_id: orderId,
        message: customerUpdate.trim(),
        is_customer_visible: true,
      })
      setTimeline((prev) => [update, ...prev])
      setCustomerUpdate("")
      toast.success("Update berhasil dikirim ke pelanggan")
    } catch (error) {
      toast.error("Gagal mengirim update")
    } finally {
      setIsSendingUpdate(false)
    }
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
          <p className="text-muted-foreground mb-4">
            Pesanan dengan ID {orderId} tidak ada.
          </p>
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
          <p className="text-muted-foreground">{order.order_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Order Info */}
          <Card className="bg-card border rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pelanggan</p>
                  <p className="font-medium">
                    {order.customer?.full_name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.customer?.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{order.customer?.whatsapp || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Layanan</p>
                  <p className="font-medium">{order.service?.nama || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Harga</p>
                  <p className="font-medium">
                    {formatRupiah(order.service?.harga ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-medium">
                    {order.deadline ? formatDate(order.deadline) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dibuat</p>
                  <p className="font-medium">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusColors[order.status]} variant="secondary">
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Approval</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={
                        order.approval_status === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : order.approval_status === "rejected"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }
                    >
                      {order.approval_status === "approved"
                        ? "Approved"
                        : order.approval_status === "rejected"
                        ? "Rejected"
                        : "Pending Approval"}
                    </Badge>
                    {order.approval_status === "approved" && order.approved_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(order.approved_at)}
                      </span>
                    )}
                  </div>
                  {order.approval_status === "rejected" && order.rejection_reason && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Alasan: <span className="text-foreground">{order.rejection_reason}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Actions */}
          {order.approval_status === "pending_approval" && (
            <Card className="bg-card border rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Approval Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90 gap-2"
                  onClick={handleApprove}
                  disabled={isApproving}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isApproving ? "Memproses..." : "Approve"}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 gap-2">
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Reject Pesanan</DialogTitle>
                      <DialogDescription>
                        Beri alasan singkat agar customer paham apa yang perlu diperbaiki.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Contoh: Brief belum lengkap, mohon sertakan referensi desain dan struktur halaman."
                        rows={4}
                      />
                    </div>
                    <DialogFooter className="gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setRejectReason("")}
                        disabled={isRejecting}
                      >
                        Batal
                      </Button>
                      <Button
                        className="bg-foreground text-background hover:bg-foreground/90"
                        onClick={handleReject}
                        disabled={isRejecting}
                      >
                        {isRejecting ? "Memproses..." : "Reject"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Status & Progress */}
          <Card className="bg-card border rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Status & Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Status
                </label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as Order["status"])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        <Badge className={statusColors[opt]} variant="secondary">
                          {statusLabels[opt]}
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
          {/* Internal Note */}
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
              {order.internal_notes && (
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg text-sm">
                  {order.internal_notes}
                </div>
              )}
              <Textarea
                placeholder="Tambahkan catatan internal..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                rows={3}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSaveNote}
                disabled={isSavingNote}
              >
                {isSavingNote ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Catatan"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Customer Update */}
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

          {/* Timeline */}
          <Card className="bg-card border rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada update
                </p>
              ) : (
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            item.is_customer_visible
                              ? "bg-indigo-500"
                              : "bg-yellow-400"
                          }`}
                        />
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(item.created_at)}
                          </span>
                          {item.is_customer_visible ? (
                            <Eye className="h-3 w-3 text-green-500" />
                          ) : (
                            <Lock className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm">{item.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Copy Tracker Link */}
          <Button variant="outline" className="w-full" onClick={handleCopyLink}>
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