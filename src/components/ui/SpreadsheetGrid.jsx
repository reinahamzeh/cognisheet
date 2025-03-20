"use client"

import React, { useState, useEffect, useRef } from "react"
import { cn } from "../../lib/utils"
import { evaluateFormula } from '../../lib/formulaEvaluator'

/**
 * SpreadsheetGrid component that displays and manages the spreadsheet data
 * 
 * @param {Object} props - Component props
 * @param {number} props.activeTabId - The ID of the active tab
 * @param {Object} props.spreadsheetData - The data for the spreadsheet
 * @param {Function} props.onCellChange - Function to call when a cell value changes
 */
export function SpreadsheetGrid({ activeTabId, spreadsheetData, onCellChange }) {
  // State for cell being edited
  const [editCell, setEditCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [selectionStart, setSelectionStart] = useState(null)
  const [selectionEnd, setSelectionEnd] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [hoveredRow, setHoveredRow] = useState(null)
  const [hoveredCol, setHoveredCol] = useState(null)
  const [cellFormat, setCellFormat] = useState({})
  
  // Ref for the input field
  const inputRef = useRef(null)
  const gridRef = useRef(null)
  
  // Focus input when editing starts
  useEffect(() => {
    if (editCell && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editCell])
  
  // Get formatted cell value
  const getCellValue = (col, row) => {
    const cellKey = `${col}${row}`
    let value = spreadsheetData[activeTabId]?.[cellKey] || ''
    
    // If it's a formula, evaluate it
    if (typeof value === 'string' && value.startsWith('=')) {
      try {
        return evaluateFormula(value, spreadsheetData[activeTabId])
      } catch (error) {
        return '#ERROR'
      }
    }
    
    return value
  }
  
  // Get displayed cell value (formatted)
  const getDisplayValue = (col, row) => {
    const value = getCellValue(col, row)
    const cellKey = `${col}${row}`
    const format = cellFormat[cellKey] || {}
    
    // Apply formatting based on cell format
    if (format.type === 'number' && typeof value === 'number') {
      // Format as number
      return value.toLocaleString(undefined, {
        minimumFractionDigits: format.decimals || 0,
        maximumFractionDigits: format.decimals || 2
      })
    } else if (format.type === 'percentage' && typeof value === 'number') {
      // Format as percentage
      return `${(value * 100).toFixed(format.decimals || 0)}%`
    } else if (format.type === 'currency' && typeof value === 'number') {
      // Format as currency
      return value.toLocaleString(undefined, {
        style: 'currency',
        currency: format.currency || 'USD'
      })
    } else if (format.type === 'date' && value instanceof Date) {
      // Format as date
      return value.toLocaleDateString()
    }
    
    return value
  }
  
  // Handle cell click to start editing
  const handleCellClick = (col, row) => {
    if (spreadsheetData[activeTabId]?.[`${col}${row}`] === undefined) return
    
    const cellKey = `${col}${row}`
    
    if (editCell === cellKey) return
    
    // Start selection if not editing
    if (!editCell) {
      setSelectionStart({ col, row })
      setSelectionEnd({ col, row })
    }
    
    // Set the edit cell
    setEditCell(cellKey)
    setEditValue(spreadsheetData[activeTabId]?.[cellKey] || '')
  }
  
  // Handle cell double click
  const handleCellDoubleClick = (col, row) => {
    if (spreadsheetData[activeTabId]?.[`${col}${row}`] === undefined) return
    
    if (onCellChange) {
      onCellChange(col, row, spreadsheetData[activeTabId]?.[`${col}${row}`])
    }
  }
  
  // Handle input change
  const handleInputChange = (e) => {
    setEditValue(e.target.value)
  }
  
  // Handle input blur to finish editing
  const handleInputBlur = () => {
    if (!editCell) return
    
    // Get the column and row from the edit cell
    const match = editCell.match(/([A-Z]+)(\d+)/)
    if (!match) return
    
    const col = match[1]
    const row = parseInt(match[2])
    
    // Call the cell change callback
    if (onCellChange && spreadsheetData[activeTabId]?.[editCell] !== editValue) {
      onCellChange(col, row, editValue)
    }
    
    // Reset edit state
    setEditCell(null)
    setEditValue('')
  }
  
  // Handle key down in the input field
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      handleInputBlur()
      
      // Move to the next cell
      if (editCell) {
        const match = editCell.match(/([A-Z]+)(\d+)/)
        if (!match) return
        
        const col = match[1]
        const row = parseInt(match[2])
        
        if (e.key === 'Enter') {
          // Move down (next row)
          const nextRow = row + 1
          if (nextRow <= 40) {
            const nextCellKey = `${col}${nextRow}`
            setEditCell(nextCellKey)
            setEditValue(spreadsheetData[activeTabId]?.[nextCellKey] || '')
          }
        } else if (e.key === 'Tab') {
          // Move right (next column)
          const colLetter = col.charCodeAt(0)
          if (colLetter < 65 + 26 - 1) {
            const nextCol = String.fromCharCode(colLetter + 1)
            const nextCellKey = `${nextCol}${row}`
            setEditCell(nextCellKey)
            setEditValue(spreadsheetData[activeTabId]?.[nextCellKey] || '')
          }
        }
      }
    } else if (e.key === 'Escape') {
      // Cancel editing
      setEditCell(null)
      setEditValue('')
    }
  }
  
  // Handle mousedown to start selection
  const handleMouseDown = (col, row) => {
    if (spreadsheetData[activeTabId]?.[`${col}${row}`] === undefined) return
    
    setSelectionStart({ col, row })
    setSelectionEnd({ col, row })
    setIsSelecting(true)
  }
  
  // Handle mouseover during selection
  const handleMouseOver = (col, row) => {
    setHoveredRow(row)
    setHoveredCol(col)
    
    if (isSelecting && selectionStart) {
      setSelectionEnd({ col, row })
    }
  }
  
  // Handle mouseup to end selection
  const handleMouseUp = () => {
    setIsSelecting(false)
  }
  
  // Check if a cell is in the selected range
  const isCellSelected = (col, row) => {
    if (!selectionStart || !selectionEnd) return false
    
    const { startCol, startRow, endCol, endRow } = selectionStart
    
    // Convert col letter to number for comparison
    const colNum = col.charCodeAt(0) - 64 // A=1, B=2, etc.
    const startColNum = startCol.charCodeAt(0) - 64
    const endColNum = endCol.charCodeAt(0) - 64
    
    // Check if cell is in the range
    return (
      colNum >= Math.min(startColNum, endColNum) &&
      colNum <= Math.max(startColNum, endColNum) &&
      row >= Math.min(startRow, endRow) &&
      row <= Math.max(startRow, endRow)
    )
  }
  
  // Get cell class based on state
  const getCellClass = (col, row) => {
    const cellKey = `${col}${row}`
    const isEditing = editCell === cellKey
    const isSelected = isCellSelected(col, row)
    const isHovered = hoveredRow === row || hoveredCol === col
    
    return `spreadsheet-cell ${isEditing ? 'editing' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`
  }
  
  // Generate column headers (A, B, C, etc.)
  const columnHeaders = []
  for (let i = 0; i < 26; i++) {
    const colLetter = String.fromCharCode(65 + i)
    columnHeaders.push(colLetter)
  }
  
  // Generate row headers (1, 2, 3, etc.)
  const rowHeaders = []
  for (let i = 1; i <= 40; i++) {
    rowHeaders.push(i)
  }
  
  // Add event listener for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+A to select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && !editCell) {
        e.preventDefault()
        if (onCellChange) {
          onCellChange(null, null, null)
        }
      }
      
      // Cmd+K (keep existing behavior)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !editCell) {
        e.preventDefault()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [editCell, onCellChange])
  
  return (
    <div className="flex-1 overflow-hidden relative">
      <div 
        ref={gridRef}
        className="h-full overflow-auto"
        style={{ 
          width: '100%',
          maxWidth: '1000px' // 26 columns at 40px each
        }}
      >
        <table className="border-collapse">
          <colgroup>
            <col style={{ width: '40px', minWidth: '40px' }} />
            {columnHeaders.map((col) => (
              <col 
                key={col} 
                style={{ 
                  width: '40px', 
                  minWidth: '40px' 
                }} 
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th 
                className="h-8 bg-gray-50 border sticky top-0 left-0 z-20"
                style={{ width: '40px', minWidth: '40px' }}
              ></th>
              {columnHeaders.map((col) => (
                <th
                  key={col}
                  className="bg-gray-50 border text-center font-normal text-gray-700 sticky top-0 z-10 relative"
                  style={{ 
                    width: '40px', 
                    minWidth: '40px' 
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowHeaders.map((row) => (
              <tr 
                key={row} 
                style={{ height: '30px' }}
              >
                <td 
                  className="bg-gray-50 border text-center text-gray-700 sticky left-0 z-10 relative"
                  style={{ width: '40px', minWidth: '40px' }}
                >
                  {row}
                </td>
                {columnHeaders.map((col) => {
                  const cellKey = `${col}${row}`
                  const isEditing = editCell === cellKey
                  const isSelected = isCellSelected(col, row)
                  const isHovered = hoveredRow === row || hoveredCol === col
                  
                  return (
                    <td
                      key={cellKey}
                      data-cell
                      data-col={col}
                      data-row={row}
                      className={getCellClass(col, row)}
                      style={{ 
                        width: '40px', 
                        minWidth: '40px' 
                      }}
                      onClick={() => handleCellClick(col, row)}
                      onDoubleClick={() => handleCellDoubleClick(col, row)}
                      onMouseDown={(e) => handleMouseDown(col, row)}
                      onMouseOver={(e) => handleMouseOver(col, row)}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          onKeyDown={handleInputKeyDown}
                          className="w-full h-full outline-none px-1"
                        />
                      ) : (
                        getDisplayValue(col, row)
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 