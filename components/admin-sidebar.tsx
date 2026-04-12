"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  FileText,
  CreditCard,
  Package,
  MessageSquare,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: ShoppingBag, label: "Pesanan", href: "/admin/orders", badge: "orders" },
  { icon: Users, label: "Pelanggan", href: "/admin/customers" },
  { icon: FileText, label: "Invoice", href: "/admin/invoices", badge: "invoices" },
  { icon: CreditCard, label: "Pembayaran", href: "/admin/payments" },
  { icon: Package, label: "Layanan", href: "/admin/services" },
  { icon: MessageSquare, label: "Pesan", href: "/admin/messages", badge: "messages" },
  { icon: BarChart2, label: "Laporan", href: "/admin/reports" },
  { icon: Settings, label: "Pengaturan", href: "/admin/settings" },
]

// Mock badge counts
const badgeCounts = {
  orders: 5,
  invoices: 3,
  messages: 2,
}

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">CuanPage.</span>
          <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const badgeCount = item.badge ? badgeCounts[item.badge as keyof typeof badgeCounts] : null

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {badgeCount && badgeCount > 0 && (
                <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[1.5rem] text-center">
                  {badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-indigo-600 text-white">
              {user?.name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || "Admin"}
            </p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Keluar
        </Button>
      </div>
    </aside>
  )
}
