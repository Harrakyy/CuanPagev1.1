"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  name: string
  email: string
  whatsapp?: string
  role: "admin" | "customer"
}

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (data: SignupData) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

interface SignupData {
  name: string
  email: string
  whatsapp: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cache profile in memory so we don't refetch on every re-render
let profileCache: Record<string, User> = {}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const isFetching = useRef(false)

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    // Return cached profile if available
    if (profileCache[userId]) {
      setUser(profileCache[userId])
      return profileCache[userId]
    }

    // Prevent duplicate concurrent fetches
    if (isFetching.current) return null
    isFetching.current = true

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, whatsapp, role")
        .eq("id", userId)
        .single()

      if (error || !profile) {
        console.error("Error fetching profile:", error)
        return null
      }

      const mappedUser: User = {
        id: profile.id,
        name: profile.full_name || profile.email?.split("@")[0] || "User",
        email: profile.email || "",
        whatsapp: profile.whatsapp || undefined,
        role: profile.role as "admin" | "customer",
      }

      // Cache it
      profileCache[userId] = mappedUser
      setUser(mappedUser)
      return mappedUser
    } finally {
      isFetching.current = false
    }
  }

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user && mounted) {
        setSupabaseUser(session.user)
        await fetchUserProfile(session.user.id)
      }

      if (mounted) setIsLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === "SIGNED_IN" && session?.user) {
          setSupabaseUser(session.user)
          // Only fetch if not already cached
          if (!profileCache[session.user.id]) {
            await fetchUserProfile(session.user.id)
          }
        } else if (event === "SIGNED_OUT") {
          profileCache = {}
          setUser(null)
          setSupabaseUser(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    setIsLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setIsLoading(false)
      return { error: error.message }
    }

    if (data.user) {
      // Single profile fetch — use returned data directly, no second query
      const profile = await fetchUserProfile(data.user.id)
      setIsLoading(false)

      if (profile?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }

    return {}
  }

  const signup = async (data: SignupData): Promise<{ error?: string }> => {
    setIsLoading(true)

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          full_name: data.name,
          whatsapp: data.whatsapp,
        },
      },
    })

    if (error) {
      setIsLoading(false)
      return { error: error.message }
    }

    setIsLoading(false)

    if (authData.user && !authData.session) {
      router.push("/auth/sign-up-success")
      return {}
    }

    if (authData.session) {
      router.push("/dashboard")
    }

    return {}
  }

  const logout = async () => {
    profileCache = {}
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, supabaseUser, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}