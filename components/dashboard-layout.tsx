"use client"

import React, { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TestTube, Bell, User, Settings, LogOut, FileText, Play, TicketIcon as Queue, Bot } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const navigation = [
    { name: "Test Cases", href: "/dashboard/test-cases", icon: TestTube },
    { name: "Run & View", href: "/dashboard/run-view", icon: Play },
    { name: "Files", href: "/dashboard/files", icon: FileText },
    { name: "Queue", href: "/dashboard/queue", icon: Queue },
    { name: "AI Assistant", href: "/dashboard/ai-assistant", icon: Bot },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="bg-orange-500 p-2 rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="QualGent Logo" className="h-7 w-7 object-contain" />
              </div>
              <span className="text-xl font-bold text-white">QualGent</span>
            </Link>

            {/* Navigation */}
            <nav className="flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${active ? "bg-orange-500 text-black shadow-lg" : "text-gray-300 hover:text-white hover:bg-gray-800"}
                        ${item.name === "AI Assistant" && !active ? "bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30" : ""}
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Bell className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-gray-300 hover:text-white">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                      <p className="text-xs leading-none text-gray-400">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                    onClick={async () => {
                      setSigningOut(true)
                      await signOut()
                      // Clear all localStorage/sessionStorage and cookies related to Supabase
                      localStorage.clear()
                      sessionStorage.clear()
                      // Remove Supabase cookies (if any)
                      document.cookie.split(';').forEach(function(c) {
                        if (c.trim().startsWith('sb-')) {
                          document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
                        }
                      })
                      // Wait a short moment to ensure everything is cleared
                      setTimeout(() => {
                        router.replace("/")
                        setSigningOut(false)
                      }, 200)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-56px)]">{children}</main>
    </div>
  )
}
