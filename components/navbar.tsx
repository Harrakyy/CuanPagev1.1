"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Moon, Sun, LogIn, MessageCircle, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const navLinks = [
  { href: "#home", label: "HOME" },
  { href: "#layanan", label: "LAYANAN" },
  { href: "#project", label: "PROJECT" },
  { href: "#pricing", label: "PRICING" },
  { href: "#testimoni", label: "TESTIMONI" },
  { href: "#faq", label: "FAQ" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { setTheme, theme } = useTheme()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="text-xl font-bold tracking-tight text-foreground">
          CuanPage.
        </a>

        {/* Center Links - Hidden on mobile */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
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
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* MASUK Button - Hidden on mobile */}
          <Button
            variant="ghost"
            className="hidden md:flex rounded-full gap-2"
            asChild
          >
            <Link href="/auth/login">
              <LogIn className="h-4 w-4" />
              MASUK
            </Link>
          </Button>

          {/* DAFTAR Button - Hidden on mobile */}
          <Button className="hidden md:flex rounded-full bg-foreground text-background hover:bg-foreground/90 gap-2" asChild>
            <Link href="/auth/signup">
              <MessageCircle className="h-4 w-4" />
              DAFTAR
            </Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-bold tracking-tight">
                  CuanPage.
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="ghost" className="justify-start rounded-full gap-2" asChild>
                    <Link href="/auth/login" onClick={() => setOpen(false)}>
                      <LogIn className="h-4 w-4" />
                      MASUK
                    </Link>
                  </Button>
                  <Button className="justify-start rounded-full bg-foreground text-background hover:bg-foreground/90 gap-2" asChild>
                    <Link href="/auth/signup" onClick={() => setOpen(false)}>
                      <MessageCircle className="h-4 w-4" />
                      DAFTAR
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
