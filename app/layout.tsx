import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "QualGent - AI-Powered Mobile App Testing",
  description: "Test your mobile app with natural language. No coding required. AI-powered testing on real devices.",
  keywords: ["mobile testing", "AI testing", "app testing", "QA automation", "mobile QA"],
  authors: [{ name: "QualGent Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#f97316",
  openGraph: {
    title: "QualGent - AI-Powered Mobile App Testing",
    description: "Test your mobile app with natural language. No coding required.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "QualGent - AI-Powered Mobile App Testing",
    description: "Test your mobile app with natural language. No coding required.",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
