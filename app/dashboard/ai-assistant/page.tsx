"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { AiChat } from "@/components/ai-chat"

export default function AiAssistantPage() {
  return (
    <DashboardLayout>
      <div className="p-6 h-[calc(100vh-120px)]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">AI Testing Assistant</h1>
          <p className="text-gray-400">
            Generate comprehensive test cases using AI. Just describe your app's functionality!
          </p>
        </div>

        <div className="h-[calc(100%-100px)]">
          <AiChat />
        </div>
      </div>
    </DashboardLayout>
  )
}
