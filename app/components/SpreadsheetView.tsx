'use client';

import React from 'react';
import styled from 'styled-components';
import SpreadsheetComponent from '../../components/SpreadsheetComponent';
import { useSpreadsheet } from '../context/spreadsheet-context';

// Removed Props interface as data comes from context now

interface CellData { // Defined in context, but keep here if SpreadsheetComponent needs it
  value: string | number | boolean | null;
}

interface SheetTab { // Keep if SpreadsheetComponent needs it
  id: string;
  name: string;
  data: {
    rows: number;
    columns: number;
    cells: Record<string, CellData>;
    headers: string[];
  };
}

const SpreadsheetContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// Define props for SpreadsheetView if needed, excluding data/onDataChange
interface SpreadsheetViewProps {
  title?: string;
  enableWebSearch?: boolean;
  enableCharts?: boolean;
  enableMultiCellSelection?: boolean;
  enableDataEnrichment?: boolean;
}

const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  title, // Keep title if used by SpreadsheetComponent
  enableWebSearch = true,
  enableCharts = true,
  enableMultiCellSelection = true,
  enableDataEnrichment = true
}) => {
  // Get data and handlers from context
  const { 
    data: contextData, 
    fileName, 
    loading, 
    error, 
    setSelectedRange, 
    // Assuming contextData is CellData[][] or null
  } = useSpreadsheet(); 

  // TODO: Map contextData (CellData[][]) to the format SpreadsheetComponent expects
  // This is a placeholder - depends on SpreadsheetComponent's required input format
  const spreadsheetComponentData = contextData ? {
    sheets: [
      {
        id: 'sheet1', 
        name: fileName || 'Sheet 1',
        data: {
          rows: contextData.length,
          columns: contextData[0]?.length || 0,
          // Convert CellData[][] back to { cells: Record<string, CellData>, headers: string[] }
          // This logic needs proper implementation based on how SpreadsheetComponent uses data
          cells: {}, // Placeholder
          headers: contextData[0] ? Array.from({ length: contextData[0].length }, (_, i) => String.fromCharCode(65 + i)) : [] // Placeholder headers
        }
      }
    ],
    activeSheetId: 'sheet1'
  } : undefined; // Or provide default empty state for SpreadsheetComponent

  // Handler for when SpreadsheetComponent internally changes data
  // This needs to update the context using setData from useSpreadsheet
  const handleDataUpdate = (updatedSheetData: { sheets: SheetTab[]; activeSheetId: string }) => {
    console.log("SpreadsheetComponent updated data internally:", updatedSheetData);
    // TODO: Convert updatedSheetData back to CellData[][] and update context
    // const { setData } = useSpreadsheet(); // Need setData from context
    // setData(convertedData, fileName);
  };

  const handleExportFunction = (exportFn: () => void) => {
    // Handle export function if needed
  };

  const handleFormatFunctions = (functions: {
    toggleBold: () => void;
    toggleItalic: () => void;
    setTextAlign: (alignment: 'left' | 'center' | 'right') => void;
    toggleWrapText: () => void;
  }) => {
    // Handle format functions if needed
  };

  const handleCellSelection = (selectedRange: string, cellData: { [key: string]: CellData }) => {
    setSelectedRange(selectedRange);
  };

  if (loading) {
    return <SpreadsheetContainer><div>Loading...</div></SpreadsheetContainer>;
  }

  if (error) {
    return <SpreadsheetContainer><div>Error loading spreadsheet: {error}</div></SpreadsheetContainer>;
  }

  if (!contextData || contextData.length === 0) {
    // Optionally show a placeholder or message when no data is loaded
    return <SpreadsheetContainer><div>No data loaded. Upload a file.</div></SpreadsheetContainer>;
  }

  return (
    <SpreadsheetContainer>
      {/* Pass the formatted data to SpreadsheetComponent */} 
      {/* Need to ensure SpreadsheetComponent receives data in its expected format */}
      <SpreadsheetComponent 
        // data={spreadsheetComponentData} // Pass formatted data if needed
        onDataUpdate={handleDataUpdate} // Handle internal updates
        onExport={handleExportFunction}
        onFormatFunctions={handleFormatFunctions}
        onCellSelection={handleCellSelection}
      />
    </SpreadsheetContainer>
  );
};

export default SpreadsheetView; 