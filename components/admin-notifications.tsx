"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, ShoppingBag, AlertCircle, MessageSquare, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getRelativeTime,
  type Notification,
} from "@/lib/supabase/queries"
import { useAuth } from "@/contexts/auth-context"

const notificationIcons: Record<string, React.ElementType> = {
  order: ShoppingBag,
  invoice: AlertCircle,
  message: MessageSquare,
  deadline: Clock,
  payment: CheckCircle,
}

const notificationColors: Record<string, string> = {
  order: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400",
  invoice: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
  message: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
  deadline: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400",
  payment: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
}

export function AdminNotifications() {
  const { user } = useAuth()
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    async function loadNotifications() {
      try {
        const data = await getNotifications(user!.id)
        setNotifs(data)
      } catch (error) {
        console.error("Error loading notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadNotifications()
  }, [user?.id])

  const unreadCount = notifs.filter((n) => !n.is_read).length

  const handleMarkAllRead = async () => {
    if (!user?.id) return
    try {
      await markAllNotificationsAsRead(user.id)
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifikasi</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifikasi</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground h-auto py-1 px-2"
              onClick={handleMarkAllRead}
            >
              Tandai semua dibaca
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Tidak ada notifikasi
            </div>
          ) : (
            notifs.map((notif) => {
              const Icon = notificationIcons[notif.type] || Bell
              const colorClass = notificationColors[notif.type] || notificationColors.order
              return (
                <Link
                  key={notif.id}
                  href="#"
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors border-l-2",
                    notif.is_read
                      ? "border-l-transparent bg-background"
                      : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  )}
                >
                  <div className={cn("p-2 rounded-full shrink-0", colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm",
                        !notif.is_read && "font-medium"
                      )}
                    >
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getRelativeTime(notif.created_at)}
                    </p>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}