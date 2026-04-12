"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { Bell, ShoppingBag, AlertCircle, MessageSquare, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { notifications as initialNotifications, getRelativeTime, type Notification } from "@/lib/dummy-data"

const notificationIcons: Record<Notification["type"], React.ElementType> = {
  order: ShoppingBag,
  invoice: AlertCircle,
  message: MessageSquare,
  deadline: Clock,
  payment: CheckCircle,
}

export function AdminNotifications() {
  const [notifs, setNotifs] = useState(initialNotifications)
  const unreadCount = notifs.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
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
              onClick={markAllRead}
            >
              Tandai semua dibaca
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Tidak ada notifikasi
            </div>
          ) : (
            notifs.map((notif) => {
              const Icon = notificationIcons[notif.type]
              return (
                <Link
                  key={notif.id}
                  href={notif.link || "#"}
                  onClick={() => markAsRead(notif.id)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors border-l-2",
                    notif.read
                      ? "border-l-transparent bg-background"
                      : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-full shrink-0",
                      notif.type === "order" && "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400",
                      notif.type === "invoice" && "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
                      notif.type === "message" && "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
                      notif.type === "deadline" && "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400",
                      notif.type === "payment" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      notif.read ? "text-foreground" : "text-foreground font-medium"
                    )}>
                      {notif.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getRelativeTime(notif.createdAt)}
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
