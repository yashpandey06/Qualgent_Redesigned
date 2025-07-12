"use client"
import { useEffect, useState, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderOpen, FileText, X, Loader2 } from "lucide-react"
import { logInfo, logError } from "@/lib/logger"

export default function TestCasesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    description: "",
    project_id: "",
  })
  const [attachedFiles, setAttachedFiles] = useState([{ name: "resume.pdf", size: "113.32 KB" }])
  const [allTestCases, setAllTestCases] = useState<any[]>([])
  const [testCases, setTestCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [sidebarLoading, setSidebarLoading] = useState(true)

  const fetchAllTestCases = async () => {
    setSidebarLoading(true)
    try {
      const res = await fetch("/api/dashboard/test-cases")
      const result = await res.json()
      logInfo("All Test Cases API response", result)
      if (res.ok && result.testCases) {
        setAllTestCases(result.testCases)
      } else {
        logError("Failed to fetch all test cases", result.error)
      }
    } catch (error) {
      logError("Error fetching all test cases", error)
    } finally {
      setSidebarLoading(false)
    }
  }

  // Fetch test cases from API, optionally filtered by category
  const fetchTestCases = async (category = "All") => {
    setLoading(true)
    try {
      const url = category && category !== "All"
        ? `/api/dashboard/test-cases?category=${encodeURIComponent(category)}`
        : "/api/dashboard/test-cases"
      const res = await fetch(url)
      const result = await res.json()
      logInfo("Test Cases API response", result)
      if (res.ok && result.testCases) {
        setTestCases(result.testCases)
      } else {
        logError("Failed to fetch test cases", result.error)
      }
    } catch (error) {
      logError("Error fetching test cases", error)
    } finally {
      setLoading(false)
    }
  }

  // Compute unique categories from allTestCases (excluding 'All' and empty/null)
  const categories = useMemo(() => {
    const cats = Array.from(new Set(allTestCases.map(tc => tc.category).filter(Boolean)))
    return ["All", ...cats]
  }, [allTestCases])
  // Hardcoded categories for the dropdown
  const categoryOptions = ['Sanity', 'Smoke', 'Regression']

  useEffect(() => {
    fetchAllTestCases()
  }, [])

  useEffect(() => {
    fetchTestCases(selectedCategory)
  }, [selectedCategory])

  // Default category in create form: use selectedCategory if not 'All'
  useEffect(() => {
    if (showCreateForm && selectedCategory !== "All") {
      setFormData(f => ({ ...f, category: selectedCategory }))
    }
  }, [showCreateForm, selectedCategory])

  const removeFile = (fileName: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.name !== fileName))
  }

  const handleCreateTest = async () => {
    setCreating(true)
    try {
      // For demo: use the first project_id if not set
      let project_id = formData.project_id
      if (!project_id && allTestCases.length > 0) {
        project_id = allTestCases[0].project_id
      }
      const res = await fetch("/api/dashboard/test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          project_id,
          category: formData.category || selectedCategory !== "All" ? selectedCategory : undefined,
        }),
      })
      const result = await res.json()
      if (res.ok && result.testCase) {
        setShowCreateForm(false)
        setFormData({ category: "", name: "", description: "", project_id: "" })
        fetchAllTestCases()
        fetchTestCases(selectedCategory)
      } else {
        logError("Failed to create test case", result.error)
      }
    } catch (error) {
      logError("Error creating test case", error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Left Sidebar - Categories */}
        <div className="w-64 border-r border-gray-800 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Test Categories</h3>
          </div>
          <div className="space-y-1">
            {sidebarLoading ? (
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

        {/* Center - Test Cases List */}
        <div className="flex-1 p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
              <Loader2 className="animate-spin h-12 w-12 text-orange-500 mb-4" />
              <p className="text-gray-400">Loading test cases...</p>
            </div>
          ) : testCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
              <FolderOpen className="mx-auto h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No test cases found. Create one!</h3>
              <Button onClick={() => setShowCreateForm(true)} className="bg-orange-500 hover:bg-orange-600 text-black">
                <Plus className="mr-2 h-4 w-4" />
                Create New Test Case
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {testCases.map((testCase) => (
                <div
                  key={testCase.id}
                  className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-orange-500/50 transition-colors cursor-pointer text-gray-300 text-base shadow-sm"
                >
                  <div className="font-semibold text-white mb-1">{testCase.name}</div>
                  <div className="text-gray-400 text-sm mb-1">{testCase.description}</div>
                  <div className="text-xs text-gray-500">Created: {new Date(testCase.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Create Form */}
        <div className="flex-1 p-6">
          {showCreateForm ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Create new test case</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-orange-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="hey">Hey</SelectItem>
                      <SelectItem value="yyy">yyy</SelectItem>
                      <SelectItem value="new">new</SelectItem>
                      <SelectItem value="saket">SaketTest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                    placeholder="Enter test name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 min-h-[120px]"
                    placeholder="Enter a description for this test case"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">File Attachments</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                    >
                      <Plus className="mr-1 h-3 w-3 text-orange-500" />
                    </Button>
                  </div>

                  {attachedFiles.length > 0 && (
                    <div className="space-y-2">
                      {attachedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-orange-500" />
                            <span className="text-gray-300 text-sm">{file.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 text-xs">{file.size}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFile(file.name)}
                              className="text-gray-400 hover:text-red-400 p-1"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleCreateTest} className="w-full bg-orange-500 hover:bg-orange-600 text-black py-3" disabled={creating}>
                  {creating ? "Creating..." : "Create Test"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FolderOpen className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">Select a test case or create a new one</h3>
                <Button onClick={() => setShowCreateForm(true)} className="bg-orange-500 hover:bg-orange-600 text-black">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Test Case
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
