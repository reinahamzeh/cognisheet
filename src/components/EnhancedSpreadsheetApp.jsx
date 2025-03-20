"use client"

import React, { useState } from "react"
import { Menu, Plus, X, ActivityIcon as Function, BarChart, Grid } from "lucide-react"
import { SpreadsheetGrid } from "./ui/SpreadsheetGrid"
import { ChatPanel } from "./ui/ChatPanel"
import { cn } from "../lib/utils"
import { useSpreadsheet } from "../context/SpreadsheetContext"
import ChartDisplay from "./ChartDisplay"

/**
 * Enhanced Spreadsheet App - Main component for the spreadsheet application with chat interface
 */
export function EnhancedSpreadsheetApp() {
  // State for tabs
  const [tabs, setTabs] = useState([{ id: 1, name: "Sheet1", active: true }])
  const [nextTabId, setNextTabId] = useState(2)

  // State for spreadsheet data
  const [spreadsheetData, setSpreadsheetData] = useState({
    1: {}, // Sheet1 data
  })

  // State for file menu
  const [fileMenuOpen, setFileMenuOpen] = useState(false)
  
  // State for view mode
  const [viewMode, setViewMode] = useState("spreadsheet") // "spreadsheet" or "charts"
  
  // State for charts
  const [charts, setCharts] = useState([
    {
      id: 1,
      type: "bar",
      title: "Sample Chart",
      data: {
        headers: ["Category", "Value"],
        data: [
          ["Item A", "42"],
          ["Item B", "28"],
          ["Item C", "15"],
          ["Item D", "65"]
        ]
      }
    }
  ])

  // Get spreadsheet context
  const { setCurrentData, data } = useSpreadsheet()

  // Active tab ID
  const activeTabId = tabs.find((tab) => tab.active)?.id || 1

  // Handle tab actions
  const addNewTab = () => {
    // Create a new empty tab instead of copying data
    const newTabId = nextTabId
    setSpreadsheetData((prev) => ({
      ...prev,
      [newTabId]: {}, // Empty sheet data
    }))

    // Add new tab and set it as active
    setTabs((prev) =>
      prev.map((tab) => ({ ...tab, active: false })).concat({ id: newTabId, name: `Sheet${newTabId}`, active: true }),
    )
    setNextTabId((prev) => prev + 1)
  }

  const switchTab = (tabId) => {
    setTabs((prev) => prev.map((tab) => ({ ...tab, active: tab.id === tabId })))
  }

  const renameTab = (tabId, newName) => {
    setTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, name: newName } : tab)))
  }

  const closeTab = (tabId, e) => {
    e.stopPropagation()

    // Don't allow closing the last tab
    if (tabs.length === 1) return

    // If closing active tab, activate another tab
    const isActiveTab = tabs.find((tab) => tab.id === tabId)?.active
    let newActivatedTabId = null

    if (isActiveTab) {
      const tabIndex = tabs.findIndex((tab) => tab.id === tabId)
      newActivatedTabId = tabs[tabIndex === 0 ? 1 : tabIndex - 1].id
    }

    setTabs((prev) => {
      const filteredTabs = prev.filter((tab) => tab.id !== tabId)
      return filteredTabs.map((tab) => ({
        ...tab,
        active: newActivatedTabId ? tab.id === newActivatedTabId : tab.active,
      }))
    })
  }

  // Handle cell changes
  const handleCellChange = (col, row, value) => {
    setSpreadsheetData((prev) => {
      const newData = {
        ...prev,
        [activeTabId]: {
          ...prev[activeTabId],
          [`${col}${row}`]: value,
        },
      }
      
      // Update context if needed
      setCurrentData?.(newData[activeTabId])
      
      return newData
    })
  }

  // Handle file menu actions
  const handleNewFile = () => {
    // Reset to a single tab with empty data
    setTabs([{ id: 1, name: "Sheet1", active: true }])
    setNextTabId(2)
    setSpreadsheetData({ 1: {} })
    setFileMenuOpen(false)
  }

  const handleUploadFile = () => {
    // Handle file upload - can be integrated with the project's file upload functionality
    const newData = data || {
      A1: "Sample",
      B1: "Data",
      A2: "From",
      B2: "Upload",
    }

    setTabs([{ id: 1, name: "Uploaded", active: true }])
    setNextTabId(2)
    setSpreadsheetData({ 1: newData })
    setFileMenuOpen(false)
  }
  
  // Handle adding a new chart
  const addNewChart = () => {
    // This is just a sample implementation - in a real app,
    // you would create a chart based on selected data
    const newChart = {
      id: Date.now(),
      type: "line",
      title: "New Chart",
      data: {
        headers: ["Month", "Sales"],
        data: [
          ["Jan", "40"],
          ["Feb", "45"],
          ["Mar", "55"],
          ["Apr", "60"],
          ["May", "65"]
        ]
      }
    }
    
    setCharts(prev => [...prev, newChart])
    setViewMode("charts") // Switch to chart view when adding a new chart
  }
  
  // Handle deleting a chart
  const handleDeleteChart = (chartId) => {
    setCharts(prev => prev.filter(chart => chart.id !== chartId))
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Navigation Bar */}
      <header className="flex items-center border-b p-2 bg-white">
        <div className="relative">
          <button className="p-2 hover:bg-gray-100 rounded-md" onClick={() => setFileMenuOpen(!fileMenuOpen)}>
            <Menu size={20} />
          </button>

          {fileMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-20">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleNewFile}>
                New File
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleUploadFile}>
                Upload File
              </button>
            </div>
          )}
        </div>

        <div className="mx-4 flex-1">
          <div className="relative">
            <input type="text" placeholder="Enter a formula or value" className="w-full p-2 pl-8 border rounded-md" />
            <Function size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        {/* View toggle buttons */}
        <div className="flex mr-4 border rounded-md overflow-hidden">
          <button 
            className={cn(
              "px-3 py-1.5 flex items-center gap-1.5 text-sm", 
              viewMode === "spreadsheet" ? "bg-green-100 text-green-700" : "bg-white"
            )}
            onClick={() => setViewMode("spreadsheet")}
          >
            <Grid size={16} /> Grid
          </button>
          <button 
            className={cn(
              "px-3 py-1.5 flex items-center gap-1.5 text-sm", 
              viewMode === "charts" ? "bg-green-100 text-green-700" : "bg-white"
            )}
            onClick={() => setViewMode("charts")}
          >
            <BarChart size={16} /> Charts
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Spreadsheet/Charts View (75%) */}
        <div className="w-3/4 flex flex-col border-r overflow-hidden">
          {/* Sheet Tab Bar */}
          <div className="flex items-center border-b bg-gray-50">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={cn(
                  "flex items-center px-4 py-1 border-r cursor-pointer",
                  tab.active ? "bg-white border-b-2 border-b-green-500" : "hover:bg-gray-100",
                )}
              >
                <span
                  onDoubleClick={(e) => {
                    const target = e.target
                    target.contentEditable = "true"
                    target.focus()
                  }}
                  onBlur={(e) => {
                    const target = e.target
                    target.contentEditable = "false"
                    renameTab(tab.id, target.textContent || tab.name)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      const target = e.target
                      target.blur()
                    }
                  }}
                >
                  {tab.name}
                </span>
                <button onClick={(e) => closeTab(tab.id, e)} className="ml-2 p-1 hover:bg-gray-200 rounded-full">
                  <X size={14} />
                </button>
              </div>
            ))}
            <button onClick={addNewTab} className="p-2 hover:bg-gray-100">
              <Plus size={18} />
            </button>
            
            {/* Chart actions when in chart view */}
            {viewMode === "charts" && (
              <button 
                onClick={addNewChart} 
                className="p-2 ml-auto hover:bg-blue-100 text-blue-500 rounded-md flex items-center gap-1"
              >
                <Plus size={18} /> New Chart
              </button>
            )}
          </div>

          {/* Conditional render based on view mode */}
          {viewMode === "spreadsheet" ? (
            <SpreadsheetGrid
              activeTabId={activeTabId}
              spreadsheetData={spreadsheetData}
              onCellChange={handleCellChange}
            />
          ) : (
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {charts.map(chart => (
                  <div key={chart.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <ChartDisplay
                      type={chart.type}
                      data={chart.data}
                      title={chart.title}
                      onDelete={() => handleDeleteChart(chart.id)}
                    />
                  </div>
                ))}
                
                {charts.length === 0 && (
                  <div className="col-span-2 flex flex-col items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <BarChart size={48} className="text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-3">No charts yet</p>
                    <button 
                      onClick={addNewChart}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                    >
                      <Plus size={16} /> Create Chart
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Chat (25%) */}
        <div className="w-1/4 flex flex-col bg-white">
          <ChatPanel onCreateChart={(chartData) => {
            setCharts(prev => [...prev, chartData]);
            setViewMode("charts"); // Switch to chart view when a chart is created
          }} />
        </div>
      </div>
    </div>
  )
} 