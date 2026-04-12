"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <span className="text-3xl font-bold text-foreground">CuanPage.</span>
        </div>

        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-[150px] font-bold text-muted-foreground/20 leading-none select-none">
            404
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Halaman tidak ditemukan
        </h1>
        <p className="text-muted-foreground mb-8">
          Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
