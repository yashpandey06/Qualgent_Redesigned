"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Play, Smartphone, FolderOpen } from "lucide-react"
import { motion } from "framer-motion"

export default function RunViewPage() {
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState("Test Entire Functionality")

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

  const toggleTest = (testId: string) => {
    setSelectedTests((prev) => (prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]))
  }

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Left Sidebar - Categories */}
        <div className="w-64 border-r border-gray-800 p-4 space-y-4">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-black">
              <Play className="mr-2 h-4 w-4" />
              Run Tests
            </Button>
          </motion.div>

          <div className="space-y-2">
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

        {/* Center - Test Cases */}
        <div className="w-80 border-r border-gray-800 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-orange-500">Test Cases</h3>
              <div className="w-4 h-4 bg-gray-600 rounded flex items-center justify-center">
                <span className="text-xs text-white">▼</span>
              </div>
            </div>

            <div className="space-y-2">
              {testCases.map((testCase) => (
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
              ))}
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
            <h3 className="text-lg font-semibold text-white">Test Entire Functionality</h3>

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
                  <CardContent className="py-12">
                    <div className="text-center">
                      <p className="text-gray-500">No test runs found</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="mt-4">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <p className="text-gray-500">No comments yet</p>
                    </div>
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
