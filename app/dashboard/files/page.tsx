"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Smartphone } from "lucide-react"
import { motion } from "framer-motion"

export default function FilesPage() {
  const [appName, setAppName] = useState("")
  const [version, setVersion] = useState("")

  // Dummy data for test files
  const testFiles = [
    {
      id: 1,
      type: "PDF",
      name: "resume.pdf",
      size: "113.32 KB",
      uploaded: "Jul 10, 2025, 02:09 PM",
    },
    {
      id: 2,
      type: "PDF",
      name: "Rahul_Panchal-Resume.pdf",
      size: "223.98 KB",
      uploaded: "Jul 10, 2025, 06:13 AM",
    },
    {
      id: 3,
      type: "PDF",
      name: "OmSinghan_CoverLetter.pdf",
      size: "41.49 KB",
      uploaded: "Jul 10, 2025, 05:16 AM",
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* App Files Section */}
        <div className="flex-1 p-6 border-r border-gray-800">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">App Files</h2>
              <p className="text-gray-400">Upload app files here (iOS: .ipa, .app, Android: .apk, .aab)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-name" className="text-gray-300">
                  App Name
                </Label>
                <Input
                  id="app-name"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                  placeholder="Enter app name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version" className="text-gray-300">
                  Version (e.g. 1.0.0)
                </Label>
                <Input
                  id="version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-orange-500"
                  placeholder="Enter version"
                />
              </div>
            </div>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-800/50">
                      <TableHead className="text-gray-300">App Name</TableHead>
                      <TableHead className="text-gray-300">Version</TableHead>
                      <TableHead className="text-gray-300">OS</TableHead>
                      <TableHead className="text-gray-300">Filename</TableHead>
                      <TableHead className="text-gray-300">Size</TableHead>
                      <TableHead className="text-gray-300">Uploaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-gray-800">
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        <Smartphone className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                        <p>No files uploaded yet</p>
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                          <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-black">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload App File
                          </Button>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Files Section */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Test Files</h2>
                <p className="text-gray-400">Files to be used in tests (credentials csv, PDF, etc.)</p>
              </div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                <Button className="bg-orange-500 hover:bg-orange-600 text-black">Select Files</Button>
              </motion.div>
            </div>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-gray-800/50">
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Size</TableHead>
                      <TableHead className="text-gray-300">Uploaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testFiles.map((file) => (
                      <motion.tr
                        key={file.id}
                        whileHover={{ scale: 1.01, backgroundColor: "#262626" }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="border-gray-800 hover:bg-gray-800/50"
                        style={{ cursor: "pointer" }}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-orange-500" />
                            <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                              {file.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-orange-400 hover:text-orange-300 cursor-pointer">{file.name}</TableCell>
                        <TableCell className="text-gray-300">{file.size}</TableCell>
                        <TableCell className="text-gray-400">{file.uploaded}</TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
