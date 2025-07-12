"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { mockApi, type Project, type TestRun } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, CheckCircle, Clock, Play, Plus, Smartphone, TrendingUp, Users, Zap, TestTube } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AiChat } from "@/components/ai-chat"
import { logInfo, logError } from "@/lib/logger"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [recentRuns, setRecentRuns] = useState<TestRun[]>([])
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalRuns: 0,
    completedRuns: 0,
    runningRuns: 0,
  })
  const [dashboardLoading, setDashboardLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, loading, router])

  const fetchDashboardData = async () => {
    setDashboardLoading(true)
    try {
      // Fetch projects and stats in parallel
      const [projectsRes, statsRes] = await Promise.all([
        fetch("/api/dashboard/projects"),
        fetch("/api/dashboard/stats"),
      ])
      const projectsResult = await projectsRes.json()
      const statsResult = await statsRes.json()
      logInfo("Projects API response", projectsResult)
      logInfo("Stats API response", statsResult)

      if (projectsRes.ok && projectsResult.projects) {
        setProjects(projectsResult.projects)
      } else {
        logError("Failed to fetch projects", projectsResult.error)
      }
      if (statsRes.ok) {
        setStats(statsResult)
      } else {
        logError("Failed to fetch stats", statsResult.error)
      }

      const { data: runsData } = await mockApi.getTestRuns()
      if (runsData) {
        setRecentRuns(runsData)
      }
    } catch (error) {
      logError("Error fetching dashboard data", error)
    } finally {
      setDashboardLoading(false)
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

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back! Here's what's happening with your tests.</p>
          </div>
          <Link href="/dashboard/test-cases">
            <Button className="bg-orange-500 hover:bg-orange-600 text-black font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              New Test Case
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Projects</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalProjects}</div>
              <p className="text-xs text-gray-500 mt-1">Active testing projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Test Runs</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalRuns}</div>
              <p className="text-xs text-gray-500 mt-1">Total executions</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.completedRuns}</div>
              <p className="text-xs text-gray-500 mt-1">Successful runs</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Running</CardTitle>
              <Zap className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.runningRuns}</div>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Chat Interface */}
          <div className="lg:col-span-2">
            <div className="h-[600px]">
              <AiChat />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Projects</CardTitle>
              <CardDescription className="text-gray-400">Your latest testing projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-white font-medium">{project.name}</p>
                      <p className="text-gray-400 text-sm truncate">{project.description}</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No projects yet</p>
                  <Button
                    variant="outline"
                    className="mt-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black bg-transparent"
                  >
                    Create Your First Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Test Runs</CardTitle>
              <CardDescription className="text-gray-400">Latest test executions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentRuns.length > 0 ? (
                recentRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {run.status === "running" ? (
                        <Play className="h-4 w-4 text-orange-500" />
                      ) : run.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-500" />
                      )}
                      <div>
                        <p className="text-white text-sm font-medium">{run.name}</p>
                        <p className="text-gray-400 text-xs">Mobile Banking App</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(run.status)}>{run.status}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No test runs yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
