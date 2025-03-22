"use client"

import React, { useState, useEffect } from "react"
import TopNavbar from "./top-navbar"
import SpreadsheetGrid from "./spreadsheet-grid"
import AIChatPanel from "./ai-chat-panel"

export default function SpreadsheetUI() {
  const [mounted, setMounted] = useState(false)
  const [fileName, setFileName] = useState("Untitled Spreadsheet")
  const [fileData, setFileData] = useState<any>(null)

  // Mock data for initial spreadsheet
  const initialData = {
    columns: 10,
    rows: 20,
    cells: {},
  }

  const [spreadsheetData, setSpreadsheetData] = useState(initialData)

  // Handle file uploads
  const handleFileUpload = (file: File) => {
    // In a real app, we would parse the Excel/Numbers file here
    // For this demo, we'll just update the file name
    setFileName(file.name)
    console.log(`File uploaded: ${file.name}`)
  }

  // Ensure theme component works properly with SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col h-screen">
      <TopNavbar fileName={fileName} setFileName={setFileName} onFileUpload={handleFileUpload} />

      <div className="flex flex-1 overflow-hidden">
        {/* Spreadsheet Grid (left 3/4) */}
        <div className="w-3/4 h-full overflow-auto border-r border-border">
          <SpreadsheetGrid data={spreadsheetData} setData={setSpreadsheetData} />
        </div>

        {/* AI Chat Panel (right 1/4) */}
        <div className="w-1/4 h-full flex flex-col bg-muted/30">
          <AIChatPanel />
        </div>
      </div>
    </div>
  )
} 