"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Upload, Save, Building, FileText, Bell, Lock } from "lucide-react"

export default function SettingsPage() {
  const [profileData, setProfileData] = useState({
    name: "CuanPage",
    address: "Jl. Sudirman No. 123, Jakarta Selatan",
    email: "hello@cuanpage.com",
    phone: "+62 812-3456-7890",
    website: "https://cuanpage.com",
  })

  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: "CP-",
    defaultTax: 11,
    terms: "Pembayaran dapat dilakukan melalui transfer bank ke rekening:\nBCA - 1234567890 a.n. CuanPage\n\nHarap sertakan nomor invoice pada berita acara transfer.",
  })

  const [notifications, setNotifications] = useState({
    newOrder: true,
    statusChange: true,
    invoiceOverdue: true,
    paymentReceived: true,
  })

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola pengaturan akun dan agensi</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <Building className="h-4 w-4" />
            Profil Agensi
          </TabsTrigger>
          <TabsTrigger value="invoice" className="gap-2">
            <FileText className="h-4 w-4" />
            Invoice
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifikasi
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2">
            <Lock className="h-4 w-4" />
            Password
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="bg-white dark:bg-gray-900 border rounded-xl">
            <CardHeader>
              <CardTitle>Profil Agensi</CardTitle>
              <CardDescription>
                Informasi agensi yang akan ditampilkan pada invoice dan komunikasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl bg-black/5 text-black">
                    CP
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    PNG atau JPG. Maks 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nama Agensi</Label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Telepon</Label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Alamat</Label>
                <Textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <Button className="bg-[#BEFF47] hover:bg-[#BEFF47]/90 text-black">
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Tab */}
        <TabsContent value="invoice">
          <Card className="bg-white dark:bg-gray-900 border rounded-xl">
            <CardHeader>
              <CardTitle>Pengaturan Invoice</CardTitle>
              <CardDescription>
                Konfigurasi default untuk pembuatan invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Prefix Nomor Invoice</Label>
                  <Input
                    value={invoiceSettings.prefix}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, prefix: e.target.value })}
                    className="mt-1"
                    placeholder="CP-"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Contoh: {invoiceSettings.prefix}2024-001
                  </p>
                </div>
                <div>
                  <Label>Default Pajak (%)</Label>
                  <Input
                    type="number"
                    value={invoiceSettings.defaultTax}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, defaultTax: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Teks Syarat Pembayaran</Label>
                <Textarea
                  value={invoiceSettings.terms}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, terms: e.target.value })}
                  className="mt-1"
                  rows={5}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Teks ini akan muncul di bagian bawah setiap invoice
                </p>
              </div>

              <Button className="bg-[#BEFF47] hover:bg-[#BEFF47]/90 text-black">
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="bg-white dark:bg-gray-900 border rounded-xl">
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
              <CardDescription>
                Pilih notifikasi yang ingin Anda terima
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Pesanan Baru</p>
                    <p className="text-sm text-muted-foreground">
                      Terima notifikasi saat ada pesanan baru masuk
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newOrder}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, newOrder: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Status Berubah</p>
                    <p className="text-sm text-muted-foreground">
                      Terima notifikasi saat status pesanan berubah
                    </p>
                  </div>
                  <Switch
                    checked={notifications.statusChange}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, statusChange: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Invoice Overdue</p>
                    <p className="text-sm text-muted-foreground">
                      Terima notifikasi saat invoice melewati jatuh tempo
                    </p>
                  </div>
                  <Switch
                    checked={notifications.invoiceOverdue}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, invoiceOverdue: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Pembayaran Masuk</p>
                    <p className="text-sm text-muted-foreground">
                      Terima notifikasi saat pembayaran diterima
                    </p>
                  </div>
                  <Switch
                    checked={notifications.paymentReceived}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, paymentReceived: checked })
                    }
                  />
                </div>
              </div>

              <Button className="bg-[#BEFF47] hover:bg-[#BEFF47]/90 text-black">
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card className="bg-white dark:bg-gray-900 border rounded-xl max-w-lg">
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
              <CardDescription>
                Pastikan password baru Anda cukup kuat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Password Saat Ini</Label>
                <Input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Password Baru</Label>
                <Input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Konfirmasi Password Baru</Label>
                <Input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="mt-1"
                />
              </div>

              <Button className="bg-[#BEFF47] hover:bg-[#BEFF47]/90 text-black">
                <Save className="h-4 w-4 mr-2" />
                Ubah Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
