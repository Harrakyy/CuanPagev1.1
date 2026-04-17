"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
  formatDate,
} from "@/lib/supabase/queries"
import { Bell, CheckCircle2, ArrowLeft } from "lucide-react"

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [items, setItems] = React.useState<Notification[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isMarkingAll, setIsMarkingAll] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const data = await getNotifications(user.id)
        setItems(data)
      } finally {
        setIsLoading(false)
      }
    }
    if (!authLoading) load()
  }, [authLoading, user])

  const handleMarkAll = async () => {
    if (!user) return
    setIsMarkingAll(true)
    try {
      await markAllNotificationsAsRead(user.id)
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } finally {
      setIsMarkingAll(false)
    }
  }

  const handleMarkOne = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch {
      // silent
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <main className="container mx-auto px-4 sm:px-6 py-8">
          <p className="text-sm text-muted-foreground">Memuat…</p>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <main className="container mx-auto px-4 sm:px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground mb-4">Silakan login untuk melihat notifikasi.</p>
          <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Link href="/auth/login">Login</Link>
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard" aria-label="Back to dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground">Notifikasi</h1>
            <p className="text-sm text-muted-foreground">Update terbaru untuk pesanan dan aktivitasmu.</p>
          </div>
          <div className="ml-auto">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={handleMarkAll}
              disabled={isMarkingAll || isLoading || items.length === 0}
            >
              {isMarkingAll ? "Memproses…" : "Tandai semua dibaca"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border border-border rounded-2xl p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-28 mt-2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="border border-border rounded-2xl p-10 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Belum ada notifikasi</p>
            <p className="text-sm text-muted-foreground mt-1">Kalau ada update dari admin, muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.is_read && handleMarkOne(n.id)}
                className={cn(
                  "w-full text-left border rounded-2xl p-4 transition-colors",
                  n.is_read ? "border-border bg-card" : "border-foreground/20 bg-foreground/[0.03] hover:bg-foreground/[0.06]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                      n.is_read ? "bg-muted" : "bg-foreground text-background"
                    )}
                  >
                    {n.is_read ? (
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground leading-snug">
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(n.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="h-2 w-2 rounded-full bg-foreground mt-2 shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

