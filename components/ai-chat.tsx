"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bot, User, Send, Sparkles, Copy, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// REMOVE: import { handleUserMessage } from "@/lib/assistant";

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  testCases?: GeneratedTestCase[]
}

interface GeneratedTestCase {
  id: string
  name: string
  description: string
  category: string
  steps: string[]
  expectedResult: string
  priority: "High" | "Medium" | "Low"
}

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "👋 Hi! I'm your AI Testing Assistant. I can help you generate comprehensive test cases for your mobile app. Just describe your app's functionality or the feature you want to test!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })
      const result = await res.json()
      if (result.type === "scroll") {
        setTimeout(() => {
          const section = document.getElementById(result.data)
          if (section) {
            section.scrollIntoView({ behavior: "smooth" })
          }
        }, 500)
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: `I've scrolled to the relevant section for you!`,
            timestamp: new Date(),
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: result.data,
            timestamp: new Date(),
          },
        ])
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: `Sorry, there was an error: ${err.message}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyTestCase = (testCase: GeneratedTestCase) => {
    const text = `Test Case: ${testCase.name}\nDescription: ${testCase.description}\nSteps:\n${testCase.steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}\nExpected Result: ${testCase.expectedResult}`
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Test case copied to clipboard",
    })
  }

  const addTestCaseToProject = (testCase: GeneratedTestCase) => {
    toast({
      title: "Test Case Added!",
      description: `"${testCase.name}" has been added to your project`,
    })
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className="h-full bg-gray-900/50 border-gray-800 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center">
          <Bot className="mr-2 h-5 w-5 text-orange-500" />
          AI Test Case Generator
          <Sparkles className="ml-2 h-4 w-4 text-yellow-500" />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                <div className={`flex items-start space-x-3 ${message.type === "user" ? "justify-end" : ""}`}>
                  {message.type === "ai" && (
                    <div className="bg-orange-500 p-2 rounded-full">
                      <Bot className="h-4 w-4 text-black" />
                    </div>
                  )}

                  <div className={`max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.type === "user" ? "bg-blue-500 text-white ml-auto" : "bg-gray-800 text-gray-100"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                  </div>

                  {message.type === "user" && (
                    <div className="bg-blue-500 p-2 rounded-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Generated Test Cases */}
                {message.testCases && message.testCases.length > 0 && (
                  <div className="ml-12 space-y-3">
                    {message.testCases.map((testCase) => (
                      <Card key={testCase.id} className="bg-gray-800/50 border-gray-700">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-sm text-white">{testCase.name}</CardTitle>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  testCase.priority === "High"
                                    ? "border-red-500/30 text-red-400"
                                    : testCase.priority === "Medium"
                                      ? "border-yellow-500/30 text-yellow-400"
                                      : "border-green-500/30 text-green-400"
                                }`}
                              >
                                {testCase.priority}
                              </Badge>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyTestCase(testCase)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addTestCaseToProject(testCase)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-orange-500"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-gray-400 mb-2">{testCase.description}</p>
                          <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs mb-2">
                            {testCase.category}
                          </Badge>

                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-gray-300 mb-1">Steps:</p>
                              <ol className="text-xs text-gray-400 space-y-1">
                                {testCase.steps.map((step, index) => (
                                  <li key={index} className="flex">
                                    <span className="mr-2 text-orange-500">{index + 1}.</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-gray-300 mb-1">Expected Result:</p>
                              <p className="text-xs text-gray-400">{testCase.expectedResult}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="bg-orange-500 p-2 rounded-full">
                  <Bot className="h-4 w-4 text-black" />
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator className="bg-gray-800" />

        <div className="p-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the functionality you want to test (e.g., 'login flow', 'payment process', 'user registration')..."
              className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-black"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {["Login flow", "Payment process", "User registration", "Navigation testing"].map((suggestion) => (
              <Button
                key={suggestion}
                size="sm"
                variant="outline"
                onClick={() => setInput(suggestion)}
                className="text-xs border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 bg-transparent"
                disabled={isLoading}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
