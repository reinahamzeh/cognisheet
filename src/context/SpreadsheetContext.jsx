import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Create context
const SpreadsheetContext = createContext();

// Custom hook to use the spreadsheet context
export const useSpreadsheet = () => useContext(SpreadsheetContext);

export const SpreadsheetProvider = ({ children, onDataLoaded }) => {
  const [spreadsheetData, setSpreadsheetData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [selectedRange, setSelectedRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Call onDataLoaded when rows are updated
  useEffect(() => {
    if (rows && rows.length > 0 && onDataLoaded) {
      onDataLoaded();
    }
  }, [rows, onDataLoaded]);

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
        } else if (['xls', 'xlsx'].includes(type)) {
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
    Papa.parse(content, {
      header: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setHeaders(results.meta.fields || []);
          setRows(results.data);
          setSpreadsheetData(results);
        } else {
          setError('No data found in the CSV file');
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  // Parse Excel file
  const parseExcel = (content) => {
    try {
      // For Excel files, we need to use the XLSX library
      const data = new Uint8Array(content);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData && jsonData.length > 0) {
        const headers = jsonData[0];
        const rows = jsonData.slice(1).map(row => {
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });
          return rowData;
        });
        
        setHeaders(headers);
        setRows(rows);
        setSpreadsheetData({ data: rows, meta: { fields: headers } });
      } else {
        setError('No data found in the Excel file');
      }
    } catch (err) {
      setError(`Error parsing Excel: ${err.message}`);
    }
  };

  // Function to handle cell selection
  const handleCellSelection = (range) => {
    setSelectedRange(range);
  };

  // Function to get data from selected range
  const getSelectedData = () => {
    if (!selectedRange || !rows) return null;
    
    const { startRow, endRow, startCol, endCol } = selectedRange;
    
    // Extract the selected data
    const selectedData = [];
    for (let i = startRow; i <= endRow; i++) {
      const rowData = [];
      for (let j = startCol; j <= endCol; j++) {
        const header = headers[j];
        rowData.push(rows[i][header]);
      }
      selectedData.push(rowData);
    }
    
    return {
      data: selectedData,
      headers: headers.slice(startCol, endCol + 1)
    };
  };

  // Value object to be provided by the context
  const value = {
    spreadsheetData,
    headers,
    rows,
    fileName,
    fileType,
    selectedRange,
    loading,
    error,
    handleFileUpload,
    handleCellSelection,
    getSelectedData,
  };

  return (
    <SpreadsheetContext.Provider value={value}>
      {children}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".csv,.xls,.xlsx"
        onChange={handleFileChange}
      />
    </SpreadsheetContext.Provider>
  );
}; 