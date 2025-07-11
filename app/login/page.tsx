"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState("signin")
  const [signupError, setSignupError] = useState("")
  const { signIn, signUp, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn(email, password)
      if (!result.error) {
        console.log('Sign in successful:', result)
        console.log('User context after sign in:', user)
        router.replace("/dashboard")
        // Do not setLoading(false) here; let the loader persist until dashboard loads
        return
      } else {
        toast({
          title: "Error",
          description: result.error.message || "Sign in failed. Please check your credentials.",
          variant: "destructive",
        })
      }
    } finally {
      // Only set loading to false if there was an error
      // If successful, dashboard will handle loading state
      // This prevents flicker and ensures smooth transition
      // (no-op here)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError("")
    if (password.length < 7) {
      setSignupError("Password must be at least 7 characters long.")
      return
    }
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Sign up failed. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Account created successfully! Please sign in.",
      })
      setTab("signin")
      setEmail("")
      setPassword("")
      setFullName("")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,165,0,0.1),transparent_50%)]" />
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 backdrop-blur-sm animate-fade-in">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-orange-500 p-3 rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="QualGent Logo" className="h-10 w-10 object-contain" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">QualGent</CardTitle>
          <CardDescription className="text-gray-400">AI-Powered Mobile Testing Platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="signin" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                    placeholder="Enter your password"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={7}
                    className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                    placeholder="Create a password"
                  />
                  {signupError && (
                    <div className="text-sm text-orange-400 bg-gray-800 rounded px-2 py-1 mt-1 animate-fade-in">
                      {signupError}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
