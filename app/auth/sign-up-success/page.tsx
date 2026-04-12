import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 text-center">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-foreground">
            CuanPage.
          </Link>
        </div>

        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Cek Email Kamu
        </h1>
        <p className="text-muted-foreground mb-6">
          Kami telah mengirimkan link konfirmasi ke email kamu. 
          Silakan klik link tersebut untuk mengaktifkan akun.
        </p>

        {/* Info */}
        <div className="bg-muted/50 rounded-xl p-4 mb-6 text-sm text-muted-foreground">
          <p>
            Tidak menerima email? Cek folder spam atau tunggu beberapa menit.
          </p>
        </div>

        {/* Back to Login */}
        <Link href="/auth/login">
          <Button variant="outline" className="w-full rounded-xl">
            Kembali ke Login
          </Button>
        </Link>
      </div>
    </div>
  )
}
