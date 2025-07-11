"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderOpen, FileText, X } from "lucide-react"

export default function TestCasesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    description: "",
  })
  const [attachedFiles, setAttachedFiles] = useState([{ name: "resume.pdf", size: "113.32 KB" }])

  const categories = [
    { id: "all", name: "All", count: 0 },
    { id: "hey", name: "Hey", count: 0 },
    { id: "yyy", name: "yyy", count: 0 },
    { id: "new", name: "new", count: 0 },
    { id: "saket", name: "SaketTest", count: 1 },
  ]

  const testCases = [
    { id: "aa", name: "aa" },
    { id: "ronz", name: "Ronz" },
    { id: "test-entire", name: "Test Entire Functionality" },
  ]

  const removeFile = (fileName: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.name !== fileName))
  }

  const handleCreateTest = () => {
    // Handle test creation
    console.log("Creating test:", formData)
    setShowCreateForm(false)
    setFormData({ category: "", name: "", description: "" })
  }

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Left Sidebar - Categories */}
        <div className="w-64 border-r border-gray-800 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Test Categories</h3>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-black text-xs">
              <Plus className="mr-1 h-3 w-3" />
              New
            </Button>
          </div>

          <div className="space-y-1">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCategory === category.name
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-sm">{category.name}</span>
                </div>
                <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                  {category.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Test Cases List */}
        <div className="w-80 border-r border-gray-800 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-orange-500">Test Cases Repository</h3>
            </div>
            <p className="text-gray-400 text-sm">Manage your test cases and folders</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-white">All</h4>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-black"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  New
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Test Cases</span>
                  <div className="w-4 h-4 bg-gray-600 rounded flex items-center justify-center">
                    <span className="text-xs text-white">▼</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {testCases.map((testCase) => (
                    <div
                      key={testCase.id}
                      className="p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer text-gray-300 text-sm"
                    >
                      {testCase.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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

                <Button onClick={handleCreateTest} className="w-full bg-orange-500 hover:bg-orange-600 text-black py-3">
                  Create Test
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
