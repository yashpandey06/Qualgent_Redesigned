"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { supabase, type TestRun, type TestStep } from "@/lib/supabase"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Plus,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  ImageIcon,
  Video,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface RunPageProps {
  params: {
    id: string
  }
}

export default function RunPage({ params }: RunPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [run, setRun] = useState<TestRun | null>(null)
  const [testSteps, setTestSteps] = useState<TestStep[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<TestStep | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    step_type: "video" as "video" | "image" | "text",
    media_url: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchRunData()
    }
  }, [user, loading, router, params.id])

  const fetchRunData = async () => {
    try {
      // Fetch run with suite and project info
      const { data: runData, error: runError } = await supabase
        .from("test_runs")
        .select(`
          *,
          test_suites (
            id,
            name,
            projects (
              id,
              name
            )
          )
        `)
        .eq("id", params.id)
        .single()

      if (runError) throw runError
      setRun(runData as any)

      // Fetch test steps
      const { data: stepsData, error: stepsError } = await supabase
        .from("test_steps")
        .select("*")
        .eq("run_id", params.id)
        .order("step_order", { ascending: true })

      if (stepsError) throw stepsError
      setTestSteps(stepsData || [])
    } catch (error) {
      console.error("Error fetching run data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch run data",
        variant: "destructive",
      })
    }
  }

  const handleCreateStep = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !run) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("test_steps")
        .insert({
          name: formData.name,
          description: formData.description,
          step_type: formData.step_type,
          media_url: formData.media_url || null,
          run_id: run.id,
          step_order: testSteps.length + 1,
        })
        .select()
        .single()

      if (error) throw error

      setTestSteps([...testSteps, data])
      setIsCreateDialogOpen(false)
      setFormData({ name: "", description: "", step_type: "video", media_url: "" })
      toast({
        title: "Success",
        description: "Test step created successfully",
      })
    } catch (error) {
      console.error("Error creating test step:", error)
      toast({
        title: "Error",
        description: "Failed to create test step",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditStep = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStep) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("test_steps")
        .update({
          name: formData.name,
          description: formData.description,
          step_type: formData.step_type,
          media_url: formData.media_url || null,
        })
        .eq("id", editingStep.id)
        .select()
        .single()

      if (error) throw error

      setTestSteps(testSteps.map((s) => (s.id === editingStep.id ? data : s)))
      setIsEditDialogOpen(false)
      setEditingStep(null)
      setFormData({ name: "", description: "", step_type: "video", media_url: "" })
      toast({
        title: "Success",
        description: "Test step updated successfully",
      })
    } catch (error) {
      console.error("Error updating test step:", error)
      toast({
        title: "Error",
        description: "Failed to update test step",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    try {
      const { error } = await supabase.from("test_steps").delete().eq("id", stepId)

      if (error) throw error

      setTestSteps(testSteps.filter((s) => s.id !== stepId))
      toast({
        title: "Success",
        description: "Test step deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting test step:", error)
      toast({
        title: "Error",
        description: "Failed to delete test step",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (step: TestStep) => {
    setEditingStep(step)
    setFormData({
      name: step.name,
      description: step.description || "",
      step_type: step.step_type,
      media_url: step.media_url || "",
    })
    setIsEditDialogOpen(true)
  }

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case "video":
        return <Video className="h-5 w-5 text-orange-500" />
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "running":
        return <Play className="h-4 w-4 text-orange-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "running":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!run) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white mb-2">Test run not found</h3>
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
            <Link href={`/suites/${(run as any).test_suites?.id}`}>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {(run as any).test_suites?.name}
              </Button>
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-white">{run.name}</h1>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(run.status)}
                  <Badge className={getStatusColor(run.status)}>{run.status}</Badge>
                </div>
              </div>
              <p className="text-gray-400 mt-1">
                {(run as any).test_suites?.projects?.name} → {(run as any).test_suites?.name}
              </p>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-black font-semibold">
                <Plus className="mr-2 h-4 w-4" />
                Add Test Step
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Test Step</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add a new step to your test run with media content.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateStep}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">
                      Step Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Enter step name"
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
                      placeholder="Enter step description"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="step_type" className="text-gray-300">
                      Step Type
                    </Label>
                    <Select
                      value={formData.step_type}
                      onValueChange={(value: "video" | "image" | "text") =>
                        setFormData({ ...formData, step_type: value })
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select step type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="media_url" className="text-gray-300">
                      Media URL (Optional)
                    </Label>
                    <Input
                      id="media_url"
                      value={formData.media_url}
                      onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Enter media URL (leave blank for placeholder)"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                  >
                    {isSubmitting ? "Adding..." : "Add Step"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Test Steps */}
        {testSteps.length > 0 ? (
          <div className="space-y-6">
            {testSteps.map((step, index) => (
              <Card
                key={step.id}
                className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      {getStepIcon(step.step_type)}
                      <div>
                        <CardTitle className="text-white text-lg">{step.name}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {step.description || "No description provided"}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-800" align="end">
                        <DropdownMenuItem
                          className="text-gray-300 hover:text-white hover:bg-gray-800"
                          onClick={() => openEditDialog(step)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => handleDeleteStep(step.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Media Content */}
                    <div className="bg-gray-800/50 rounded-lg p-6 border-2 border-dashed border-gray-700">
                      {step.step_type === "video" ? (
                        <div className="text-center">
                          <Video className="mx-auto h-16 w-16 text-gray-500 mb-4" />
                          <p className="text-gray-400 mb-2">Video Content Placeholder</p>
                          <p className="text-sm text-gray-500">
                            {step.media_url ? `URL: ${step.media_url}` : "No media URL provided"}
                          </p>
                        </div>
                      ) : step.step_type === "image" ? (
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-16 w-16 text-gray-500 mb-4" />
                          <p className="text-gray-400 mb-2">Image Content Placeholder</p>
                          <p className="text-sm text-gray-500">
                            {step.media_url ? `URL: ${step.media_url}` : "No media URL provided"}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FileText className="mx-auto h-16 w-16 text-gray-500 mb-4" />
                          <p className="text-gray-400 mb-2">Text Content</p>
                          <p className="text-sm text-gray-500">{step.description || "No content provided"}</p>
                        </div>
                      )}
                    </div>

                    {/* Step Metadata */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Step {step.step_order}</span>
                        <span>Type: {step.step_type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(step.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Play className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No test steps yet</h3>
            <p className="text-gray-400 mb-6">Add your first test step to start building your test scenario</p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Test Step
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Test Step</DialogTitle>
              <DialogDescription className="text-gray-400">Update your test step details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditStep}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-gray-300">
                    Step Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter step name"
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
                    placeholder="Enter step description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-step_type" className="text-gray-300">
                    Step Type
                  </Label>
                  <Select
                    value={formData.step_type}
                    onValueChange={(value: "video" | "image" | "text") =>
                      setFormData({ ...formData, step_type: value })
                    }
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select step type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-media_url" className="text-gray-300">
                    Media URL (Optional)
                  </Label>
                  <Input
                    id="edit-media_url"
                    value={formData.media_url}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter media URL (leave blank for placeholder)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                >
                  {isSubmitting ? "Updating..." : "Update Step"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
