'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import FileLimitModal from '../components/file-limit-modal';
import PricingModal from '../components/pricing-modal';
import { useUser } from '../lib/context/user-context';

// Dynamic imports for components
const LandingPage = dynamic(() => import('./components/LandingPage'), { ssr: false });
const SpreadsheetView = dynamic(() => import('./components/SpreadsheetView'), { ssr: false });

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`;

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'spreadsheet'>('landing');
  const [spreadsheetData, setSpreadsheetData] = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string>('');
  
  // These should always be false to never show the limit modals
  const [showFileLimitModal, setShowFileLimitModal] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const { incrementFileCount } = useUser();

  const parseCSV = (content: string) => {
    console.log('Parsing CSV with content length:', content.length);
    
    Papa.parse(content, {
      complete: (results) => {
        console.log('CSV parsing complete, rows:', results.data.length);
        
        if (results.data && results.data.length > 0) {
          const grid = results.data as string[][];
          console.log('Grid created with size:', grid.length, 'x', grid[0].length);
          
          setSpreadsheetData(grid);
          setView('spreadsheet');
        } else {
          console.error('No data found in the CSV file');
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      }
    });
  };

  const parseExcel = (content: ArrayBuffer) => {
    console.log('Parsing Excel file with buffer size:', content.byteLength);
    
    try {
      const data = new Uint8Array(content);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Process all sheets
      const allSheets: { [key: string]: string[][] } = {};
      
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to array format with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData && jsonData.length > 0) {
          // Convert all values to strings and filter out empty rows
          const grid = jsonData
            .map(row => row.map(cell => cell !== undefined && cell !== null ? String(cell) : ''))
            .filter(row => row.some(cell => cell !== '')); // Filter out completely empty rows
          
          if (grid.length > 0) {
            allSheets[sheetName] = grid;
          }
        }
      });
      
      // If we have any sheets with data
      if (Object.keys(allSheets).length > 0) {
        // For now, use the first sheet (we'll handle multiple sheets in SpreadsheetView)
        const firstSheetName = Object.keys(allSheets)[0];
        setSpreadsheetData(allSheets[firstSheetName]);
        setView('spreadsheet');
      } else {
        console.error('No data found in any sheet of the Excel file');
      }
    } catch (err) {
      console.error('Error parsing Excel:', err);
    }
  };

  const handleFileUpload = (file: File) => {
    // No authentication checks - all features enabled for all users
    console.log('File upload started:', file.name, 'size:', file.size, 'type:', file.type);
    setFileName(file.name);
    
    // File upload is unrestricted, no need to track count
    console.log('File count not tracked - all features enabled');
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      console.log('File read complete');
      const content = e.target?.result;
      
      if (!content) {
        console.error('No content read from file');
        return;
      }
      
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      console.log('File extension detected:', fileExt);
      
      if (fileExt === 'csv') {
        parseCSV(content as string);
      } else if (['xls', 'xlsx'].includes(fileExt || '')) {
        parseExcel(content as ArrayBuffer);
      } else {
        console.error('Unsupported file type:', fileExt);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    
    console.log('Starting file read...');
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleNewFile = () => {
    console.log('Creating new file');
    
    // Still increment file count for tracking, but no limit check
    incrementFileCount();
    
    // Create an empty grid 10x10
    const emptyGrid = Array(10).fill(0).map(() => Array(10).fill(''));
    setSpreadsheetData(emptyGrid);
    setFileName('New Spreadsheet');
    setView('spreadsheet');
  };

  const handleWatchDemo = () => {
    console.log('Opening demo video');
    alert('Demo video would play here in the actual implementation');
  };

  const handleSpreadsheetDataChange = (newData: string[][]) => {
    console.log('Spreadsheet data changed:', newData.length, 'rows');
    setSpreadsheetData(newData);
  };

  return (
    <AppContainer>
      {view === 'landing' ? (
        <LandingPage 
          onUploadFile={handleFileUpload}
          onNewFile={handleNewFile}
          onWatchDemo={handleWatchDemo}
        />
      ) : (
        <SpreadsheetView 
          data={spreadsheetData} 
          title={fileName || 'Spreadsheet'}
          onDataChange={handleSpreadsheetDataChange}
          // All features enabled for all users
          enableWebSearch={true}
          enableCharts={true}
          enableMultiCellSelection={true}
          enableDataEnrichment={true}
        />
      )}
      
      {/* Modals are disabled - set to false so they never show */}
      {false && (
        <>
          <FileLimitModal 
            isOpen={false}
            onClose={() => {}}
            onUpgrade={() => {}}
          />
          
          <PricingModal 
            isOpen={false}
            onClose={() => {}}
          />
        </>
      )}
    </AppContainer>
  );
};

export default App; 