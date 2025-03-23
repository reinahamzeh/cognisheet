"use client"

import React, { useState, useEffect, useRef } from "react"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Bold, Italic, Download, Upload } from "lucide-react"

// Define FormatFunctions interface
interface FormatFunctions {
  toggleBold: () => void
  toggleItalic: () => void
  setTextAlign: (alignment: 'left' | 'center' | 'right') => void
  toggleWrapText: () => void
}

interface SpreadsheetComponentProps {
  onDataUpdate?: (data: { sheets: SheetTab[], activeSheetId: string }) => void
  onExport?: (exportFn: () => void) => void
  onFormatFunctions?: (functions: FormatFunctions) => void
}

interface CellData {
  value: string
  isBold: boolean
  isItalic: boolean
  textAlign: 'left' | 'center' | 'right'
  wrapText: boolean
}

interface SpreadsheetData {
  rows: number
  columns: number
  cells: Record<string, CellData>
  headers: string[] // Column headers
}

// Cell reference regex pattern (to identify cell references like A1, B2, etc.)
const CELL_REFERENCE_PATTERN = /([A-Z]+[0-9]+)/g

// Check if a formula contains cell references
const hasCellReferences = (expression: string): boolean => {
  return CELL_REFERENCE_PATTERN.test(expression)
}

// Reset the regex lastIndex to avoid unexpected behavior in subsequent calls
const resetRegex = (regex: RegExp): void => {
  regex.lastIndex = 0
}

// Extract and resolve cell references in a formula
const resolveCellReferences = (expression: string, cells: Record<string, CellData>): string => {
  resetRegex(CELL_REFERENCE_PATTERN)
  
  // Replace cell references with their values
  return expression.replace(CELL_REFERENCE_PATTERN, (match) => {
    // Get the value for the referenced cell
    const cell = cells[match]
    
    if (!cell) {
      return '0' // If cell doesn't exist, treat as 0
    }
    
    const value = cell.value
    
    // If the referenced cell contains a formula, we should evaluate it first (simple solution for now)
    // In a real-world app, you'd need to handle circular references and more complex formulas
    if (value.startsWith('=')) {
      try {
        const nestedExpression = value.substring(1).trim()
        // Check for circular references (very basic approach)
        if (nestedExpression.includes(match)) {
          return '#CIRCULAR'
        }
        
        // For simple nested formulas, evaluate them (this is a simplified implementation)
        if (!hasCellReferences(nestedExpression)) {
          const result = new Function(`return ${nestedExpression}`)()
          return String(result)
        } else {
          return '#NESTED'  // More complex nested references not supported yet
        }
      } catch (error) {
        return '#ERROR'
      }
    }
    
    // If it's just a regular value
    // Check if the value is numeric
    if (/^-?\d*\.?\d+$/.test(value)) {
      return value
    }
    
    // If it's not a number, return 0 (simplified approach)
    // In a real implementation, you'd handle strings and other data types
    return '0'
  })
}

// Generate column name for index (A, B, ..., Z, AA, AB, ...)
const getColumnName = (index: number): string => {
  let dividend = index + 1
  let columnName = ''
  let modulo

  while (dividend > 0) {
    modulo = (dividend - 1) % 26
    columnName = String.fromCharCode(65 + modulo) + columnName
    dividend = Math.floor((dividend - modulo) / 26)
  }

  return columnName
}

// Get column index from name (A -> 0, B -> 1, ..., Z -> 25, AA -> 26, ...)
const getColumnIndex = (name: string): number => {
  let result = 0
  for (let i = 0; i < name.length; i++) {
    result = result * 26 + (name.charCodeAt(i) - 64)
  }
  return result - 1
}

// Add additional type for sheet tabs
interface SheetTab {
  id: string;
  name: string;
  data: SpreadsheetData;
}

