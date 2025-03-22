"use client"

import React, { useState } from "react"
import { Input } from "./ui/input"

interface SpreadsheetGridProps {
  data: {
    columns: number
    rows: number
    cells: Record<string, any>
  }
  setData: (data: any) => void
}

export default function SpreadsheetGrid({ data, setData }: SpreadsheetGridProps) {
  const [activeCell, setActiveCell] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  // Generate column headers (A, B, C, ...)
  const columnHeaders = Array.from({ length: data.columns }, (_, i) => String.fromCharCode(65 + i))

  // Handle cell click
  const handleCellClick = (cellId: string) => {
    setActiveCell(cellId)
    setEditValue(data.cells[cellId]?.value || "")
  }

  // Handle cell value change
  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  // Handle cell blur (save value)
  const handleCellBlur = () => {
    if (activeCell) {
      const newCells = { ...data.cells }
      newCells[activeCell] = {
        value: editValue,
        // In a real app, we would calculate formula results here
      }
      setData({ ...data, cells: newCells })
      setActiveCell(null)
    }
  }

  // Handle key press in cell
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCellBlur()
    }
  }

  // Get cell value for display
  const getCellValue = (row: number, col: string) => {
    const cellId = `${col}${row}`
    return data.cells[cellId]?.value || ""
  }

  return (
    <div className="relative overflow-auto">
      <table className="border-collapse w-full">
        <thead>
          <tr>
            {/* Empty corner cell */}
            <th className="sticky top-0 left-0 z-20 bg-muted/50 border border-border w-10 h-8"></th>

            {/* Column headers */}
            {columnHeaders.map((col) => (
              <th
                key={col}
                className="sticky top-0 z-10 bg-muted/50 border border-border font-normal text-xs text-muted-foreground w-24 h-8"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: data.rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {/* Row headers */}
              <td className="sticky left-0 z-10 bg-muted/50 border border-border text-xs text-muted-foreground text-center w-10 h-8">
                {rowIndex + 1}
              </td>

              {/* Cells */}
              {columnHeaders.map((col) => {
                const cellId = `${col}${rowIndex + 1}`
                const isActive = activeCell === cellId

                return (
                  <td
                    key={cellId}
                    className={`border border-border relative h-8 ${isActive ? "p-0 bg-primary/5" : "p-1"}`}
                    onClick={() => handleCellClick(cellId)}
                  >
                    {isActive ? (
                      <Input
                        value={editValue}
                        onChange={handleCellChange}
                        onBlur={handleCellBlur}
                        onKeyDown={handleKeyDown}
                        className="h-full w-full border-0 focus-visible:ring-2 focus-visible:ring-primary"
                        autoFocus
                      />
                    ) : (
                      <div className="h-full w-full overflow-hidden text-sm">{getCellValue(rowIndex + 1, col)}</div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 