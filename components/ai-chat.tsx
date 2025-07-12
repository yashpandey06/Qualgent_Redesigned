"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, User, Send, Sparkles, Copy, Plus, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { logInfo, logError } from "@/lib/logger"
import { PRODUCT_CONTEXT } from "@/lib/gemini/prompt"
import { askGemini } from "@/lib/gemini/gemini"
import { useCallback } from "react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  testCases?: GeneratedTestCase[]
}

interface GeneratedTestCase {
  id?: string
  name: string
  description: string
  category: string
  steps: string[]
  expectedResult: string
  priority: "High" | "Medium" | "Low"
  stored?: boolean
}

interface Project {
  id: string
  name: string
  description: string
}

// Simple animated three-dot loader component
function TypingLoader() {
  return (
    <div className="flex items-center space-x-2">
      <span className="block w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
      <span className="block w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
      <span className="block w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
    </div>
  )
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
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [generatingTestCases, setGeneratingTestCases] = useState(false)
  const [pendingType, setPendingType] = useState<null | 'thinking' | 'generating'>(null)
  const [showTyping, setShowTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/dashboard/projects")
      const result = await res.json()
      if (res.ok && result.projects) {
        setProjects(result.projects)
        if (result.projects.length > 0) {
          setSelectedProject(result.projects[0].id)
        }
      }
    } catch (error) {
      logError("Error fetching projects", error)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedProject) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    const testCaseKeywords = [
      "test case", "test scenario", "generate test", "generate case", "feature to test", "write test", "create test", "test for", "test the", "test login", "test checkout", "test registration", "test flow", "test feature", "test functionality"
    ]
    const isTestCaseRequest = testCaseKeywords.some(keyword => input.toLowerCase().includes(keyword)) || input.trim().length > 20

    if (!isTestCaseRequest) {
      setIsLoading(true)
      setPendingType('thinking')
      setShowTyping(true)
      try {
        const geminiPrompt = `${PRODUCT_CONTEXT}\nUser: ${input}\nAssistant:`
        const geminiResponse = await askGemini(geminiPrompt)
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: geminiResponse.trim() || `👋 Hello! Please describe the feature or functionality you want to generate test cases for, and I'll help you!`,
            timestamp: new Date(),
          },
        ])
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
        setPendingType(null)
        setShowTyping(false)
      }
      return
    }

    setIsLoading(true)
    setGeneratingTestCases(true)
    setPendingType('generating')
    setShowTyping(true)

    try {
      const res = await fetch("/api/dashboard/ai-test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: input,
          project_id: selectedProject
        }),
      })
      
      const result = await res.json()
      logInfo("AI Test Cases API response", result)

      if (res.ok && result.success) {
        const projectName = result.projectName || "your project"
        // Debug: Log generated test cases
        console.log('Generated test cases:', result.testCases)
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content:
              result.testCases && result.testCases.length > 0
                ? `✅ I've generated ${result.generatedCount} test cases for "${input}" and saved them to ${projectName}. Here they are:`
                : `⚠️ No test cases could be generated for "${input}". Please try a different feature description or check your AI configuration.`,
            timestamp: new Date(),
            testCases: result.testCases && result.testCases.length > 0 ? result.testCases : undefined
          },
        ])

        toast({
          title: "Test Cases Generated!",
          description: `${result.generatedCount} test cases have been created and saved to your project.`,
        })
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: `Sorry, I couldn't generate test cases. ${result.error || 'Please try again.'}`,
            testCases: undefined,
            timestamp: new Date(),
          },
        ])
      }
    } catch (err: any) {
      logError("Error generating test cases", err)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: `Sorry, there was an error generating test cases: ${err.message}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
      setGeneratingTestCases(false)
      setPendingType(null)
      setShowTyping(false)
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

  const viewTestCaseInProject = (testCase: GeneratedTestCase) => {
    if (testCase.stored) {
      toast({
        title: "Test Case Saved!",
        description: `"${testCase.name}" has been saved to your project. You can view it in the Test Cases section.`,
      })
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className="h-full bg-gray-900/50 border-gray-800 flex flex-col max-h-screen">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center">
          <Bot className="mr-2 h-5 w-5 text-orange-500" />
          AI Test Case Generator
          <Sparkles className="ml-2 h-4 w-4 text-yellow-500" />
        </CardTitle>
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-sm text-gray-400">Project:</span>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 px-4 min-h-0 max-h-[calc(100vh-220px)]" ref={scrollAreaRef}>
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
                    {message.testCases.map((testCase, index) => (
                      <Card key={index} className="bg-gray-800/50 border-gray-700">
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
                              {testCase.stored && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Saved
                                </Badge>
                              )}
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
                                onClick={() => viewTestCaseInProject(testCase)}
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
                                {testCase.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex">
                                    <span className="mr-2 text-orange-500">{stepIndex + 1}.</span>
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

            {/* Typing loader as a bot message */}
            {showTyping && (
              <div className="flex items-start space-x-3">
                <div className="bg-orange-500 p-2 rounded-full">
                  <Bot className="h-4 w-4 text-black" />
                </div>
                <div className="max-w-[80%]">
                  <div className="p-3 rounded-lg bg-gray-800 text-gray-100">
                    <TypingLoader />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Assistant is typing...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator className="bg-gray-700" />

        <div className="p-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the feature you want to test (e.g., 'User login with email and password')"
              className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-orange-500"
              disabled={isLoading || !selectedProject}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim() || !selectedProject}
              className="bg-orange-500 hover:bg-orange-600 text-black"
            >
              {isLoading ? (
                <TypingLoader />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {!selectedProject && (
            <p className="text-xs text-red-400 mt-2">Please select a project to generate test cases</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