export default function SpreadsheetComponent({ onDataUpdate, onExport, onFormatFunctions }: SpreadsheetComponentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Create empty data template
  const createEmptyData = (): SpreadsheetData => ({
    rows: 25,
    columns: 11, // Initially only show A-K (11 columns)
    cells: {},
    headers: Array.from({ length: 11 }, (_, i) => getColumnName(i)) // A-K
  });
  
  // Initialize sheets state with one default sheet
  const [sheets, setSheets] = useState<SheetTab[]>([
    { 
      id: 'sheet1', 
      name: 'Sheet 1', 
      data: createEmptyData()
    }
  ]);
  
  // Track the active sheet
  const [activeSheetId, setActiveSheetId] = useState<string>('sheet1');
  
  // Get current sheet data
  const data = sheets.find(sheet => sheet.id === activeSheetId)?.data || createEmptyData();
  
  // Set data function that updates the current sheet
  const setData = (newData: SpreadsheetData) => {
    setSheets(sheets.map(sheet => 
      sheet.id === activeSheetId 
        ? { ...sheet, data: newData } 
        : sheet
    ));
  };
  
  const [activeCell, setActiveCell] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [formulaValue, setFormulaValue] = useState("")
  const [fileName, setFileName] = useState("Untitled Spreadsheet")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const activeCellRef = useRef<HTMLInputElement>(null)
  const formulaInputRef = useRef<HTMLInputElement>(null)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    Array.from({ length: 11 }, (_, i) => getColumnName(i))
  )
  const [scrollPosition, setScrollPosition] = useState(0)
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null)
  const [editingSheetName, setEditingSheetName] = useState<string>("")
  const sheetNameInputRef = useRef<HTMLInputElement>(null)

  // Generate column headers (A, B, C, ..., Z, AA, AB, ...)
  const columnHeaders = Array.from({ length: data.columns }, (_, i) => getColumnName(i))

  // Add a new sheet
  const addNewSheet = () => {
    const newSheetId = `sheet${sheets.length + 1}`;
    const newSheetName = `Sheet ${sheets.length + 1}`;
    
    setSheets([
      ...sheets, 
      { 
        id: newSheetId, 
        name: newSheetName, 
        data: createEmptyData()
      }
    ]);
    
    // Switch to the new sheet
    setActiveSheetId(newSheetId);
    
    // Reset UI state for new sheet
    setActiveCell(null);
    setEditValue("");
    setFormulaValue("");
    setVisibleColumns(Array.from({ length: 11 }, (_, i) => getColumnName(i)));
    setScrollPosition(0);
  };
  
  // Delete the active sheet
  const deleteSheet = (sheetId: string) => {
    // Prevent deleting the last sheet
    if (sheets.length <= 1) {
      return;
    }
    
    const newSheets = sheets.filter(sheet => sheet.id !== sheetId);
    setSheets(newSheets);
    
    // If we're deleting the active sheet, switch to another sheet
    if (sheetId === activeSheetId) {
      setActiveSheetId(newSheets[0].id);
      
      // Update UI state for the new active sheet
      setActiveCell(null);
      setEditValue("");
      setFormulaValue("");
    }
  };
  
  // Start renaming a sheet
  const startRenameSheet = (sheetId: string) => {
    const sheet = sheets.find(s => s.id === sheetId);
    if (sheet) {
      setEditingSheetId(sheetId);
      setEditingSheetName(sheet.name);
      
      // Focus the input after rendering
      setTimeout(() => {
        if (sheetNameInputRef.current) {
          sheetNameInputRef.current.focus();
          sheetNameInputRef.current.select();
        }
      }, 0);
    }
  };
  
  // Finish renaming a sheet
  const finishRenameSheet = () => {
    if (editingSheetId) {
      setSheets(sheets.map(sheet => 
        sheet.id === editingSheetId 
          ? { ...sheet, name: editingSheetName || sheet.name } 
          : sheet
      ));
      setEditingSheetId(null);
    }
  };
  
  // Handle sheet name input key down
  const handleSheetNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      finishRenameSheet();
    } else if (e.key === 'Escape') {
      setEditingSheetId(null);
    }
  };

  // Set up auto-save functionality
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (onDataUpdate && Object.keys(data.cells).length > 0) {
        console.log('Auto-saving spreadsheet data...');
        // Send all sheets data for saving
        onDataUpdate({ sheets, activeSheetId });
      }
    }, 1500); // Every 1.5 seconds

    return () => clearInterval(saveInterval);
  }, [sheets, activeSheetId, data.cells, onDataUpdate]);

  // Update visible columns when scrolling horizontally
  const handleHorizontalScroll = (scrollLeft: number) => {
    // Calculate which columns should be visible based on scroll position
    const columnWidth = 96; // This matches the actual column width in pixels (including borders)
    const startColumnIndex = Math.floor(scrollLeft / columnWidth);
    
    // Prevent negative scroll position
    const validStartIndex = Math.max(0, startColumnIndex);
    
    // Ensure we don't scroll beyond the available columns
    const maxStartPosition = Math.max(0, columnHeaders.length - 11);
    const constrainedIndex = Math.min(validStartIndex, maxStartPosition);
    
    // Only update if the scroll position has changed
    if (constrainedIndex !== scrollPosition) {
      setScrollPosition(constrainedIndex);
    }
  }

  // Handle scroll event in the spreadsheet container
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    handleHorizontalScroll(e.currentTarget.scrollLeft);
  }

  // Handle file upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Parse CSV file
  const parseCSV = (file: File) => {
    return new Promise<any[][]>((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && Array.isArray(results.data)) {
            resolve(results.data as any[][])
          } else {
            reject(new Error("Failed to parse CSV file"))
          }
        },
        error: (error) => {
          reject(error)
        },
        header: false
      })
    })
  }

  // Parse Excel/Numbers file
  const parseExcel = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      return XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    } catch (error) {
      throw new Error("Failed to parse Excel file")
    }
  }

  // Convert parsed data to spreadsheet format
  const convertToSpreadsheetData = (parsedData: any[][]) => {
    if (!parsedData || !parsedData.length) {
      throw new Error("Invalid data format")
    }

    const rows = parsedData.length
    const columns = Math.max(...parsedData.map(row => row.length || 0))
    const cells: Record<string, CellData> = {}
    const headers = Array.from({ length: columns }, (_, i) => String.fromCharCode(65 + i))

    // Convert 2D array to cells object
    parsedData.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        if (cellValue !== undefined && cellValue !== null) {
          const cellId = `${headers[colIndex]}${rowIndex + 1}`
          cells[cellId] = {
            value: String(cellValue),
            isBold: false,
            isItalic: false,
            textAlign: 'left',
            wrapText: false
          }
        }
      })
    })

    return {
      rows,
      columns,
      cells,
      headers
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
        
        // Figure out dimensions
        const rows = jsonData.length || 25
        let maxCols = 0
        jsonData.forEach(row => {
          maxCols = Math.max(maxCols, row.length)
        })
        const columns = Math.max(maxCols, 11) // Ensure at least 11 columns
        
        // Create new cells object
        const newCells: Record<string, CellData> = {}
        
        jsonData.forEach((row, rowIndex) => {
          row.forEach((cellValue, colIndex) => {
            if (cellValue !== undefined && cellValue !== null) {
              const colName = getColumnName(colIndex)
              const cellId = `${colName}${rowIndex + 1}`
              newCells[cellId] = {
                value: cellValue.toString(),
                isBold: false,
                isItalic: false,
                textAlign: 'left',
                wrapText: false
              }
            }
          })
        })
        
        // Create new data
        const newData: SpreadsheetData = {
          rows,
          columns,
          cells: newCells,
          headers: Array.from({ length: columns }, (_, i) => getColumnName(i))
        }
        
        // Set file name
        setFileName(file.name)
        
        // Update state
        setData(newData)
        if (onDataUpdate) {
          onDataUpdate({ 
            sheets: sheets.map(sheet => 
              sheet.id === activeSheetId 
                ? { ...sheet, data: newData } 
                : sheet
            ), 
            activeSheetId 
          })
        }
      } catch (error) {
        console.error('Error parsing file:', error)
        setErrorMessage('Error parsing file. Please make sure it is a valid spreadsheet.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Add rows if needed
  const addRowsIfNeeded = (rowIndex: number) => {
    if (rowIndex >= data.rows - 5) { // If we're within 5 rows of the end
      const newRows = data.rows + 10 // Add 10 more rows
      const newData: SpreadsheetData = {
        ...data,
        rows: newRows
      }
      setData(newData)
      if (onDataUpdate) {
        onDataUpdate({ 
          sheets: sheets.map(sheet => 
            sheet.id === activeSheetId 
              ? { ...sheet, data: newData } 
              : sheet
          ), 
          activeSheetId 
        })
      }
    }
  }

  // Add columns if needed (supporting beyond Z with AA, AB, etc.)
  const addColumnsIfNeeded = (colIndex: number) => {
    // If we're within 5 columns of the end or the index is beyond current columns, add more
    if (colIndex >= data.columns - 5 || colIndex >= data.columns) {
      // Add 5 more columns or enough to include the requested column
      const neededColumns = Math.max(data.columns + 5, colIndex + 5);
      const newData: SpreadsheetData = {
        ...data,
        columns: neededColumns,
        headers: Array.from({ length: neededColumns }, (_, i) => getColumnName(i))
      }
      setData(newData)
      
      // If the user is at the edge of the visible area, scroll to show the next column
      const visibleEndIndex = scrollPosition + 10; // 0-based index of the last visible column
      if (colIndex >= visibleEndIndex) {
        setScrollPosition(Math.min(neededColumns - 11, scrollPosition + 1));
      }
      
      if (onDataUpdate) {
        onDataUpdate({ 
          sheets: sheets.map(sheet => 
            sheet.id === activeSheetId 
              ? { ...sheet, data: newData } 
              : sheet
          ), 
          activeSheetId 
        })
      }
    }
  }

  // Handle cell click
  const handleCellClick = (cellId: string) => {
    setActiveCell(cellId)
    
    // Extract column name and row number correctly
    // Match column letters and row numbers with regex
    const match = cellId.match(/([A-Z]+)(\d+)/)
    if (match) {
      const colName = match[1]
      const row = parseInt(match[2])
      const colIndex = getColumnIndex(colName)
      
      // Check if we need to add more rows or columns
      addRowsIfNeeded(row)
      
      // Always check if we need to expand columns when clicking
      // This handles the case of clicking on placeholder columns
      addColumnsIfNeeded(colIndex)
      
      // After ensuring the cell exists, get its value
      const cellValue = data.cells[cellId]?.value || ""
      setEditValue(cellValue)
      setFormulaValue(cellValue)
    }
  }

  // Handle cell double click - select all text in the cell
  const handleCellDoubleClick = (cellId: string) => {
    // Make sure we select all text in the active cell
    if (activeCellRef.current) {
      activeCellRef.current.select()
    }
  }

  // Handle cell value change
  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
    // Update formula bar in real-time as well
    setFormulaValue(e.target.value)
  }
  
  // Handle formula bar change
  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulaValue(e.target.value)
  }
  
  // Handle formula bar key down
  const handleFormulaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activeCell) {
      updateCellValue(activeCell, formulaValue)
      
      // If we're starting a new formula, keep focus in the formula bar
      if (formulaValue.startsWith('=')) {
        if (formulaInputRef.current) {
          formulaInputRef.current.focus()
        }
      } else {
        // Otherwise, move focus back to the spreadsheet
        setActiveCell(null)
      }
    }
  }

  // Handle cell blur (save value)
  const handleCellBlur = () => {
    if (activeCell) {
      updateCellValue(activeCell, editValue)
      setActiveCell(null)
    }
  }

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, cellId: string) => {
    // Extract column name and row number correctly
    const match = cellId.match(/([A-Z]+)(\d+)/)
    if (!match) return;
    
    const colName = match[1]
    const row = parseInt(match[2])
    
    // Get column index from name (supporting multi-letter columns)
    const colIndex = getColumnIndex(colName)
    
    // Get the last visible column index
    const visibleEndIndex = scrollPosition + 10;
    
    if (e.key === 'Enter') {
      // Move to the cell below
      e.preventDefault()
      if (row < data.rows) {
        const nextCellId = `${colName}${row + 1}`
        updateCellValue(cellId, editValue)
        setActiveCell(nextCellId)
        setEditValue(data.cells[nextCellId]?.value || "")
        setFormulaValue(data.cells[nextCellId]?.value || "") // Update formula bar
        
        // Check if we need to add more rows
        addRowsIfNeeded(row + 1)
      } else {
        handleCellBlur()
      }
    } else if (e.key === 'Tab') {
      // Move to the next cell to the right
      e.preventDefault()
      if (colIndex < data.columns - 1) {
        const nextCol = getColumnName(colIndex + 1) // Get next column name
        const nextCellId = `${nextCol}${row}`
        updateCellValue(cellId, editValue)
        setActiveCell(nextCellId)
        setEditValue(data.cells[nextCellId]?.value || "")
        setFormulaValue(data.cells[nextCellId]?.value || "") // Update formula bar
        
        // Check if we're at the edge of visible area
        if (colIndex === visibleEndIndex) {
          // Scroll to show the next column
          setScrollPosition(Math.min(data.columns - 11, scrollPosition + 1))
        }
        
        // Check if we need to add more columns
        addColumnsIfNeeded(colIndex + 1)
      } else if (row < data.rows) {
        // Move to the first cell of the next row
        const nextCellId = `A${row + 1}`
        updateCellValue(cellId, editValue)
        setActiveCell(nextCellId)
        setEditValue(data.cells[nextCellId]?.value || "")
        setFormulaValue(data.cells[nextCellId]?.value || "") // Update formula bar
        
        // Reset horizontal scroll position to the beginning
        setScrollPosition(0)
        
        // Check if we need to add more rows
        addRowsIfNeeded(row + 1)
      } else {
        handleCellBlur()
      }
    } else if (e.key === 'ArrowUp' && !e.shiftKey) {
      // Move to the cell above
      e.preventDefault()
      if (row > 1) {
        const nextCellId = `${colName}${row - 1}`
        updateCellValue(cellId, editValue)
        setActiveCell(nextCellId)
        setEditValue(data.cells[nextCellId]?.value || "")
        setFormulaValue(data.cells[nextCellId]?.value || "") // Update formula bar
      }
    } else if (e.key === 'ArrowDown' && !e.shiftKey) {
      // Move to the cell below
      e.preventDefault()
      if (row < data.rows) {
        const nextCellId = `${colName}${row + 1}`
        updateCellValue(cellId, editValue)
        setActiveCell(nextCellId)
        setEditValue(data.cells[nextCellId]?.value || "")
        setFormulaValue(data.cells[nextCellId]?.value || "") // Update formula bar
        
        // Check if we need to add more rows
        addRowsIfNeeded(row + 1)
      }
    } else if (e.key === 'ArrowLeft' && !e.shiftKey) {
      // Move to the cell to the left
      e.preventDefault()
      if (colIndex > 0) {
        const nextCol = getColumnName(colIndex - 1) // Get previous column name
        const nextCellId = `${nextCol}${row}`
        updateCellValue(cellId, editValue)
        setActiveCell(nextCellId)
        setEditValue(data.cells[nextCellId]?.value || "")
        setFormulaValue(data.cells[nextCellId]?.value || "") // Update formula bar
      }
    } else if (e.key === 'ArrowRight' && !e.shiftKey) {
      // Move to the cell to the right
      e.preventDefault()
      if (colIndex < data.columns - 1) {
        const nextCol = getColumnName(colIndex + 1) // Get next column name
        const nextCellId = `${nextCol}${row}`
        updateCellValue(cellId, editValue)
        setActiveCell(nextCellId)
        setEditValue(data.cells[nextCellId]?.value || "")
        setFormulaValue(data.cells[nextCellId]?.value || "") // Update formula bar
        
        // Check if we're at the edge of visible area
        if (colIndex === visibleEndIndex) {
          // Scroll to show the next column
          setScrollPosition(Math.min(data.columns - 11, scrollPosition + 1))
        }
        
        // Check if we need to add more columns
        addColumnsIfNeeded(colIndex + 1)
      }
    }
  }

  // Update cell value and formatting function
  const updateCellValue = (cellId: string, value: string) => {
    const newCells = { ...data.cells }
    
    // Check if the value is a formula
    let displayValue = value
    
    if (value.startsWith('=')) {
      try {
        // Extract the expression (remove the leading '=')
        const expression = value.substring(1).trim()
        
        // Check if it's a basic math expression
        if (/^[0-9\s\+\-\*\/\(\)\.]+$/.test(expression)) {
          console.log(`Evaluating formula: ${expression}`)
          
          // Use Function constructor to evaluate the expression
          const result = Function(`'use strict'; return (${expression})`)()
          console.log(`Formula result: ${result}`)
          
          // Store the result as the display value
          displayValue = result.toString()
        }
      } catch (error) {
        console.error('Formula evaluation error:', error)
        // Keep the original formula if evaluation fails
        displayValue = value
      }
    }
    
    // Make sure textAlign is properly typed
    const cellTextAlign = newCells[cellId]?.textAlign || 'left'
    const typedTextAlign: 'left' | 'center' | 'right' = 
      cellTextAlign === 'center' ? 'center' : 
      cellTextAlign === 'right' ? 'right' : 'left'
    
    newCells[cellId] = {
      value: value, // Store the original input
      isBold: newCells[cellId]?.isBold || false,
      isItalic: newCells[cellId]?.isItalic || false,
      textAlign: typedTextAlign,
      wrapText: newCells[cellId]?.wrapText || false
    }
    
    const newData: SpreadsheetData = { ...data, cells: newCells }
    setData(newData)
    if (onDataUpdate) {
      onDataUpdate({ 
        sheets: sheets.map(sheet => 
          sheet.id === activeSheetId 
            ? { ...sheet, data: newData } 
            : sheet
        ), 
        activeSheetId 
      })
    }
  }

  // Export spreadsheet as Excel file
  const exportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new()
    
    // Convert each sheet to an Excel worksheet
    sheets.forEach(sheet => {
      // Convert data to worksheet format
      const worksheet = XLSX.utils.aoa_to_sheet([[]])
      
      // Fill in the cells
      Object.entries(sheet.data.cells).forEach(([cellId, cellData]) => {
        // Split the cell ID into column name and row number
        const match = cellId.match(/([A-Z]+)(\d+)/)
        if (!match) return
        
        const colName = match[1] 
        const row = parseInt(match[2])
        const colIndex = getColumnIndex(colName)
        
        // Get cell address in Excel format
        const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: colIndex })
        
        // Create cell with value and formatting
        worksheet[cellAddress] = { v: cellData.value }
        
        // If it's a formula, set the formula property
        if (cellData.value.startsWith('=')) {
          worksheet[cellAddress].f = cellData.value.substring(1) 
        }
        
        // Add styling
        if (cellData.isBold || cellData.isItalic) {
          if (!worksheet['!cols']) worksheet['!cols'] = []
          if (!worksheet['!rows']) worksheet['!rows'] = []
          
          // Apply styling using XLSX.js cell format
          if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {}
          
          if (cellData.isBold) {
            worksheet[cellAddress].s.font = { ...(worksheet[cellAddress].s.font || {}), bold: true }
          }
          
          if (cellData.isItalic) {
            worksheet[cellAddress].s.font = { ...(worksheet[cellAddress].s.font || {}), italic: true }
          }
        }
      })
      
      // Set worksheet dimensions
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')
      worksheet['!ref'] = XLSX.utils.encode_range(range)
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
    })
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName.split('.')[0] || 'spreadsheet'}.xlsx`)
  }

  // Register export handler and formatting functions if provided
  useEffect(() => {
    if (onExport) {
      // Pass the export function to the parent component
      onExport(exportToExcel)
    }
    
    if (onFormatFunctions) {
      // Pass the formatting functions to the parent component
      onFormatFunctions({
        toggleBold,
        toggleItalic,
        setTextAlign,
        toggleWrapText
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onExport, onFormatFunctions]) // Format functions don't need to be dependencies

  // Get cell value and styling for display
  const getCellDisplay = (row: number, col: string) => {
    const cellId = `${col}${row}`
    const cell = data.cells[cellId]
    
    if (!cell) {
      return { 
        value: "", 
        isBold: false, 
        isItalic: false, 
        textAlign: 'left' as const, 
        wrapText: false 
      }
    }
    
    return {
      ...cell,
      textAlign: (cell.textAlign === 'center' || cell.textAlign === 'right') 
        ? cell.textAlign 
        : 'left' as const
    }
  }

  // Render cell with formatting
  const renderCellContent = (cell: CellData) => {
    let content = cell.value
    
    // If the content is a formula, try to evaluate it
    if (content.startsWith('=')) {
      try {
        // Extract the expression without the equals sign
        const expression = content.substring(1).trim()
        
        // Check for cell references and process them
        resetRegex(CELL_REFERENCE_PATTERN)
        if (hasCellReferences(expression)) {
          // Resolve cell references to their values
          console.log(`Rendering formula with cell references: ${expression}`)
          const resolvedExpression = resolveCellReferences(expression, data.cells)
          console.log(`Resolved expression: ${resolvedExpression}`)
          
          // Evaluate the resolved expression
          const result = new Function(`return ${resolvedExpression}`)()
          console.log(`Formula result: ${result}`)
          
          // Format the result
          content = typeof result === 'number' 
            ? String(Math.round(result * 1000000) / 1000000) // Round to avoid floating point issues
            : '#ERROR'
        }
        // Check if it's a basic math expression (contains only numbers and operators +, -, *, /)
        else if (/^[0-9\s\+\-\*\/\(\)\.]+$/.test(expression)) {
          // Use Function constructor to safely evaluate the expression
          console.log(`Evaluating formula: ${expression}`)
          const result = new Function(`return ${expression}`)()
          console.log(`Formula result: ${result}`)
          
          // Format the result
          content = typeof result === 'number' 
            ? String(Math.round(result * 1000000) / 1000000) // Round to avoid floating point issues
            : '#ERROR'
        }
      } catch (error) {
        console.error('Formula evaluation error:', error)
        content = '#ERROR'
      }
    }
    
    // Apply formatting
    if (cell.isBold) {
      content = `<b>${content}</b>`
    }
    
    if (cell.isItalic) {
      content = `<i>${content}</i>`
    }
    
    // Apply text-align and wrap styles using className
    const cellStyle: React.CSSProperties = {
      textAlign: cell.textAlign,
      whiteSpace: cell.wrapText ? 'normal' : 'nowrap',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      fontSize: '0.875rem' // text-sm equivalent
    }
    
    return (
      <div 
        className="h-full w-full overflow-hidden" 
        style={cellStyle}
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    )
  }

  // Toggle bold for active cell
  const toggleBold = () => {
    if (!activeCell) return

    const newCells = { ...data.cells }
    
    if (newCells[activeCell]) {
      newCells[activeCell] = {
        ...newCells[activeCell],
        isBold: !newCells[activeCell].isBold
      }
    } else {
      newCells[activeCell] = {
        value: "",
        isBold: true,
        isItalic: false,
        textAlign: 'left',
        wrapText: false
      }
    }
    
    const newData = { ...data, cells: newCells }
    setData(newData)
    if (onDataUpdate) {
      onDataUpdate({ 
        sheets: sheets.map(sheet => 
          sheet.id === activeSheetId 
            ? { ...sheet, data: newData } 
            : sheet
        ), 
        activeSheetId 
      })
    }
  }

  // Toggle italic for active cell
  const toggleItalic = () => {
    if (!activeCell) return

    const newCells = { ...data.cells }
    
    if (newCells[activeCell]) {
      newCells[activeCell] = {
        ...newCells[activeCell],
        isItalic: !newCells[activeCell].isItalic
      }
    } else {
      newCells[activeCell] = {
        value: "",
        isBold: false,
        isItalic: true,
        textAlign: 'left',
        wrapText: false
      }
    }
    
    const newData = { ...data, cells: newCells }
    setData(newData)
    if (onDataUpdate) {
      onDataUpdate({ 
        sheets: sheets.map(sheet => 
          sheet.id === activeSheetId 
            ? { ...sheet, data: newData } 
            : sheet
        ), 
        activeSheetId 
      })
    }
  }

  // Set text alignment for active cell
  const setTextAlign = (alignment: 'left' | 'center' | 'right') => {
    if (!activeCell) return

    const newCells = { ...data.cells }
    
    if (newCells[activeCell]) {
      newCells[activeCell] = {
        ...newCells[activeCell],
        textAlign: alignment
      }
    } else {
      newCells[activeCell] = {
        value: "",
        isBold: false,
        isItalic: false,
        textAlign: alignment,
        wrapText: false
      }
    }
    
    const newData = { ...data, cells: newCells }
    setData(newData)
    if (onDataUpdate) {
      onDataUpdate({ 
        sheets: sheets.map(sheet => 
          sheet.id === activeSheetId 
            ? { ...sheet, data: newData } 
            : sheet
        ), 
        activeSheetId 
      })
    }
  }

  // Toggle wrap text for active cell
  const toggleWrapText = () => {
    if (!activeCell) return

    const newCells = { ...data.cells }
    
    if (newCells[activeCell]) {
      newCells[activeCell] = {
        ...newCells[activeCell],
        wrapText: !newCells[activeCell].wrapText
      }
    } else {
      newCells[activeCell] = {
        value: "",
        isBold: false,
        isItalic: false,
        textAlign: 'left',
        wrapText: true
      }
    }
    
    const newData = { ...data, cells: newCells }
    setData(newData)
    if (onDataUpdate) {
      onDataUpdate({ 
        sheets: sheets.map(sheet => 
          sheet.id === activeSheetId 
            ? { ...sheet, data: newData } 
            : sheet
        ), 
        activeSheetId 
      })
    }
  }

  // Set up keyboard shortcuts for formatting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if no active cell or if inside an input field that isn't the cell editor
      if (!activeCell || (
        document.activeElement instanceof HTMLInputElement && 
        document.activeElement !== activeCellRef.current &&
        document.activeElement !== formulaInputRef.current
      )) {
        return
      }

      // Bold: Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        toggleBold()
      }
      
      // Italic: Ctrl/Cmd + I
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault()
        toggleItalic()
      }
      
      // Left align: Ctrl/Cmd + Shift + L
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'l') {
        e.preventDefault()
        setTextAlign('left')
      }
      
      // Center align: Ctrl/Cmd + Shift + E
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'e') {
        e.preventDefault()
        setTextAlign('center')
      }
      
      // Right align: Ctrl/Cmd + Shift + R
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'r') {
        e.preventDefault()
        setTextAlign('right')
      }
      
      // Toggle wrap text: Ctrl/Cmd + Shift + W
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'w') {
        e.preventDefault()
        toggleWrapText()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeCell]) // Dependencies

  // Generate column headers (A, B, C, ..., Z, AA, AB, ...)
  const getDisplayColumns = () => {
    // Ensure we have enough columns
    const totalColumns = columnHeaders.length;
    const maxStartPosition = Math.max(0, totalColumns - 11);
    
    // Constrain scrollPosition to valid range
    const validScrollPosition = Math.min(scrollPosition, maxStartPosition);
    
    let visibleColumns;
    
    // If we have enough columns, slice the visible portion
    if (totalColumns >= 11) {
      visibleColumns = columnHeaders.slice(validScrollPosition, validScrollPosition + 11);
    } else {
      // If we have fewer than 11 columns, include all available columns
      visibleColumns = [...columnHeaders];
      
      // Then pad with placeholder columns to reach exactly 11
      while (visibleColumns.length < 11) {
        // These placeholders will be treated as real columns when clicked
        const nextColName = getColumnName(visibleColumns.length);
        visibleColumns.push(nextColName);
      }
    }
    
    // Always return exactly 11 columns
    return visibleColumns;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar with Formula Bar */}
      <div className="flex items-center p-2 gap-2 border-b">
        {/* Formula Bar */}
        <div className="flex items-center gap-2 flex-1">
          <div className="w-12 text-center font-medium bg-muted rounded px-2 py-1 text-sm text-muted-foreground">
            {activeCell || 'Cell'}
          </div>
          <div className="flex-1">
            <Input
              ref={formulaInputRef}
              value={formulaValue}
              onChange={handleFormulaChange}
              onKeyDown={handleFormulaKeyDown}
              placeholder="Enter a formula or value"
              className="h-8 font-mono"
            />
          </div>
        </div>
        
        {/* Input for file upload - kept hidden but accessible */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".xlsx,.xls,.numbers,.csv"
        />
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm">
          {errorMessage}
        </div>
      )}
      
      {/* Spreadsheet with proper scrollbars */}
      <div 
        className="flex-1 overflow-auto" 
        style={{ 
          overflowX: 'auto', 
          overflowY: 'auto',
          scrollbarWidth: 'thin', // Firefox
          scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent', // Firefox
        }} 
        onScroll={handleScroll}
      >
        <div className="min-w-max"> {/* Ensure content doesn't shrink */}
          <table className="border-collapse w-auto">
            <thead>
              <tr>
                {/* Empty corner cell */}
                <th className="sticky top-0 left-0 z-20 bg-muted/50 border border-border w-10 h-8"></th>
                
                {/* Column headers - always show exactly 11 */}
                {getDisplayColumns().map((col) => (
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
                  
                  {/* Cells - only show the visible columns (11) */}
                  {getDisplayColumns().map((col) => {
                    const cellId = `${col}${rowIndex + 1}`
                    const isActive = activeCell === cellId
                    const cellData = getCellDisplay(rowIndex + 1, col)
                    
                    return (
                      <td
                        key={cellId}
                        className={`border border-border relative p-1 h-8 w-24`}
                        onClick={() => handleCellClick(cellId)}
                        onDoubleClick={() => handleCellDoubleClick(cellId)}
                        style={{
                          ...(isActive ? {
                            boxShadow: 'inset 0 0 0 2px black',
                            padding: '1px',
                            zIndex: 1
                          } : {})
                        }}
                      >
                        {isActive ? (
                          <Input
                            ref={activeCellRef}
                            value={editValue}
                            onChange={handleCellChange}
                            onBlur={handleCellBlur}
                            onKeyDown={(e) => handleKeyDown(e, cellId)}
                            className="h-full w-full border-0 focus-visible:ring-0 p-1 absolute inset-0 bg-transparent"
                            autoFocus
                          />
                        ) : (
                          renderCellContent(cellData)
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
      
      {/* Sheet tabs footer */}
      <div className="border-t border-border bg-muted/20 h-10 flex items-center px-1">
        <div className="flex space-x-1 overflow-x-auto">
          {sheets.map(sheet => (
            <div 
              key={sheet.id}
              className={`group flex items-center h-8 px-3 rounded-t-md cursor-pointer border-t border-l border-r border-border ${
                activeSheetId === sheet.id 
                  ? 'bg-background font-medium' 
                  : 'bg-muted/20 hover:bg-muted/50'
              }`}
              onClick={() => {
                // Only change if clicking a different sheet
                if (activeSheetId !== sheet.id) {
                  setActiveSheetId(sheet.id);
                  setActiveCell(null);
                  setEditValue("");
                }
              }}
              onDoubleClick={() => startRenameSheet(sheet.id)}
            >
              {editingSheetId === sheet.id ? (
                <Input
                  ref={sheetNameInputRef}
                  value={editingSheetName}
                  onChange={(e) => setEditingSheetName(e.target.value)}
                  onBlur={finishRenameSheet}
                  onKeyDown={handleSheetNameKeyDown}
                  className="h-6 w-24 text-xs py-0 px-1"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="text-sm whitespace-nowrap">{sheet.name}</span>
                  {/* Only show delete button if we have more than one sheet */}
                  {sheets.length > 1 && (
                    <button
                      className="ml-2 text-xs opacity-0 group-hover:opacity-100 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSheet(sheet.id);
                      }}
                    >
                      ×
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
          
          {/* Add new sheet button */}
          <button
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted/50"
            onClick={addNewSheet}
            title="Add new sheet"
          >
            <span className="text-lg">+</span>
          </button>
        </div>
      </div>
    </div>
  )
} 