"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: { id: string; email: string; name: string | null } | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; name: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  // Listen for auth state changes
  useEffect(() => {
    const getSession = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: null,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    }
    getSession()
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: null,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Sign in
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session?.user) {
      setLoading(false)
      return { error }
    }
    setUser({
      id: data.session.user.id,
      email: data.session.user.email || email,
      name: null,
    })
    setLoading(false)
    return { error: null }
  }

  // Sign up
  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error || !data.user) {
      setLoading(false)
      return { error }
    }
    // If session exists, set user now
    if (data.session && data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || email,
        name: null,
      })
    } else {
      // If no session, user must confirm email before logging in
      setUser(null)
    }
    setLoading(false)
    return { error: null }
  }

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setLoading(false)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
