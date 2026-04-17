"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Moon, Sun, LogOut, ChevronDown,
  LayoutDashboard, ShoppingBag, FileText, MessageSquare, Sparkles,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/layanan", label: "Layanan", icon: Sparkles },
  { href: "/dashboard/pesanan", label: "Pesanan", icon: ShoppingBag },
  { href: "/dashboard/invoice", label: "Invoice", icon: FileText },
  { href: "/dashboard/pesan", label: "Pesan", icon: MessageSquare },
]

export function DashboardNavbar() {
  const { setTheme, theme } = useTheme()
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight text-foreground shrink-0"
        >
          CuanPage.
        </Link>

        {/* Nav Links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-border"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.name} />
                  <AvatarFallback className="bg-foreground text-background text-xs">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                  {user?.name || "User"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              {/* Mobile nav links in dropdown */}
              <div className="md:hidden">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <DropdownMenuItem key={href} asChild>
                    <Link href={href} className="flex items-center gap-2 cursor-pointer">
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </div>
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}