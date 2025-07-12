"use client"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Play, Smartphone, FolderOpen, Loader2, MessageCircle, Send } from "lucide-react"
import { motion } from "framer-motion"
import { logInfo, logError } from "@/lib/logger"
import type { TestSuite, TestRun } from "@/lib/mock-data"

interface Comment {
  id: string
  content: string
  author_id: string
  suite_id?: string
  run_id?: string
  created_at: string
  updated_at: string
}

export default function RunViewPage() {
  const [allTestCases, setAllTestCases] = useState<TestSuite[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [testCases, setTestCases] = useState<TestSuite[]>([])
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [selectedTestCase, setSelectedTestCase] = useState<TestSuite | null>(null)
  const [runs, setRuns] = useState<TestRun[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingTestCases, setLoadingTestCases] = useState(true)
  const [loadingRuns, setLoadingRuns] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [creatingRun, setCreatingRun] = useState(false)
  const [creatingComment, setCreatingComment] = useState(false)
  const [newComment, setNewComment] = useState("")

  // Fetch all test cases (suites) and categories
  useEffect(() => {
    const fetchAllTestCases = async () => {
      setLoadingTestCases(true)
      try {
        const res = await fetch("/api/dashboard/test-cases")
        const result = await res.json()
        logInfo("All Test Cases API response", result)
        if (res.ok && result.testCases) {
          setAllTestCases(result.testCases)
          // Compute unique categories
          const cats = Array.from(new Set(result.testCases.map((tc: any) => tc.category).filter(Boolean)))
          setCategories(["All", ...cats])
        } else {
          logError("Failed to fetch all test cases", result.error)
        }
      } catch (error) {
        logError("Error fetching all test cases", error)
      } finally {
        setLoadingTestCases(false)
      }
    }
    fetchAllTestCases()
  }, [])

  // Filter test cases by selected category
  useEffect(() => {
    if (selectedCategory === "All") {
      setTestCases(allTestCases)
    } else {
      setTestCases(allTestCases.filter(tc => tc.category === selectedCategory))
    }
    setSelectedTests([])
    setSelectedTestCase(null)
    setRuns([])
    setComments([])
  }, [selectedCategory, allTestCases])

  // Fetch runs for selected test case
  useEffect(() => {
    if (!selectedTestCase) return
    const fetchRuns = async () => {
      setLoadingRuns(true)
      try {
        const res = await fetch(`/api/dashboard/runs?suite_id=${selectedTestCase.id}`)
        const result = await res.json()
        logInfo("Runs API response", result)
        if (res.ok && result.runs) {
          setRuns(result.runs)
        } else {
          logError("Failed to fetch runs", result.error)
        }
      } catch (error) {
        logError("Error fetching runs", error)
      } finally {
        setLoadingRuns(false)
      }
    }
    fetchRuns()
  }, [selectedTestCase])

  // Fetch comments for selected test case
  useEffect(() => {
    if (!selectedTestCase) return
    const fetchComments = async () => {
      setLoadingComments(true)
      try {
        const res = await fetch(`/api/dashboard/comments?suite_id=${selectedTestCase.id}`)
        const result = await res.json()
        logInfo("Comments API response", result)
        if (res.ok && result.comments) {
          setComments(result.comments)
        } else {
          logError("Failed to fetch comments", result.error)
        }
      } catch (error) {
        logError("Error fetching comments", error)
      } finally {
        setLoadingComments(false)
      }
    }
    fetchComments()
  }, [selectedTestCase])

  const toggleTest = (testId: string) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    )
    // If only one test is selected, set as selectedTestCase
    const tc = testCases.find(tc => tc.id === testId)
    setSelectedTestCase(tc || null)
  }

  const handleRunTests = async () => {
    if (selectedTests.length === 0) {
      alert("Please select at least one test case to run")
      return
    }

    setCreatingRun(true)
    try {
      // Create a test run for each selected test case
      const runPromises = selectedTests.map(async (testId) => {
        const testCase = testCases.find(tc => tc.id === testId)
        if (!testCase) return null

        const res = await fetch("/api/dashboard/runs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${testCase.name} Run #${Date.now()}`,
            suite_id: testId,
            status: "running",
            started_at: new Date().toISOString(),
          }),
        })
        const result = await res.json()
        if (res.ok && result.run) {
          return result.run
        } else {
          logError("Failed to create test run", result.error)
          return null
        }
      })

      const newRuns = await Promise.all(runPromises)
      const validRuns = newRuns.filter(run => run !== null)
      
      if (validRuns.length > 0) {
        // Refresh the runs list
        if (selectedTestCase) {
          const res = await fetch(`/api/dashboard/runs?suite_id=${selectedTestCase.id}`)
          const result = await res.json()
          if (res.ok && result.runs) {
            setRuns(result.runs)
          }
        }
        alert(`Successfully started ${validRuns.length} test run(s)`)
      }
    } catch (error) {
      logError("Error creating test runs", error)
      alert("Failed to create test runs")
    } finally {
      setCreatingRun(false)
    }
  }

  const handleCreateComment = async () => {
    if (!newComment.trim() || !selectedTestCase) return

    setCreatingComment(true)
    try {
      const res = await fetch("/api/dashboard/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
          suite_id: selectedTestCase.id,
        }),
      })
      const result = await res.json()
      if (res.ok && result.comment) {
        setComments(prev => [result.comment, ...prev])
        setNewComment("")
      } else {
        logError("Failed to create comment", result.error)
      }
    } catch (error) {
      logError("Error creating comment", error)
    } finally {
      setCreatingComment(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Left Sidebar - Categories */}
        <div className="w-64 border-r border-gray-800 p-4 space-y-4">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-black"
              onClick={handleRunTests}
              disabled={creatingRun || selectedTests.length === 0}
            >
              {creatingRun ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {creatingRun ? "Creating Runs..." : "Run Tests"}
            </Button>
          </motion.div>

          <div className="space-y-2">
            {loadingTestCases ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-orange-500 mb-2" />
                <p className="text-gray-400 text-xs">Loading categories...</p>
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCategory === category
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4" />
                    <span className="text-sm">{category}</span>
                  </div>
                  <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                    {category === "All"
                      ? allTestCases.length
                      : allTestCases.filter(tc => tc.category === category).length}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center - Test Cases */}
        <div className="w-80 border-r border-gray-800 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-orange-500">Test Cases</h3>
              {loadingTestCases && (
                <Loader2 className="animate-spin h-4 w-4 text-orange-500" />
              )}
            </div>

            <div className="space-y-2">
              {loadingTestCases ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-orange-500 mb-2" />
                  <p className="text-gray-400 text-xs">Loading test cases...</p>
                </div>
              ) : testCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <FolderOpen className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                  <p className="text-gray-400 text-xs">No test cases found</p>
                </div>
              ) : (
                testCases.map((testCase) => (
                  <motion.div
                    key={testCase.id}
                    whileHover={{ scale: 1.03, backgroundColor: "#262626" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer"
                    style={{ background: selectedTests.includes(testCase.id) ? "#262626" : undefined }}
                    onClick={() => toggleTest(testCase.id)}
                  >
                    <Checkbox
                      checked={selectedTests.includes(testCase.id)}
                      onCheckedChange={() => toggleTest(testCase.id)}
                      className="border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <span className="text-gray-300 text-sm">{testCase.name}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center - Phone Mockup */}
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="relative">
            {/* Phone Frame */}
            <div className="relative w-64 h-[500px] bg-gray-800 rounded-[2.5rem] p-2 shadow-2xl">
              <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="flex justify-between items-center px-6 py-2 text-white text-sm">
                  <span>9:41</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-2 bg-white rounded-sm"></div>
                    <div className="w-6 h-3 border border-white rounded-sm">
                      <div className="w-4 h-full bg-green-500 rounded-sm"></div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <p className="text-gray-500 text-sm">No video available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-gray-800 p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              {selectedTestCase ? selectedTestCase.name : "Select a Test Case"}
            </h3>

            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="history" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                >
                  Comments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="mt-4">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="py-4">
                    {loadingRuns ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="animate-spin h-8 w-8 text-orange-500 mb-2" />
                        <p className="text-gray-400 text-xs">Loading runs...</p>
                      </div>
                    ) : runs.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No test runs found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {runs.map(run => (
                          <div key={run.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                            <div>
                              <p className="text-white text-sm font-medium">{run.name}</p>
                              <p className="text-gray-400 text-xs">Status: {run.status}</p>
                              <p className="text-gray-400 text-xs">Started: {run.started_at ? new Date(run.started_at).toLocaleString() : "-"}</p>
                              <p className="text-gray-400 text-xs">Completed: {run.completed_at ? new Date(run.completed_at).toLocaleString() : "-"}</p>
                            </div>
                            <Badge className={
                              run.status === "completed"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : run.status === "running"
                                ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                : run.status === "failed"
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                            }>{run.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="mt-4">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="py-4">
                    {loadingComments ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="animate-spin h-8 w-8 text-orange-500 mb-2" />
                        <p className="text-gray-400 text-xs">Loading comments...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Comment creation form */}
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white resize-none"
                            rows={3}
                          />
                          <Button
                            onClick={handleCreateComment}
                            disabled={!newComment.trim() || creatingComment}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-black"
                            size="sm"
                          >
                            {creatingComment ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="mr-2 h-4 w-4" />
                            )}
                            {creatingComment ? "Posting..." : "Post Comment"}
                          </Button>
                        </div>

                        {/* Comments list */}
                        {comments.length === 0 ? (
                          <div className="text-center py-8">
                            <MessageCircle className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                            <p className="text-gray-500">No comments yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {comments.map(comment => (
                              <div key={comment.id} className="p-3 bg-gray-800/50 rounded-lg">
                                <p className="text-white text-sm mb-2">{comment.content}</p>
                                <p className="text-gray-400 text-xs">
                                  {new Date(comment.created_at).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
