"use client"

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Bold, Italic, Download, Upload } from "lucide-react"
import { useRecoilState } from "recoil"
import { selectedCellRangeState, isChatFocusedState, cmdKTriggeredState } from "../atoms/spreadsheetAtoms"

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
  onCellSelection?: (selectedRange: string, cellData: { [key: string]: CellData }) => void
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

// Constants for sizing
const ROW_HEADER_WIDTH = '40px';
const COLUMN_WIDTH = '128px';

export default function SpreadsheetComponent({ 
  onDataUpdate, 
  onExport, 
  onFormatFunctions,
  onCellSelection 
}: SpreadsheetComponentProps) {
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
  const activeSheet = sheets.find(sheet => sheet.id === activeSheetId)?.data || createEmptyData();
  
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
  const [selectedCells, setSelectedCells] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false) // Track if cell is in edit mode
  const tableRef = useRef<HTMLDivElement>(null) // Reference to the table container
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  // Generate column headers (A, B, C, ..., Z, AA, AB, ...)
  const columnHeaders = Array.from({ length: activeSheet.columns }, (_, i) => getColumnName(i))

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
      if (onDataUpdate && Object.keys(activeSheet.cells).length > 0) {
        console.log('Auto-saving spreadsheet data...');
        // Send all sheets data for saving
        onDataUpdate({ sheets, activeSheetId });
      }
    }, 1500); // Every 1.5 seconds

    return () => clearInterval(saveInterval);
  }, [sheets, activeSheetId, activeSheet.cells, onDataUpdate]);

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

  // Handle upload button click
  const handleUploadClick = () => {
    // This should always trigger the file input click, with no restrictions
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
    const files = event.target.files
    
    // Reset any previous error message
    setErrorMessage(null)
    
    if (!files || files.length === 0) {
      setErrorMessage('No file selected')
      return
    }
    
    const file = files[0]
    setFileName(file.name)
    
    // Reset the input value to allow selecting the same file again
    event.target.value = ''
    
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    if (extension === 'csv') {
      parseCSV(file)
    } else if (['xlsx', 'xls', 'numbers'].includes(extension || '')) {
      parseExcel(file)
    } else {
      setErrorMessage('Unsupported file format. Please upload a CSV, Excel, or Numbers file.')
    }
  }

  // Add rows if needed
  const addRowsIfNeeded = (rowIndex: number) => {
    if (rowIndex >= activeSheet.rows - 5) { // If we're within 5 rows of the end
      const newRows = activeSheet.rows + 10 // Add 10 more rows
      const newData: SpreadsheetData = {
        ...activeSheet,
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
    if (colIndex >= activeSheet.columns - 5 || colIndex >= activeSheet.columns) {
      // Add 5 more columns or enough to include the requested column
      const neededColumns = Math.max(activeSheet.columns + 5, colIndex + 5);
      const newData: SpreadsheetData = {
        ...activeSheet,
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

  // Handle cell change (when editing cell directly)
  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setEditValue(newValue)
    setFormulaValue(newValue) // Keep formula bar in sync with cell edit
  }

  // Add Recoil state for selected cell range
  const [recoilSelectedCellRange, setRecoilSelectedCellRange] = useRecoilState(selectedCellRangeState);
  const [isChatFocused] = useRecoilState(isChatFocusedState);
  const [cmdKTriggered, setCmdKTriggered] = useRecoilState(cmdKTriggeredState);
  
  // Function to convert cell range to string reference for chat
  const updateSelectedCellRangeForChat = useCallback(() => {
    // Only update the cell range in Recoil state AFTER Cmd+K is pressed,
    // not automatically when cells are selected
    if (!selectedCells || selectedCells.length === 0) return;
    
    let rangeString = "";
    if (selectedCells.length === 1) {
      // Single cell selection - just use the cell ID directly
      rangeString = selectedCells[0];
    } else {
      // Range selection - use first and last cell for range
      rangeString = `${selectedCells[0]}:${selectedCells[selectedCells.length - 1]}`;
    }
    
    // Don't auto-update recoil state here - only on Cmd+K
    // This is now handled in the Cmd+K keyboard shortcut handler
  }, [selectedCells]);

  // Update cell range when selection changes
  // Don't automatically update cell range when selection changes
  // Remove the automatic update effect to ensure selections don't leak to chat:
  // useEffect(() => {
  //   updateSelectedCellRangeForChat();
  // }, [selectedCells, updateSelectedCellRangeForChat]);

  // Update handleCellClick to completely separate spreadsheet and chat functionality
  const handleCellClick = (cellId: string, forceEdit = false) => {
    // Only take action if the cell is different from the active cell or forceEdit is true
    if (cellId !== activeCell || forceEdit) {
      // Always update selection and active cell on single click
      setSelectedCells([cellId]);
      setActiveCell(cellId);
      
      // Get cell data and update formula bar for consistency
      const cellData = activeSheet.cells[cellId] || { value: '', isBold: false, isItalic: false, textAlign: 'left', wrapText: false };
      const cellValue = cellData.value || '';
      setFormulaValue(cellValue);
      setEditValue(cellValue);
      
      // Only enter edit mode if forced (e.g., double-click) or if user clicks an already selected cell
      if (forceEdit) {
        setIsEditing(true);
        // Focus on the cell after a short delay
        setTimeout(() => {
          if (activeCellRef.current) {
            activeCellRef.current.focus();
          }
        }, 10);
      } else {
        // For single click, just select but don't edit
        setIsEditing(false);
      }
      
      // Make sure the table gets focus for keyboard navigation
      if (tableRef.current && !isEditing) {
        tableRef.current.focus();
      }
    } else if (cellId === activeCell && !isEditing) {
      // If clicking on the already active cell, enter edit mode
      setIsEditing(true);
      setTimeout(() => {
        if (activeCellRef.current) {
          activeCellRef.current.focus();
        }
      }, 10);
    }
  }

  // Handle cell double click - always enter edit mode
  const handleCellDoubleClick = (cellId: string) => {
    // Always enable cell editing on double-click
    handleCellClick(cellId, true);
    
    // Ensure we enter edit mode immediately
    setIsEditing(true);
  }

  // Handle formula bar change
  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setFormulaValue(newValue)
    
    // If we have an active cell, also update the edit value to keep in sync
    if (activeCell) {
      setEditValue(newValue)
    }
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
        // Otherwise move focus back to the active cell but exit edit mode
        setIsEditing(false)
        if (activeCellRef.current) {
          activeCellRef.current.focus()
        }
      }
    } else if (e.key === 'Escape') {
      // On escape, revert to previous value
      if (activeCell) {
        const currentData = activeSheet
        const cellData = currentData.cells[activeCell] || { value: '', isBold: false, isItalic: false, textAlign: 'left', wrapText: false }
        setFormulaValue(cellData.value)
        setEditValue(cellData.value)
        setIsEditing(false)
      }
    }
  }

  // Handle clicks outside the cell to exit edit mode and save
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // If we're editing and the click is outside the active cell and formula input
      if (isEditing && activeCell && activeCellRef.current && formulaInputRef.current) {
        // Check if the click was inside the active cell or formula bar
        const clickedActiveCell = activeCellRef.current.contains(e.target as Node)
        const clickedFormulaBar = formulaInputRef.current.contains(e.target as Node)
        const clickedInTable = tableRef.current?.contains(e.target as Node) || false
        
        // If the click was not in the active cell or formula bar
        if (!clickedActiveCell && !clickedFormulaBar) {
          // Save the current value if editing
          updateCellValue(activeCell, editValue)
          setIsEditing(false)
          
          // Only clear active cell if clicked outside the table entirely
          if (!clickedInTable) {
            setActiveCell(null)
          }
        }
      }
    }
    
    document.addEventListener('mousedown', handleDocumentClick)
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
    }
  }, [isEditing, activeCell, editValue])

  // Handle cell blur (when clicking away from an active cell)
  const handleCellBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Prevent race conditions by checking the relatedTarget
    const relatedTarget = e.relatedTarget as HTMLElement
  
    // Don't process blur if focusing another element within the same application
    // (like formula bar or within the same cell)
    if (
      relatedTarget &&
      (relatedTarget === formulaInputRef.current || 
       relatedTarget === activeCellRef.current)
    ) {
      return
    }
  
    // Only apply changes if we're in edit mode
    if (isEditing && activeCell) {
      // Save the current value
      updateCellValue(activeCell, editValue)
    
      // Keep editing mode if focus is moving within our app (debounce brief focus loss)
      if (!relatedTarget || !tableRef.current?.contains(relatedTarget)) {
        setIsEditing(false)
      }
    }
  }

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, cellId: string) => {
    // Always handle events when a cell input is directly focused
    // (these events happen when the user is actually editing a cell)
    
    // Extract column name and row number correctly
    const match = cellId.match(/([A-Z]+)(\d+)/)
    if (!match) return;
    
    const colName = match[1]
    const row = parseInt(match[2])
    
    // Get column index from name (supporting multi-letter columns)
    const colIndex = getColumnIndex(colName)
    
    // Get the last visible column index
    const visibleEndIndex = scrollPosition + 10;
    
    if (e.key === 'Escape') {
      // Exit edit mode without saving changes
      const cellData = activeSheet.cells[cellId] || { value: '', isBold: false, isItalic: false, textAlign: 'left', wrapText: false }
      setEditValue(cellData.value) // Revert to original value
      setFormulaValue(cellData.value)
      setIsEditing(false)
      e.preventDefault()
    } else if (e.key === 'Enter') {
      // Save current cell and move to the cell below
      e.preventDefault()
      
      // Save current cell
      updateCellValue(cellId, editValue)
      
      if (row < activeSheet.rows) {
        const nextCellId = `${colName}${row + 1}`
        setActiveCell(nextCellId)
        setEditValue(activeSheet.cells[nextCellId]?.value || "")
        setFormulaValue(activeSheet.cells[nextCellId]?.value || "") // Update formula bar
        
        // Only auto-enter edit mode if they were in edit mode
        setIsEditing(isEditing)
        
        // Focus the next cell if editing
        if (isEditing) {
          requestAnimationFrame(() => {
            if (activeCellRef.current) {
              activeCellRef.current.focus()
            }
          })
        }
        
        // Check if we need to add more rows
        addRowsIfNeeded(row + 1)
      } else {
        // At the last row, just exit edit mode
        setIsEditing(false)
      }
    } else if (e.key === 'Tab') {
      // Move to the next cell to the right
      e.preventDefault()
      
      // Save current cell
      updateCellValue(cellId, editValue)
      
      if (colIndex < activeSheet.columns - 1) {
        const nextCol = getColumnName(colIndex + 1) // Get next column name
        const nextCellId = `${nextCol}${row}`
        setActiveCell(nextCellId)
        setEditValue(activeSheet.cells[nextCellId]?.value || "")
        setFormulaValue(activeSheet.cells[nextCellId]?.value || "") // Update formula bar
        
        // Only auto-enter edit mode if they were in edit mode
        setIsEditing(isEditing)
        
        // Focus the next cell if editing
        if (isEditing) {
          requestAnimationFrame(() => {
            if (activeCellRef.current) {
              activeCellRef.current.focus()
            }
          })
        }
        
        // Check if we're at the edge of visible area
        if (colIndex === visibleEndIndex) {
          // Scroll to show the next column
          setScrollPosition(Math.min(activeSheet.columns - 11, scrollPosition + 1))
        }
        
        // Check if we need to add more columns
        addColumnsIfNeeded(colIndex + 1)
      } else if (row < activeSheet.rows) {
        // Move to the first cell of the next row
        const nextCellId = `A${row + 1}`
        setActiveCell(nextCellId)
        setEditValue(activeSheet.cells[nextCellId]?.value || "")
        setFormulaValue(activeSheet.cells[nextCellId]?.value || "") // Update formula bar
        
        // Only auto-enter edit mode if they were in edit mode
        setIsEditing(isEditing)
        
        // Focus the next cell if editing
        if (isEditing) {
          requestAnimationFrame(() => {
            if (activeCellRef.current) {
              activeCellRef.current.focus()
            }
          })
        }
        
        // Reset horizontal scroll position to the beginning
        setScrollPosition(0)
        
        // Check if we need to add more rows
        addRowsIfNeeded(row + 1)
      } else {
        // At the last cell, just exit edit mode
        setIsEditing(false)
      }
    } else if (e.key === 'ArrowUp' && !e.shiftKey) {
      // Move to the cell above
      e.preventDefault()
      
      // Save current cell
      updateCellValue(cellId, editValue)
      
      if (row > 1) {
        const nextCellId = `${colName}${row - 1}`
        setActiveCell(nextCellId)
        setEditValue(activeSheet.cells[nextCellId]?.value || "")
        setFormulaValue(activeSheet.cells[nextCellId]?.value || "") // Update formula bar
        
        // Only auto-enter edit mode if they were in edit mode and not using keyboard navigation
        setIsEditing(false) // Exit edit mode for keyboard navigation
      }
    } else if (e.key === 'ArrowDown' && !e.shiftKey) {
      // Move to the cell below
      e.preventDefault()
      
      // Save current cell
      updateCellValue(cellId, editValue)
      
      if (row < activeSheet.rows) {
        const nextCellId = `${colName}${row + 1}`
        setActiveCell(nextCellId)
        setEditValue(activeSheet.cells[nextCellId]?.value || "")
        setFormulaValue(activeSheet.cells[nextCellId]?.value || "") // Update formula bar
        
        // Only auto-enter edit mode if they were in edit mode and not using keyboard navigation
        setIsEditing(false) // Exit edit mode for keyboard navigation
        
        // Check if we need to add more rows
        addRowsIfNeeded(row + 1)
      }
    } else if (e.key === 'ArrowLeft' && !e.shiftKey) {
      // Move to the cell to the left
      e.preventDefault()
      
      // Save current cell
      updateCellValue(cellId, editValue)
      
      if (colIndex > 0) {
        const nextCol = getColumnName(colIndex - 1) // Get previous column name
        const nextCellId = `${nextCol}${row}`
        setActiveCell(nextCellId)
        setEditValue(activeSheet.cells[nextCellId]?.value || "")
        setFormulaValue(activeSheet.cells[nextCellId]?.value || "") // Update formula bar
        
        // Only auto-enter edit mode if they were in edit mode and not using keyboard navigation
        setIsEditing(false) // Exit edit mode for keyboard navigation
      }
    } else if (e.key === 'ArrowRight' && !e.shiftKey) {
      // Move to the cell to the right
      e.preventDefault()
      
      // Save current cell
      updateCellValue(cellId, editValue)
      
      if (colIndex < activeSheet.columns - 1) {
        const nextCol = getColumnName(colIndex + 1) // Get next column name
        const nextCellId = `${nextCol}${row}`
        setActiveCell(nextCellId)
        setEditValue(activeSheet.cells[nextCellId]?.value || "")
        setFormulaValue(activeSheet.cells[nextCellId]?.value || "") // Update formula bar
        
        // Only auto-enter edit mode if they were in edit mode and not using keyboard navigation
        setIsEditing(false) // Exit edit mode for keyboard navigation
        
        // Check if we're at the edge of visible area
        if (colIndex === visibleEndIndex) {
          // Scroll to show the next column
          setScrollPosition(Math.min(activeSheet.columns - 11, scrollPosition + 1))
        }
        
        // Check if we need to add more columns
        addColumnsIfNeeded(colIndex + 1)
      }
    }
  }

  // Update cell value and formatting function
  const updateCellValue = (cellId: string, value: string) => {
    const newCells = { ...activeSheet.cells }
    
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
    
    const newData: SpreadsheetData = { ...activeSheet, cells: newCells }
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
    const cell = activeSheet.cells[cellId]
    
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

  // Render cell content with proper formatting
  const renderCellContent = (cellData: CellData): string => {
    if (!cellData) return '';
    
    let content = cellData.value || '';
    
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
          const resolvedExpression = resolveCellReferences(expression, activeSheet.cells)
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
    
    // Escape HTML for safety (skip for formulas that have already evaluated to #ERROR)
    if (content !== '#ERROR') {
      content = content.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Apply text formatting
    if (cellData.isBold) {
      content = `<strong>${content}</strong>`;
    }
    
    if (cellData.isItalic) {
      content = `<em>${content}</em>`;
    }
    
    // Handle numeric alignment automatically if it's a number
    const isNumeric = !isNaN(Number(content)) && content.trim() !== '';
    const alignment = cellData.textAlign || (isNumeric ? 'right' : 'left');
    
    // Add wrapper span with alignment style
    return `<span style="display:block; width:100%; height:100%; overflow:hidden; text-overflow:ellipsis; text-align:${alignment}; white-space:${cellData.wrapText ? 'normal' : 'nowrap'};">${content}</span>`;
  }

  // Toggle bold for active cell
  const toggleBold = useCallback(() => {
    if (!activeCell) return

    const newCells = { ...activeSheet.cells }
    
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
    
    const newData = { ...activeSheet, cells: newCells }
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
  }, [activeCell, activeSheet, activeSheetId, onDataUpdate, sheets]);

  // Toggle italic for active cell
  const toggleItalic = useCallback(() => {
    if (!activeCell) return

    const newCells = { ...activeSheet.cells }
    
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
    
    const newData = { ...activeSheet, cells: newCells }
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
  }, [activeCell, activeSheet, activeSheetId, onDataUpdate, sheets]);

  // Set text alignment for active cell
  const setTextAlign = useCallback((alignment: 'left' | 'center' | 'right') => {
    if (!activeCell) return

    const newCells = { ...activeSheet.cells }
    
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
    
    const newData = { ...activeSheet, cells: newCells }
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
  }, [activeCell, activeSheet, activeSheetId, onDataUpdate, sheets]);

  // Toggle wrap text for active cell
  const toggleWrapText = useCallback(() => {
    if (!activeCell) return

    const newCells = { ...activeSheet.cells }
    
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
    
    const newData = { ...activeSheet, cells: newCells }
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
  }, [activeCell, activeSheet, activeSheetId, onDataUpdate, sheets]);

  // Handle cell selection (drag)
  const [selectionStart, setSelectionStart] = useState<string | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  
  const handleSelectionStart = (cellId: string) => {
    setSelectionStart(cellId)
    setIsSelecting(true)
    setSelectedCells([cellId])
  }
  
  const handleSelectionMove = (cellId: string) => {
    if (!isSelecting || !selectionStart) return
    
    // Get row and column for start and current cells
    const startMatch = selectionStart.match(/([A-Z]+)(\d+)/)
    const currMatch = cellId.match(/([A-Z]+)(\d+)/)
    
    if (!startMatch || !currMatch) return
    
    const startCol = startMatch[1]
    const startRow = parseInt(startMatch[2])
    const currCol = currMatch[1]
    const currRow = parseInt(currMatch[2])
    
    // Calculate the selection range
    const startColIndex = getColumnIndex(startCol)
    const currColIndex = getColumnIndex(currCol)
    
    const minColIndex = Math.min(startColIndex, currColIndex)
    const maxColIndex = Math.max(startColIndex, currColIndex)
    const minRow = Math.min(startRow, currRow)
    const maxRow = Math.max(startRow, currRow)
    
    // Create an array of all cells in the selection range
    const selectedRange: string[] = []
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minColIndex; col <= maxColIndex; col++) {
        const colName = getColumnName(col)
        selectedRange.push(`${colName}${row}`)
      }
    }
    
    setSelectedCells(selectedRange)
  }
  
  const handleSelectionEnd = () => {
    setIsSelecting(false)
    
    // If cells are selected, prepare a range description
    if (selectedCells.length > 0 && onCellSelection) {
      // Format the range (e.g. "A1:C3")
      let rangeDescription = ""
      
      if (selectedCells.length === 1) {
        rangeDescription = selectedCells[0]
      } else {
        // Find min and max coordinates
        const cellCoords = selectedCells.map(cell => {
          const match = cell.match(/([A-Z]+)(\d+)/)
          if (!match) return { col: 0, row: 0 }
          return {
            col: getColumnIndex(match[1]),
            row: parseInt(match[2])
          }
        })
        
        const minCol = Math.min(...cellCoords.map(c => c.col))
        const maxCol = Math.max(...cellCoords.map(c => c.col))
        const minRow = Math.min(...cellCoords.map(c => c.row))
        const maxRow = Math.max(...cellCoords.map(c => c.row))
        
        const topLeft = `${getColumnName(minCol)}${minRow}`
        const bottomRight = `${getColumnName(maxCol)}${maxRow}`
        
        rangeDescription = `${topLeft}:${bottomRight}`
      }
      
      onCellSelection(rangeDescription, activeSheet.cells)
    }
  }

  // Set up keyboard shortcuts for formatting, Cmd+K for selection, and Enter for editing
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if inside an input field that isn't the cell editor or formula input
    // This ensures chat input can handle its own keyboard events
    if (
      document.activeElement instanceof HTMLInputElement && 
      document.activeElement !== activeCellRef.current &&
      document.activeElement !== formulaInputRef.current
    ) {
      // Allow keypresses to go to other inputs (e.g., chat input)
      return
    }

    // Skip if focus is inside any chat-related element
    const chatElements = document.querySelectorAll('.ai-chat-panel, .ai-chat-input');
    for (const el of chatElements) {
      if (el.contains(document.activeElement)) {
        return;
      }
    }

    // Enter to start editing active cell
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey && activeCell && !isEditing) {
      e.preventDefault()
      setIsEditing(true)
      setTimeout(() => {
        if (activeCellRef.current) {
          activeCellRef.current.focus()
        }
      }, 10)
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
    
    // Cmd+K to send selected cells to chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      
      // Set the cmdKTriggered state to true to inform other components
      setCmdKTriggered(true);
      
      // Find if there's a chat input to interact with
      const chatInput = document.querySelector('.ai-chat-input') as HTMLElement;
      
      // Only proceed if there's a chat interface available and we have cells selected
      if (chatInput && (selectedCells.length > 0 || activeCell)) {
        // Generate the range string here, rather than relying on automatic updates
        let range = "";
        let cellData: { [key: string]: CellData } = {};
        
        if (selectedCells.length > 1) {
          // Format as a range: first:last
          range = `${selectedCells[0]}:${selectedCells[selectedCells.length - 1]}`;
          
          // Collect data for all selected cells
          selectedCells.forEach(cellId => {
            if (activeSheet.cells[cellId]) {
              cellData[cellId] = activeSheet.cells[cellId];
            }
          });
        } else if (activeCell) {
          // Single cell reference
          range = activeCell;
          if (activeSheet.cells[activeCell]) {
            cellData[activeCell] = activeSheet.cells[activeCell];
          }
        }
        
        // Only now update the selected cell range in Recoil state
        setRecoilSelectedCellRange(range);
        
        if (onCellSelection) {
          // Send the selected range and cell data to the chat
          onCellSelection(range, cellData);
          
          // Focus the chat input
          setTimeout(() => {
            chatInput.focus();
            
            // Reset the cmdKTriggered state after a short delay
            setTimeout(() => {
              setCmdKTriggered(false);
            }, 200);
          }, 50);
        }
      } else {
        // Reset the flag if we couldn't process the command
        setCmdKTriggered(false);
      }
    }
  }, [activeCell, isEditing, toggleBold, toggleItalic, setTextAlign, toggleWrapText, 
      selectedCells, setCmdKTriggered, setRecoilSelectedCellRange, onCellSelection]);

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleGlobalKeyDown]);

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

  const getCellClasses = (cellId: string, cellData: CellData) => {
    const classes = ['border', 'border-border', 'p-1', 'h-8', 'focus:outline-none', 'focus:ring-1', 'focus:ring-primary']
    
    // Add text alignment
    if (cellData.textAlign === 'center') {
      classes.push('text-center')
    } else if (cellData.textAlign === 'right') {
      classes.push('text-right')
    }
    
    // Add bold if needed
    if (cellData.isBold) {
      classes.push('font-bold')
    }
    
    // Add italic if needed
    if (cellData.isItalic) {
      classes.push('italic')
    }
    
    // Add wrap text if needed
    if (cellData.wrapText) {
      classes.push('whitespace-normal')
    } else {
      classes.push('whitespace-nowrap')
    }
    
    // Add active cell highlighting
    if (cellId === activeCell) {
      classes.push('ring-2 ring-primary z-10')
    }
    
    // Add selection highlighting
    if (selectedCells.includes(cellId)) {
      classes.push('bg-primary/10')
    }
    
    return classes.join(' ')
  }

  // Helper function to check if a cell is in a selected range
  const isInRange = (cellId: string, selectedRange: string[]): boolean => {
    if (selectedRange.length <= 1) return false;
    
    // Extract the start and end cells
    const startCell = selectedRange[0];
    const endCell = selectedRange[selectedRange.length - 1];
    
    // Parse the cell coordinates
    const startMatch = startCell.match(/([A-Z]+)(\d+)/);
    const endMatch = endCell.match(/([A-Z]+)(\d+)/);
    const cellMatch = cellId.match(/([A-Z]+)(\d+)/);
    
    if (!startMatch || !endMatch || !cellMatch) return false;
    
    const startCol = getColumnIndex(startMatch[1]);
    const startRow = parseInt(startMatch[2]);
    const endCol = getColumnIndex(endMatch[1]);
    const endRow = parseInt(endMatch[2]);
    const cellCol = getColumnIndex(cellMatch[1]);
    const cellRow = parseInt(cellMatch[2]);
    
    // Check if the cell is within the range
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    
    return cellCol >= minCol && cellCol <= maxCol && cellRow >= minRow && cellRow <= maxRow;
  };

  // Add mousedown handler to improve cell selection and editing
  const handleCellMouseDown = (e: React.MouseEvent, cellId: string) => {
    // Prevent default to avoid losing focus
    e.preventDefault();
    
    // Handle selection start for dragging
    handleSelectionStart(cellId);
    
    // Make sure the table has focus for keyboard events
    if (tableRef.current) {
      tableRef.current.focus();
    }
  }

  // Render a single cell
  const renderCell = (rowIndex: number, colIndex: number) => {
    const colName = getColumnName(colIndex)
    const cellId = `${colName}${rowIndex}`
    
    const cellData = activeSheet.cells[cellId] || { value: '', isBold: false, isItalic: false, textAlign: 'left', wrapText: false }
    const isActive = activeCell === cellId
    const isSelected = selectedCells.includes(cellId)
    
    // Determine if the cell is part of the selected range
    const isInSelectedRange = isInRange(cellId, selectedCells)
    
    // Determine whether cell is hovered
    const isHovered = hoveredCell === cellId
   
    return (
      <td
        key={cellId}
        id={cellId}
        className={`
          relative border border-gray-300 p-0 h-9 min-h-9 max-h-9 w-32 min-w-32 max-w-32 box-border
          transition-colors
          ${isSelected ? 'bg-blue-100' : ''}
          ${isInSelectedRange ? 'bg-blue-50' : ''}
          ${isHovered && !isActive ? 'bg-gray-50' : ''}
          ${!isActive && !isSelected && !isInSelectedRange && !isHovered ? 'hover:bg-gray-50' : ''}
          cursor-cell
        `}
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          handleCellClick(cellId);
        }}
        onMouseDown={(e) => handleCellMouseDown(e, cellId)}
        onMouseEnter={() => {
          // Handle both selection move and hover state
          if (isSelecting) handleSelectionMove(cellId);
          setHoveredCell(cellId);
        }}
        onMouseUp={() => {
          if (isSelecting) {
            handleSelectionEnd();
            // Ensure the clicked cell becomes active
            setActiveCell(cellId);
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          handleCellDoubleClick(cellId);
        }}
        onMouseLeave={() => setHoveredCell(null)}
      >
        {/* Active cell indicator - ensure it doesn't interfere with clicks */}
        {isActive && (
          <div 
            className="absolute -inset-[1px] border-2 border-blue-500 pointer-events-none" 
            style={{ zIndex: 1 }} // Explicitly set z-index
          />
        )}
        
        {/* Cell content */}
        <div className="relative w-full h-full">
          {isActive && isEditing ? (
            <Input
              ref={activeCellRef}
              value={editValue}
              onChange={handleCellChange}
              onBlur={handleCellBlur}
              onKeyDown={(e) => handleKeyDown(e, cellId)}
              className="h-full w-full border-0 focus-visible:ring-0 p-1 absolute inset-0 bg-transparent focus:outline-none"
              style={{ zIndex: 10 }} // Explicitly set z-index
              autoFocus
            />
          ) : (
            <div 
              className="h-full w-full overflow-hidden p-1 cursor-cell"
              dangerouslySetInnerHTML={{ __html: renderCellContent(cellData) }}
            />
          )}
        </div>
      </td>
    )
  }

  // Use a layout effect to ensure focus happens after DOM updates
  useLayoutEffect(() => {
    if (isEditing && activeCell && activeCellRef.current) {
      // Use immediate focus with no delay
      activeCellRef.current.focus()
      
      // Select all text immediately - this is key for good UX
      try {
        activeCellRef.current.select()
      } catch (e) {
        console.warn('Could not select text in cell input')
      }
    }
  }, [isEditing, activeCell])

  // Update the keyboard navigation handling to ensure proper arrow key behavior
  const handleTableKeydown = (e: KeyboardEvent) => {
    // If we're inside an input that isn't part of the spreadsheet, ignore
    if (
      document.activeElement instanceof HTMLInputElement && 
      document.activeElement !== activeCellRef.current &&
      document.activeElement !== formulaInputRef.current
    ) {
      return;
    }
    
    // Don't handle keys when editing a cell
    if (isEditing) {
      return;
    }
    
    // For arrow keys, we need an active cell to navigate from
    // If there's no active cell, select A1
    if ((!activeCell || selectedCells.length === 0) && 
        (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
         e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      const defaultCell = 'A1';
      setActiveCell(defaultCell);
      setSelectedCells([defaultCell]);
      setHoveredCell(defaultCell);
      return;
    }
    
    if (!activeCell) return;
    
    // Get the current cell coordinates
    const match = activeCell.match(/([A-Z]+)(\d+)/);
    if (!match) return;
    
    const colName = match[1];
    const row = parseInt(match[2]);
    const colIndex = getColumnIndex(colName);
    
    // Handle arrow keys for navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (row > 1) {
        const nextCellId = `${colName}${row - 1}`;
        setActiveCell(nextCellId);
        setSelectedCells([nextCellId]);
        setHoveredCell(nextCellId);
        setFormulaValue(activeSheet.cells[nextCellId]?.value || "");
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextCellId = `${colName}${row + 1}`;
      setActiveCell(nextCellId);
      setSelectedCells([nextCellId]);
      setHoveredCell(nextCellId);
      setFormulaValue(activeSheet.cells[nextCellId]?.value || "");
      
      // Check if we need to add more rows
      addRowsIfNeeded(row + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (colIndex > 0) {
        const nextCol = getColumnName(colIndex - 1);
        const nextCellId = `${nextCol}${row}`;
        setActiveCell(nextCellId);
        setSelectedCells([nextCellId]);
        setHoveredCell(nextCellId);
        setFormulaValue(activeSheet.cells[nextCellId]?.value || "");
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextCol = getColumnName(colIndex + 1);
      const nextCellId = `${nextCol}${row}`;
      setActiveCell(nextCellId);
      setSelectedCells([nextCellId]);
      setHoveredCell(nextCellId);
      setFormulaValue(activeSheet.cells[nextCellId]?.value || "");
      
      // Check if we need to add more columns
      addColumnsIfNeeded(colIndex + 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Enter starts editing the current cell
      setIsEditing(true);
      setTimeout(() => {
        if (activeCellRef.current) {
          activeCellRef.current.focus();
        }
      }, 10);
    }
    
    // Only handle keyboard events when there's an active cell and we're not already editing
    if (activeCell && !isEditing) {
      // If user types any printable character when a cell is selected, enter edit mode
      // and start with that character
      if (
        e.key.length === 1 && 
        !e.ctrlKey && 
        !e.metaKey && 
        !e.altKey &&
        !e.shiftKey // Don't trigger on shift keys
      ) {
        e.preventDefault();
        setIsEditing(true);
        setEditValue(e.key);
        setFormulaValue(e.key);
        
        // Focus will happen through the useLayoutEffect
        setTimeout(() => {
          if (activeCellRef.current) {
            activeCellRef.current.focus();
          }
        }, 10);
      }
      // If user presses F2, enter edit mode with current content
      else if (e.key === 'F2') {
        e.preventDefault();
        setIsEditing(true);
        setTimeout(() => {
          if (activeCellRef.current) {
            activeCellRef.current.focus();
          }
        }, 10);
      }
    }
  }

  // Enhance the table event handling to ensure it can receive keyboard focus
  useEffect(() => {
    if (tableRef.current) {
      // Make sure the table can receive focus
      tableRef.current.tabIndex = 0;
      tableRef.current.addEventListener('keydown', handleTableKeydown);
      
      // Ensure table has focus on component mount
      tableRef.current.focus();
    }
    
    return () => {
      if (tableRef.current) {
        tableRef.current.removeEventListener('keydown', handleTableKeydown);
      }
    }
  }, [activeCell, activeSheet, isEditing, selectedCells]);

  return (
    <div className="flex flex-col h-full spreadsheet-container" tabIndex={0}>
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
        ref={tableRef}
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
              {Array.from({ length: 25 }).map((_, rowIndex) => (
                <tr key={rowIndex + 1} className="h-9">
                  {/* Row headers */}
                  <th 
                    className="sticky left-0 z-20 bg-gray-100 border border-gray-300 font-normal text-sm text-center"
                    style={{ minWidth: ROW_HEADER_WIDTH, width: ROW_HEADER_WIDTH }}
                  >
                    {rowIndex + 1}
                  </th>
                  
                  {/* Cells - only show the visible columns (11) */}
                  {getDisplayColumns().map((col) => renderCell(rowIndex + 1, getColumnIndex(col)))}
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
              }`
            }
            onClick={() => setActiveSheetId(sheet.id)}
          >
            {sheet.name}
          </div>
          ))}
        </div>
      </div>
    </div>
  )
}