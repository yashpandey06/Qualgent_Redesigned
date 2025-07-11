"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { supabase, type Project, type TestSuite } from "@/lib/supabase"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Calendar, MoreHorizontal, Edit, Trash2, Eye, TestTube2 } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSuite, setEditingSuite] = useState<TestSuite | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchProjectData()
    }
  }, [user, loading, router, params.id])

  const fetchProjectData = async () => {
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .single()

      if (projectError) throw projectError
      setProject(projectData)

      // Fetch test suites
      const { data: suitesData, error: suitesError } = await supabase
        .from("test_suites")
        .select("*")
        .eq("project_id", params.id)
        .order("created_at", { ascending: false })

      if (suitesError) throw suitesError
      setTestSuites(suitesData || [])
    } catch (error) {
      console.error("Error fetching project data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch project data",
        variant: "destructive",
      })
    }
  }

  const handleCreateSuite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !project) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("test_suites")
        .insert({
          name: formData.name,
          description: formData.description,
          project_id: project.id,
        })
        .select()
        .single()

      if (error) throw error

      setTestSuites([data, ...testSuites])
      setIsCreateDialogOpen(false)
      setFormData({ name: "", description: "" })
      toast({
        title: "Success",
        description: "Test suite created successfully",
      })
    } catch (error) {
      console.error("Error creating test suite:", error)
      toast({
        title: "Error",
        description: "Failed to create test suite",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSuite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSuite) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("test_suites")
        .update({
          name: formData.name,
          description: formData.description,
        })
        .eq("id", editingSuite.id)
        .select()
        .single()

      if (error) throw error

      setTestSuites(testSuites.map((s) => (s.id === editingSuite.id ? data : s)))
      setIsEditDialogOpen(false)
      setEditingSuite(null)
      setFormData({ name: "", description: "" })
      toast({
        title: "Success",
        description: "Test suite updated successfully",
      })
    } catch (error) {
      console.error("Error updating test suite:", error)
      toast({
        title: "Error",
        description: "Failed to update test suite",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSuite = async (suiteId: string) => {
    try {
      const { error } = await supabase.from("test_suites").delete().eq("id", suiteId)

      if (error) throw error

      setTestSuites(testSuites.filter((s) => s.id !== suiteId))
      toast({
        title: "Success",
        description: "Test suite deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting test suite:", error)
      toast({
        title: "Error",
        description: "Failed to delete test suite",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (suite: TestSuite) => {
    setEditingSuite(suite)
    setFormData({
      name: suite.name,
      description: suite.description || "",
    })
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white mb-2">Project not found</h3>
          <Link href="/projects">
            <Button
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black bg-transparent"
            >
              Back to Projects
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              <p className="text-gray-400 mt-1">{project.description || "No description provided"}</p>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-black font-semibold">
                <Plus className="mr-2 h-4 w-4" />
                New Test Suite
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Test Suite</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a new test suite to organize your test runs.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSuite}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">
                      Suite Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Enter suite name"
                      required
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
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Enter suite description"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                  >
                    {isSubmitting ? "Creating..." : "Create Suite"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Test Suites Grid */}
        {testSuites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testSuites.map((suite) => (
              <Card
                key={suite.id}
                className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-all duration-200 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <TestTube2 className="h-5 w-5 text-orange-500" />
                      <CardTitle className="text-white text-lg">{suite.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-800" align="end">
                        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800" asChild>
                          <Link href={`/suites/${suite.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-gray-300 hover:text-white hover:bg-gray-800"
                          onClick={() => openEditDialog(suite)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => handleDeleteSuite(suite.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="text-gray-400 line-clamp-2">
                    {suite.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(suite.created_at).toLocaleDateString()}</span>
                    </div>
                    <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                      Active
                    </Badge>
                  </div>
                  <Link href={`/suites/${suite.id}`}>
                    <Button className="w-full mt-4 bg-gray-800 hover:bg-orange-500 hover:text-black transition-colors">
                      View Test Runs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TestTube2 className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No test suites yet</h3>
            <p className="text-gray-400 mb-6">Create your first test suite to start organizing your tests</p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Test Suite
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Test Suite</DialogTitle>
              <DialogDescription className="text-gray-400">Update your test suite details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSuite}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-gray-300">
                    Suite Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter suite name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter suite description"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                >
                  {isSubmitting ? "Updating..." : "Update Suite"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
