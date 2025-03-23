"use client"

import React, { useState, useEffect } from "react"
import TopNavbar from "./top-navbar"
import AIChatPanel from "./ai-chat-panel"
import SpreadsheetComponent from "./SpreadsheetComponent"
import KeyboardShortcutsHandler from "./KeyboardShortcutsHandler"
import { Download } from "lucide-react"
import { Button } from "./ui/button"

// Define format functions interface
interface FormatFunctions {
  toggleBold: () => void
  toggleItalic: () => void
  setTextAlign: (alignment: 'left' | 'center' | 'right') => void
  toggleWrapText: () => void
}

// Define spreadsheet data interface
interface SpreadsheetData {
  rows: number
  columns: number
  cells: Record<string, CellData>
  headers: string[]
}

interface CellData {
  value: string
  isBold?: boolean
  isItalic?: boolean
  textAlign?: 'left' | 'center' | 'right'
  wrapText?: boolean
}

interface SheetTab {
  id: string
  name: string
  data: SpreadsheetData
}

interface SheetsData {
  sheets: SheetTab[]
  activeSheetId: string
}

export default function SpreadsheetUI() {
  const [mounted, setMounted] = useState(false)
  const [fileName, setFileName] = useState("Untitled Spreadsheet")
  const [fileData, setFileData] = useState<SheetsData | null>(null)
  const [exportFn, setExportFn] = useState<(() => void) | null>(null)
  const [formatFunctions, setFormatFunctions] = useState<FormatFunctions | null>(null)
  const [selectedRange, setSelectedRange] = useState<string | null>(null)

  // Handle file uploads via top navbar
  const handleFileUpload = (file: File) => {
    setFileName(file.name)
  }

  // Handle data updates from the spreadsheet component
  const handleDataUpdate = (data: SheetsData) => {
    setFileData(data)
  }

  // Handle receiving export function from SpreadsheetComponent
  const handleExportFunction = (exportFunction: () => void) => {
    setExportFn(() => exportFunction)
  }
  
  // Handle receiving formatting functions from SpreadsheetComponent
  const handleFormatFunctions = (functions: FormatFunctions) => {
    setFormatFunctions(functions)
  }

  // Handle cell selection from SpreadsheetComponent
  const handleCellSelection = (range: string) => {
    console.log(`Selected range: ${range}`)
    // Only update the selected range, don't auto-analyze or trigger AI responses
    setSelectedRange(range)
    
    // The AI component will handle this selection only if it's already focused
    // This prevents auto-triggering of analysis or assistance
  }

  // Ensure theme component works properly with SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col h-screen spreadsheet-ui">
      <KeyboardShortcutsHandler />
      <TopNavbar 
        fileName={fileName} 
        setFileName={setFileName} 
        onFileUpload={handleFileUpload}
        onExport={exportFn || undefined}
        formatFunctions={formatFunctions}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Spreadsheet Component (left 3/4) */}
        <div className="w-3/4 h-full overflow-hidden border-r border-border spreadsheet-container">
          <SpreadsheetComponent 
            onDataUpdate={handleDataUpdate} 
            onExport={handleExportFunction}
            onFormatFunctions={handleFormatFunctions}
            onCellSelection={handleCellSelection}
          />
        </div>

        {/* AI Chat Panel (right 1/4) */}
        <div className="w-1/4 h-full flex flex-col bg-muted/30 ai-chat-container">
          <AIChatPanel selectedCellRange={selectedRange} />
        </div>
      </div>
    </div>
  )
} 