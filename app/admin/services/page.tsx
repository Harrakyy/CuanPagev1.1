"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Edit, Package } from "lucide-react"
import { toast } from "sonner"
import { getServices, createService, updateService, formatRupiah, type Service } from "@/lib/supabase/queries"

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 ml-auto" />
        </div>
      ))}
    </div>
  )
}

export default function ServicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    estimated_days: 7,
    max_slots: 10,
    is_active: true,
  })

  useEffect(() => {
    loadServices()
  }, [])

  async function loadServices() {
    try {
      const data = await getServices()
      setServices(data)
    } catch (error) {
      console.error("Error loading services:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price,
      estimated_days: service.estimated_days,
      max_slots: service.max_slots,
      is_active: service.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingService(null)
    setFormData({
      name: "",
      description: "",
      price: 0,
      estimated_days: 7,
      max_slots: 10,
      is_active: true,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (editingService) {
        await updateService(editingService.id, formData)
        toast.success("Layanan berhasil diperbarui")
      } else {
        await createService({
          ...formData,
          filled_slots: 0,
        })
        toast.success("Layanan baru berhasil ditambahkan")
      }
      setIsDialogOpen(false)
      loadServices()
    } catch (error) {
      console.error("Error saving service:", error)
      toast.error("Gagal menyimpan layanan")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Layanan</h1>
          <p className="text-muted-foreground">Kelola paket layanan yang ditawarkan</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Layanan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Package className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{services.length}</p>
                )}
                <p className="text-sm text-muted-foreground">Total Layanan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{services.filter(s => s.is_active).length}</p>
                )}
                <p className="text-sm text-muted-foreground">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Package className="h-5 w-5 text-red-600" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{services.filter(s => s.filled_slots >= s.max_slots).length}</p>
                )}
                <p className="text-sm text-muted-foreground">Slot Penuh</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Daftar Layanan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada layanan. Klik &ldquo;Tambah Layanan&rdquo; untuk menambahkan.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Estimasi</TableHead>
                  <TableHead>Slot Maks</TableHead>
                  <TableHead>Terisi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{formatRupiah(service.price)}</TableCell>
                    <TableCell>{service.estimated_days > 0 ? `${service.estimated_days} hari` : "Bulanan"}</TableCell>
                    <TableCell>{service.max_slots}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{service.filled_slots}</span>
                        {service.filled_slots >= service.max_slots && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" variant="secondary">
                            Full
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          service.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                        }
                      >
                        {service.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(service)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Layanan" : "Tambah Layanan Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Ubah detail layanan yang sudah ada"
                : "Tambahkan paket layanan baru"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nama Layanan</Label>
              <Input
                placeholder="Contoh: Landing Page"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea
                placeholder="Deskripsi singkat layanan..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga (Rp)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Estimasi Pengerjaan (hari)</Label>
                <Input
                  type="number"
                  placeholder="7"
                  value={formData.estimated_days}
                  onChange={(e) => setFormData({ ...formData, estimated_days: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Slot Maksimal</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.max_slots}
                onChange={(e) => setFormData({ ...formData, max_slots: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Status Aktif</Label>
              <Switch 
                checked={formData.is_active} 
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              disabled={isSaving || !formData.name}
            >
              {isSaving ? <><Spinner className="mr-2" />Menyimpan...</> : editingService ? "Simpan Perubahan" : "Tambah Layanan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
