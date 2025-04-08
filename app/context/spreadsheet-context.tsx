"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface CellData {
  value: string | number | boolean | null;
}

interface SpreadsheetContextType {
  data: CellData[][] | null;
  fileName: string | null;
  loading: boolean;
  error: string | null;
  handleFileUpload: (file: File) => Promise<boolean>;
  setData: (data: CellData[][], fileName: string) => void;
  selectedRange: string | null;
  setSelectedRange: (range: string | null) => void;
  getAllData: () => CellData[][] | null;
  getSelectedDataByRange: (range: string) => CellData[][] | null;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(
  undefined
);

interface SpreadsheetProviderProps {
  children: ReactNode;
}

export const SpreadsheetProvider: React.FC<SpreadsheetProviderProps> = ({ children }) => {
  const [data, setContextData] = useState<CellData[][] | null>(null);
  const [fileName, setContextFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setContextError] = useState<string | null>(null);
  const [selectedRange, setSelectedRangeState] = useState<string | null>(null);
  const { toast } = useToast();

  const parseCSV = useCallback((content: string, file: File) => {
    console.log('Parsing CSV...');
    Papa.parse<string[]>(content, {
      complete: (results) => {
        console.log('CSV parsing complete.');
        if (results.data && results.data.length > 0) {
          const gridData: CellData[][] = results.data.map(row => 
            row.map(cellValue => ({ value: cellValue }))
          );
          setContextData(gridData);
          setContextFileName(file.name);
          setContextError(null);
          setLoading(false);
          toast({ title: "Success", description: "CSV file loaded.", variant: "default" });
        } else {
          console.error('No data found in CSV.');
          setContextError('No data found in the CSV file.');
          setLoading(false);
          toast({ title: "Error", description: "No data found in CSV.", variant: "destructive" });
        }
      },
      error: (error: Papa.ParseError) => {
        console.error('Error parsing CSV:', error);
        setContextError(`Error parsing CSV: ${error.message}`);
        setLoading(false);
        toast({ title: "Error", description: `CSV Parsing Error: ${error.message}`, variant: "destructive" });
      }
    });
  }, [toast]);

  const parseExcel = useCallback((content: ArrayBuffer, file: File) => {
    console.log('Parsing Excel...');
    try {
      const workbook = XLSX.read(content, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
          throw new Error('No sheets found in the Excel file.');
      }
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
      
      if (jsonData && jsonData.length > 0) {
        const gridData: CellData[][] = jsonData
            .map(row => row.map(cell => ({ value: cell !== undefined && cell !== null ? String(cell) : null })))
            .filter(row => row.some(cell => cell.value !== null && cell.value !== ''));
            
        if (gridData.length > 0) {
            setContextData(gridData);
            setContextFileName(file.name);
            setContextError(null);
            setLoading(false);
            toast({ title: "Success", description: "Excel file loaded.", variant: "default" });
        } else {
             throw new Error('No data found in the first sheet after filtering.');
        }
      } else {
        throw new Error('No data parsed from the first sheet.');
      }
    } catch (err) {
      console.error('Error parsing Excel:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error parsing Excel file.';
      setContextError(errorMsg);
      setLoading(false);
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    }
  }, [toast]);

  const handleFileUpload = useCallback(async (file: File): Promise<boolean> => {
    setLoading(true);
    setContextData(null);
    setContextFileName(null);
    setContextError(null);
    console.log('Context: File upload starting -', file.name);

    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            console.log('Context: File read complete');
            const fileContent = e.target?.result;
            if (!fileContent) {
                console.error('No content read from file');
                setContextError('Failed to read file content.');
                setLoading(false);
                toast({ title: "Error", description: "Failed to read file content.", variant: "destructive" });
                resolve(false);
                return;
            }

            const fileExt = file.name.split('.').pop()?.toLowerCase();
            if (fileExt === 'csv') {
                parseCSV(fileContent as string, file);
            } else if (['xls', 'xlsx'].includes(fileExt || '')) {
                parseExcel(fileContent as ArrayBuffer, file);
            } else {
                console.error('Unsupported file type:', fileExt);
                setContextError(`Unsupported file type: .${fileExt}`);
                setLoading(false);
                toast({ title: "Error", description: `Unsupported file type: .${fileExt}`, variant: "destructive" });
                resolve(false);
            }
            resolve(true); 
        };

        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            setContextError('Error reading file.');
            setLoading(false);
            toast({ title: "Error", description: "Error reading file.", variant: "destructive" });
            resolve(false);
        };

        if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
  }, [parseCSV, parseExcel, toast]);

  const setData = useCallback((newData: CellData[][], newFileName: string) => {
    setContextData(newData);
    setContextFileName(newFileName);
    setContextError(null);
  }, []);

  const setSelectedRange = useCallback((range: string | null) => {
    setSelectedRangeState(range);
  }, []);
  
  const getAllData = useCallback((): CellData[][] | null => {
      return data;
  }, [data]);

  const getSelectedDataByRange = useCallback((range: string): CellData[][] | null => {
      if (!data || !range) return null;
      try {
          const [startCell, endCell] = range.split(':');
          const startMatch = startCell.match(/([A-Z]+)([0-9]+)/);
          const endMatch = endCell.match(/([A-Z]+)([0-9]+)/);
          
          if (!startMatch || !endMatch) return null;
          
          const colToIndex = (col: string) => col.charCodeAt(0) - 'A'.charCodeAt(0);
          
          const startColIndex = colToIndex(startMatch[1]);
          const startRowIndex = parseInt(startMatch[2], 10) - 1;
          const endColIndex = colToIndex(endMatch[1]);
          const endRowIndex = parseInt(endMatch[2], 10) - 1;
          
          if (startRowIndex < 0 || startColIndex < 0 || endRowIndex >= data.length || endColIndex >= (data[0]?.length || 0)) {
              console.warn("Range is out of bounds");
              return null;
          }

          const selectedData: CellData[][] = [];
          for (let r = startRowIndex; r <= endRowIndex; r++) {
              const rowData: CellData[] = [];
              for (let c = startColIndex; c <= endColIndex; c++) {
                   rowData.push(data[r]?.[c] ?? { value: null });
              }
              selectedData.push(rowData);
          }
          return selectedData;
      } catch (e) {
          console.error("Error parsing range:", e);
          return null;
      }
  }, [data]);

  return (
    <SpreadsheetContext.Provider
      value={{
        data,
        fileName,
        loading,
        error,
        handleFileUpload,
        setData,
        selectedRange,
        setSelectedRange,
        getAllData,
        getSelectedDataByRange
      }}
    >
      {children}
    </SpreadsheetContext.Provider>
  );
};

export function useSpreadsheet(): SpreadsheetContextType {
  const context = useContext(SpreadsheetContext);
  if (context === undefined) {
    throw new Error("useSpreadsheet must be used within a SpreadsheetProvider");
  }
  return context;
} 