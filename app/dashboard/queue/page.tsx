"use client"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TicketIcon as Queue, RotateCcw, Loader2, Play, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { logInfo, logError } from "@/lib/logger"

interface TestRun {
  id: string
  name: string
  status: string
  result?: string
  started_at?: string
  completed_at?: string
  created_at: string
  duration_seconds?: number
  test_suites: {
    id: string
    name: string
    category: string
    projects: {
      id: string
      name: string
    }
  }
}

interface FilterOptions {
  statuses: string[]
  results: string[]
  categories: string[]
  priorities: string[]
  versions: string[]
}

export default function QueuePage() {
  const [filters, setFilters] = useState({
    versions: "All Versions",
    priorities: "All Priorities",
    statuses: "All Statuses",
    results: "All Results",
    categories: "All Categories",
  })
  const [runs, setRuns] = useState<TestRun[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    statuses: [],
    results: [],
    categories: [],
    priorities: [],
    versions: []
  })
  const [stats, setStats] = useState({
    running: 0,
    completed: 0,
    failed: 0,
    pending: 0
  })
  const [loading, setLoading] = useState(true)
  const [totalRuns, setTotalRuns] = useState(0)

  const fetchQueueData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.statuses !== "All Statuses") params.append('status', filters.statuses)
      if (filters.results !== "All Results") params.append('result', filters.results)
      if (filters.categories !== "All Categories") params.append('category', filters.categories)
      if (filters.priorities !== "All Priorities") params.append('priority', filters.priorities)
      if (filters.versions !== "All Versions") params.append('version', filters.versions)

      const url = `/api/dashboard/queue${params.toString() ? `?${params.toString()}` : ''}`
      const res = await fetch(url)
      const result = await res.json()
      logInfo("Queue API response", result)

      if (res.ok) {
        setRuns(result.runs || [])
        setFilterOptions(result.filterOptions || {
          statuses: [],
          results: [],
          categories: [],
          priorities: [],
          versions: []
        })
        setStats(result.stats || { running: 0, completed: 0, failed: 0, pending: 0 })
        setTotalRuns(result.totalRuns || 0)
      } else {
        logError("Failed to fetch queue data", result.error)
      }
    } catch (error) {
      logError("Error fetching queue data", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueueData()
  }, [filters])

  const resetFilters = () => {
    setFilters({
      versions: "All Versions",
      priorities: "All Priorities",
      statuses: "All Statuses",
      results: "All Results",
      categories: "All Categories",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-orange-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getResultColor = (result?: string) => {
    switch (result) {
      case 'passed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'skipped':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-orange-500 mb-2">Test Run Queue</h1>
          <p className="text-gray-400">Monitor and manage your test runs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Runs</p>
                  <p className="text-2xl font-bold text-white">{totalRuns}</p>
                </div>
                <Queue className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Running</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.running}</p>
                </div>
                <Play className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 font-medium">Test Runs</span>
            <div className="w-4 h-4 bg-gray-600 rounded flex items-center justify-center">
              <span className="text-xs text-white">▼</span>
            </div>
          </div>

          <Select value={filters.versions} onValueChange={(value) => setFilters({ ...filters, versions: value })}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="All Versions">All Versions</SelectItem>
              {filterOptions.versions.map(version => (
                <SelectItem key={version} value={version}>{version}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.priorities} onValueChange={(value) => setFilters({ ...filters, priorities: value })}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="All Priorities">All Priorities</SelectItem>
              {filterOptions.priorities.map(priority => (
                <SelectItem key={priority} value={priority}>{priority}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.statuses} onValueChange={(value) => setFilters({ ...filters, statuses: value })}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="All Statuses">All Statuses</SelectItem>
              {filterOptions.statuses.map(status => (
                <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.results} onValueChange={(value) => setFilters({ ...filters, results: value })}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="All Results">All Results</SelectItem>
              {filterOptions.results.map(result => (
                <SelectItem key={result} value={result}>{result.charAt(0).toUpperCase() + result.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.categories} onValueChange={(value) => setFilters({ ...filters, categories: value })}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="All Categories">All Categories</SelectItem>
              {filterOptions.categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="border-gray-700 text-orange-400 hover:bg-gray-800 hover:text-orange-500 bg-transparent"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </motion.div>
        </div>

        {/* Test Runs List */}
        {loading ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="py-24">
              <div className="text-center">
                <Loader2 className="mx-auto h-16 w-16 text-orange-500 animate-spin mb-6" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">Loading test runs...</h3>
                <p className="text-gray-500">Fetching your test run data</p>
              </div>
            </CardContent>
          </Card>
        ) : runs.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="py-24">
              <div className="text-center">
                <Queue className="mx-auto h-16 w-16 text-gray-600 mb-6" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">No test runs found</h3>
                <p className="text-gray-500">Test runs will appear here when they are queued or running</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {runs.map((run) => (
              <motion.div
                key={run.id}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Card className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(run.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-white">{run.name}</h3>
                          <p className="text-gray-400 text-sm">
                            {run.test_suites.projects.name} • {run.test_suites.name} • {run.test_suites.category}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Started: {run.started_at ? new Date(run.started_at).toLocaleString() : 'Not started'}</span>
                            {run.completed_at && (
                              <span>Completed: {new Date(run.completed_at).toLocaleString()}</span>
                            )}
                            {run.duration_seconds && (
                              <span>Duration: {formatDuration(run.duration_seconds)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(run.status)}>
                          {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                        </Badge>
                        {run.result && (
                          <Badge className={getResultColor(run.result)}>
                            {run.result.charAt(0).toUpperCase() + run.result.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
