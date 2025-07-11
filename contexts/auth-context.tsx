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

  // Helper to fetch profile
  const fetchProfile = async (userId: string, email: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single()
    if (error || !data) {
      return { id: userId, email, name: null }
    }
    return { id: userId, email, name: data.full_name }
  }

  // Listen for auth state changes
  useEffect(() => {
    const getSession = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email || "")
        setUser(profile)
      } else {
        setUser(null)
      }
      setLoading(false)
    }
    getSession()
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email || "")
        setUser(profile)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Sign in: If profile does not exist, create it
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session?.user) {
      setLoading(false)
      return { error }
    }
    const userId = data.session.user.id
    const userEmail = data.session.user.email || email
    // Try to fetch profile
    let profile = await fetchProfile(userId, userEmail)
    if (!profile.name) {
      // If profile does not exist, create it with id and email
      await supabase.from("profiles").upsert({
        id: userId,
        email: userEmail,
        full_name: "",
      })
      // Fetch again
      profile = await fetchProfile(userId, userEmail)
    }
    setUser(profile)
    setLoading(false)
    return { error: null }
  }

  // Sign up: Only insert profile if session exists (i.e., email confirmation is not required)
  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error || !data.user) {
      setLoading(false)
      return { error }
    }
    // If session exists, insert profile now
    if (data.session && data.user) {
      const userId = data.user.id
      const userEmail = data.user.email || email
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        email: userEmail,
        full_name: fullName,
      })
      if (profileError) {
        setLoading(false)
        return { error: profileError }
      }
      const profile = await fetchProfile(userId, userEmail)
      setUser(profile)
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
