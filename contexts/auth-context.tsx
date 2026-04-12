"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect } from "react"
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setSupabaseUser(session.user)
        await fetchUserProfile(session.user.id)
      }
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setSupabaseUser(session.user)
          await fetchUserProfile(session.user.id)
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setSupabaseUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching profile:", error)
      return
    }

    if (profile) {
      setUser({
        id: profile.id,
        name: profile.full_name || profile.email?.split("@")[0] || "User",
        email: profile.email || "",
        whatsapp: profile.whatsapp || undefined,
        role: profile.role as "admin" | "customer",
      })
    }
  }

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
      await fetchUserProfile(data.user.id)
      
      // Get the user's role to redirect appropriately
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

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
    
    // If email confirmation is required, redirect to success page
    if (authData.user && !authData.session) {
      router.push("/auth/sign-up-success")
      return {}
    }

    // If session exists immediately (email confirmation disabled)
    if (authData.session) {
      router.push("/dashboard")
    }

    return {}
  }

  const logout = async () => {
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
