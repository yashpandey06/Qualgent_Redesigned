"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { supabase, type TestSuite, type TestRun } from "@/lib/supabase"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { ArrowLeft, Plus, Calendar, MoreHorizontal, Trash2, Eye, Play, CheckCircle, Clock, XCircle } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SuitePageProps {
  params: {
    id: string
  }
}

export default function SuitePage({ params }: SuitePageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [suite, setSuite] = useState<TestSuite | null>(null)
  const [testRuns, setTestRuns] = useState<TestRun[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchSuiteData()
    }
  }, [user, loading, router, params.id])

  const fetchSuiteData = async () => {
    try {
      // Fetch suite with project info
      const { data: suiteData, error: suiteError } = await supabase
        .from("test_suites")
        .select(`
          *,
          projects (
            id,
            name
          )
        `)
        .eq("id", params.id)
        .single()

      if (suiteError) throw suiteError
      setSuite(suiteData as any)

      // Fetch test runs
      const { data: runsData, error: runsError } = await supabase
        .from("test_runs")
        .select("*")
        .eq("suite_id", params.id)
        .order("created_at", { ascending: false })

      if (runsError) throw runsError
      setTestRuns(runsData || [])
    } catch (error) {
      console.error("Error fetching suite data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch suite data",
        variant: "destructive",
      })
    }
  }

  const handleCreateRun = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !suite) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("test_runs")
        .insert({
          name: formData.name,
          suite_id: suite.id,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error

      setTestRuns([data, ...testRuns])
      setIsCreateDialogOpen(false)
      setFormData({ name: "" })
      toast({
        title: "Success",
        description: "Test run created successfully",
      })
    } catch (error) {
      console.error("Error creating test run:", error)
      toast({
        title: "Error",
        description: "Failed to create test run",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRun = async (runId: string) => {
    try {
      const { error } = await supabase.from("test_runs").delete().eq("id", runId)

      if (error) throw error

      setTestRuns(testRuns.filter((r) => r.id !== runId))
      toast({
        title: "Success",
        description: "Test run deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting test run:", error)
      toast({
        title: "Error",
        description: "Failed to delete test run",
        variant: "destructive",
      })
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

  if (!suite) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white mb-2">Test suite not found</h3>
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
            <Link href={`/projects/${(suite as any).projects?.id}`}>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {(suite as any).projects?.name}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{suite.name}</h1>
              <p className="text-gray-400 mt-1">{suite.description || "No description provided"}</p>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-black font-semibold">
                <Plus className="mr-2 h-4 w-4" />
                New Test Run
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Test Run</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a new test run to execute your test steps.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRun}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">
                      Run Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Enter run name"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                  >
                    {isSubmitting ? "Creating..." : "Create Run"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Test Runs Grid */}
        {testRuns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testRuns.map((run) => (
              <Card
                key={run.id}
                className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-all duration-200 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(run.status)}
                      <CardTitle className="text-white text-lg">{run.name}</CardTitle>
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
                          <Link href={`/runs/${run.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Steps
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => handleDeleteRun(run.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge className={getStatusColor(run.status)}>{run.status}</Badge>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(run.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-400">
                    {run.started_at && <div>Started: {new Date(run.started_at).toLocaleString()}</div>}
                    {run.completed_at && <div>Completed: {new Date(run.completed_at).toLocaleString()}</div>}
                  </div>
                  <Link href={`/runs/${run.id}`}>
                    <Button className="w-full mt-4 bg-gray-800 hover:bg-orange-500 hover:text-black transition-colors">
                      View Test Steps
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Play className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No test runs yet</h3>
            <p className="text-gray-400 mb-6">Create your first test run to start testing</p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Test Run
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
