"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { TicketIcon as Queue, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"

export default function QueuePage() {
  const [filters, setFilters] = useState({
    versions: "All Versions",
    priorities: "All Priorities",
    statuses: "All Statuses",
    results: "All Results",
    categories: "All Categories",
  })

  const resetFilters = () => {
    setFilters({
      versions: "All Versions",
      priorities: "All Priorities",
      statuses: "All Statuses",
      results: "All Results",
      categories: "All Categories",
    })
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-orange-500 mb-2">Test Run Queue</h1>
          <p className="text-gray-400">Monitor and manage your test runs</p>
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
              <SelectItem value="v1.0">v1.0</SelectItem>
              <SelectItem value="v2.0">v2.0</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priorities} onValueChange={(value) => setFilters({ ...filters, priorities: value })}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="All Priorities">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.statuses} onValueChange={(value) => setFilters({ ...filters, statuses: value })}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="All Statuses">All Statuses</SelectItem>
              <SelectItem value="Running">Running</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.results} onValueChange={(value) => setFilters({ ...filters, results: value })}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="All Results">All Results</SelectItem>
              <SelectItem value="Passed">Passed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.categories} onValueChange={(value) => setFilters({ ...filters, categories: value })}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="All Categories">All Categories</SelectItem>
              <SelectItem value="Smoke">Smoke</SelectItem>
              <SelectItem value="Regression">Regression</SelectItem>
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

        {/* Empty State */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="py-24">
            <div className="text-center">
              <Queue className="mx-auto h-16 w-16 text-gray-600 mb-6" />
              <h3 className="text-xl font-medium text-gray-400 mb-2">No test runs found</h3>
              <p className="text-gray-500">Test runs will appear here when they are queued or running</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
