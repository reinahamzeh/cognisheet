import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useUser } from './UserContext';
import { saveSpreadsheet } from '../services/supabase.ts';

// Create context
const SpreadsheetContext = createContext();

// Custom hook to use the spreadsheet context
export const useSpreadsheet = () => useContext(SpreadsheetContext) || {};

export const SpreadsheetProvider = ({ children, onDataLoaded, onDataReset }) => {
  const [spreadsheetData, setSpreadsheetData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [selectedRange, setSelectedRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [charts, setCharts] = useState([]);
  const [activeChart, setActiveChart] = useState(null);
  const fileInputRef = useRef(null);
  const { user, isSignedIn } = useUser() || {};

  // Call onDataLoaded when rows are updated
  useEffect(() => {
    if (rows?.length > 0 && onDataLoaded) {
      console.log('Rows loaded, calling onDataLoaded callback');
      onDataLoaded();
    }
  }, [rows, onDataLoaded]);

  // Reset save success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Function to create a new empty spreadsheet
  const createNewSpreadsheet = () => {
    console.log('Creating new spreadsheet');
    setLoading(true);
    setError(null);

    try {
      // Create default headers
      const defaultHeaders = ['A', 'B', 'C', 'D', 'E'];
      
      // Create empty rows (5 by default)
      const emptyRows = Array(5).fill().map(() => {
        const row = {};
        defaultHeaders.forEach(header => {
          row[header] = '';
        });
        return row;
      });
      
      // Set the data
      setHeaders(defaultHeaders);
      setRows(emptyRows);
      setSpreadsheetData({
        data: emptyRows,
        meta: { fields: defaultHeaders }
      });
      
      // Set file name and type
      setFileName('New Spreadsheet');
      setFileType('csv');
      
      console.log('New spreadsheet created successfully');
      
      // Clear any selected range
      setSelectedRange(null);
      
      // Clear any charts
      setCharts([]);
      setActiveChart(null);
    } catch (err) {
      console.error('Error creating new spreadsheet:', err);
      setError(`Error creating new spreadsheet: ${err.message}`);
    } finally {
      setLoading(false);
    }
    
    // If onDataLoaded callback is provided, it will be called via the useEffect
  };

  // Function to add a new chart
  const addChart = (chartData) => {
    if (!chartData) return;
    
    console.log('Adding new chart:', chartData);
    
    // Add the chart to the charts array
    setCharts(prevCharts => {
      // Check if a chart with the same ID already exists
      const existingChartIndex = prevCharts.findIndex(chart => chart.id === chartData.id);
      
      if (existingChartIndex >= 0) {
        // Update existing chart
        const updatedCharts = [...prevCharts];
        updatedCharts[existingChartIndex] = chartData;
        return updatedCharts;
      } else {
        // Add new chart
        return [...prevCharts, chartData];
      }
    });
    
    // Set as active chart
    setActiveChart(chartData.id);
  };

  // Function to remove a chart
  const removeChart = (chartId) => {
    setCharts(prevCharts => prevCharts.filter(chart => chart.id !== chartId));
    
    // If the active chart is removed, set active to null or the first available chart
    if (activeChart === chartId) {
      setActiveChart(charts.length > 1 ? charts[0]?.id : null);
    }
  };

  // Function to get a chart by ID
  const getChartById = (chartId) => {
    return charts.find(chart => chart.id === chartId);
  };

  // Function to get all charts
  const getAllCharts = () => {
    return charts;
  };

  // Function to set the active chart
  const setActiveChartById = (chartId) => {
    setActiveChart(chartId);
  };

  // Function to handle file upload via web input
  const handleFileUpload = () => {
    // For web, we'll use a hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection from input
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    
    // Get file name and extension
    const name = file.name;
    const type = name.split('.').pop().toLowerCase();
    
    setFileName(name);
    setFileType(type);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target.result;
      
      try {
        // Parse file based on type
        if (type === 'csv') {
          parseCSV(content);
        } else if (['xls', 'xlsx', 'numbers'].includes(type)) {
          parseExcel(content);
        } else {
          throw new Error('Unsupported file type');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setLoading(false);
    };
    
    if (type === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Parse CSV file
  const parseCSV = (content) => {
    console.log('Parsing CSV file');
    Papa.parse(content, {
      header: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          console.log(`CSV parsed successfully: ${results.data.length} rows, ${results.meta.fields.length} columns`);
          setHeaders(results.meta.fields || []);
          setRows(results.data);
          setSpreadsheetData(results);
        } else {
          setError('No data found in the CSV file');
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  // Parse Excel or Numbers file
  const parseExcel = (content) => {
    console.log('Parsing Excel file');
    try {
      const data = new Uint8Array(content);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Process all sheets
      const allSheets = {};
      let totalRows = 0;
      
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        
        // Get the range of the sheet
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        const maxRow = range.e.r + 1;
        const maxCol = range.e.c + 1;
        
        // Create headers array (A, B, C, etc.)
        const headers = Array.from({ length: maxCol }, (_, i) => 
          XLSX.utils.encode_col(i)
        );
        
        // Convert to array format
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '', // Use empty string for empty cells
          raw: false  // Convert everything to string
        });
        
        // Ensure all rows have the same number of columns
        const rows = jsonData.map(row => {
          const processedRow = {};
          headers.forEach((header, index) => {
            processedRow[header] = String(row[index] || '');
          });
          return processedRow;
        });
        
        if (rows.length > 0) {
          allSheets[sheetName] = {
            headers,
            rows,
            name: sheetName
          };
          totalRows += rows.length;
        }
      });
      
      if (Object.keys(allSheets).length > 0) {
        console.log(`Excel parsed successfully: ${totalRows} total rows across ${Object.keys(allSheets).length} sheets`);
        
        // For now, use the first sheet
        const firstSheet = allSheets[workbook.SheetNames[0]];
        setHeaders(firstSheet.headers);
        setRows(firstSheet.rows);
        setSpreadsheetData({ 
          data: firstSheet.rows, 
          meta: { 
            fields: firstSheet.headers,
            sheets: allSheets
          }
        });
      } else {
        setError('No data found in the file');
      }
    } catch (err) {
      console.error('Error parsing Excel:', err);
      setError(`Error parsing file: ${err.message}`);
    }
  };

  // Function to handle cell selection
  const handleCellSelection = (range) => {
    setSelectedRange(range);
  };

  // Function to get data from selected range
  const getSelectedData = () => {
    if (!selectedRange || !rows?.length || !headers?.length) return null;
    
    const { startRow, endRow, startCol, endCol } = selectedRange || {};
    
    // Validate range
    if (!startRow || !endRow || !startCol || !endCol || 
        startRow < 0 || endRow >= rows.length || 
        startCol < 0 || endCol >= headers.length) {
      console.error('Invalid selection range');
      return null;
    }
    
    // Extract the selected data
    const selectedData = [];
    for (let i = startRow; i <= endRow; i++) {
      const rowData = [];
      for (let j = startCol; j <= endCol; j++) {
        const header = headers[j];
        rowData.push(rows[i]?.[header] || '');
      }
      selectedData.push(rowData);
    }
    
    return {
      data: selectedData,
      headers: headers.slice(startCol, endCol + 1)
    };
  };

  // Function to get all data from the spreadsheet
  const getAllData = () => {
    if (!rows?.length || !headers?.length) return null;
    
    // Convert rows to a 2D array format
    const allData = rows.map(row => {
      return headers.map(header => row?.[header] || '');
    });
    
    return {
      data: allData,
      headers: headers
    };
  };

  // Function to save the current spreadsheet to Supabase
  const saveCurrentSpreadsheet = async () => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to save spreadsheets');
      return;
    }
    
    if (!spreadsheetData?.data || !rows?.length) {
      setError('No spreadsheet data to save');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const spreadsheetToSave = {
        name: fileName || 'Untitled Spreadsheet',
        data: {
          headers: headers || [],
          rows: rows || [],
        }
      };
      
      const savedSpreadsheet = await saveSpreadsheet(user.id, spreadsheetToSave);
      
      if (savedSpreadsheet) {
        setSaveSuccess(true);
        console.log('Spreadsheet saved successfully:', savedSpreadsheet);
      } else {
        setError('Failed to save spreadsheet');
      }
    } catch (err) {
      console.error('Error saving spreadsheet:', err);
      setError(err?.message || 'Error saving spreadsheet');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to set data directly (used when loading from saved spreadsheets)
  const setData = (data, name) => {
    if (!data?.headers || !data?.rows) {
      setError('Invalid data format');
      return;
    }
    
    setHeaders(data.headers || []);
    setRows(data.rows || []);
    setFileName(name || 'Loaded Spreadsheet');
    setSpreadsheetData({ data: data.rows || [], meta: { fields: data.headers || [] } });
    
    // Call onDataLoaded callback
    if (onDataLoaded) {
      onDataLoaded();
    }
  };

  // Function to reset data and return to landing page
  const resetData = () => {
    setSpreadsheetData(null);
    setHeaders([]);
    setRows([]);
    setFileName('');
    setFileType('');
    setSelectedRange(null);
    setError(null);
    setSaveSuccess(false);
    
    // Call the onDataReset callback if provided
    if (onDataReset) {
      console.log('Calling onDataReset callback');
      onDataReset();
    }
  };

  // Value object to be provided by the context
  const value = {
    spreadsheetData: spreadsheetData || null,
    headers: headers || [],
    rows: rows || [],
    fileName: fileName || '',
    fileType: fileType || '',
    selectedRange: selectedRange || null,
    loading: loading || false,
    error: error || null,
    isSaving: isSaving || false,
    saveSuccess: saveSuccess || false,
    handleFileUpload,
    handleFileChange,
    handleCellSelection,
    getSelectedData,
    getAllData,
    saveCurrentSpreadsheet,
    setData,
    resetData,
    charts: charts || [],
    activeChart: activeChart || null,
    addChart,
    removeChart,
    getChartById,
    getAllCharts,
    setActiveChartById,
    createNewSpreadsheet,
    fileInputRef,
  };

  return (
    <SpreadsheetContext.Provider value={value}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".csv,.xls,.xlsx,.numbers"
      />
      {children}
    </SpreadsheetContext.Provider>
  );
}; 