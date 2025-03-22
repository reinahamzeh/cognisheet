import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSpreadsheet } from '../context/SpreadsheetContext';

const SpreadsheetContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  box-shadow: ${({ theme }) => theme.shadows.small};
  overflow: hidden;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.large};
  text-align: center;
  
  h2 {
    font-size: ${({ theme }) => theme.fontSizes.h2};
    margin-bottom: ${({ theme }) => theme.spacing.base};
    color: ${({ theme }) => theme.colors.primary};
  }
  
  p {
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.7;
    margin-bottom: ${({ theme }) => theme.spacing.medium};
  }
  
  button {
    padding: ${({ theme }) => `${theme.spacing.small} ${theme.spacing.base}`};
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.fast};
    
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.accent};
    }
  }
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
`;

const HeaderRow = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 500;
  z-index: 1;
`;

const Row = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  
  &:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }
  
  &.selected {
    background-color: ${({ theme }) => theme.colors.primary}20;
  }
`;

const Cell = styled.div`
  flex: 1;
  min-width: 100px;
  padding: ${({ theme }) => theme.spacing.small};
  border-right: 1px solid ${({ theme }) => theme.colors.lightGray};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text};
  
  &.selected {
    background-color: ${({ theme }) => theme.colors.primary}20;
  }
  
  &:last-child {
    border-right: none;
  }
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.base};
  background-color: ${({ theme }) => theme.colors.error}20;
  color: ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin: ${({ theme }) => theme.spacing.base};
`;

const LoadingIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.large};
  text-align: center;
  
  h2 {
    font-size: ${({ theme }) => theme.fontSizes.h2};
    margin-bottom: ${({ theme }) => theme.spacing.base};
    color: ${({ theme }) => theme.colors.primary};
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid ${({ theme }) => theme.colors.lightGray};
    border-top: 4px solid ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: ${({ theme }) => theme.spacing.base};
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SpreadsheetView = () => {
  const { headers, rows, error, loading, handleFileUpload, handleCellSelection, selectedRange } = useSpreadsheet();
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  
  // Handle selection
  const startSelection = (rowIndex, colIndex) => {
    setSelectionStart({ row: rowIndex, col: colIndex });
    setSelectionEnd({ row: rowIndex, col: colIndex });
    setIsSelecting(true);
  };
  
  const updateSelection = (rowIndex, colIndex) => {
    if (isSelecting) {
      setSelectionEnd({ row: rowIndex, col: colIndex });
    }
  };
  
  const endSelection = () => {
    if (isSelecting && selectionStart && selectionEnd) {
      // Calculate the actual range (start could be after end if selecting backwards)
      const startRow = Math.min(selectionStart.row, selectionEnd.row);
      const endRow = Math.max(selectionStart.row, selectionEnd.row);
      const startCol = Math.min(selectionStart.col, selectionEnd.col);
      const endCol = Math.max(selectionStart.col, selectionEnd.col);
      
      // Update the context with the selected range
      handleCellSelection({ startRow, endRow, startCol, endCol });
    }
    setIsSelecting(false);
  };
  
  // Check if a cell is in the selected range
  const isCellSelected = (rowIndex, colIndex) => {
    if (!selectedRange) return false;
    
    const { startRow, endRow, startCol, endCol } = selectedRange;
    return rowIndex >= startRow && rowIndex <= endRow && colIndex >= startCol && colIndex <= endCol;
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K to select all data
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (rows.length > 0 && headers.length > 0) {
          handleCellSelection({
            startRow: 0,
            endRow: rows.length - 1,
            startCol: 0,
            endCol: headers.length - 1
          });
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rows, headers, handleCellSelection]);
  
  // If loading
  if (loading) {
    return (
      <SpreadsheetContainer>
        <LoadingIndicator>
          <div className="spinner"></div>
          <h2>Loading spreadsheet data...</h2>
        </LoadingIndicator>
      </SpreadsheetContainer>
    );
  }
  
  // If no data is loaded yet
  if (!rows || rows.length === 0) {
    return (
      <SpreadsheetContainer>
        {error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : (
          <EmptyState>
            <h2>No spreadsheet data loaded</h2>
            <p>Upload a CSV or Excel file to get started</p>
            <button onClick={handleFileUpload}>Upload File</button>
          </EmptyState>
        )}
      </SpreadsheetContainer>
    );
  }
  
  return (
    <SpreadsheetContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Table>
        <HeaderRow>
          {headers.map((header, index) => (
            <Cell key={`header-${index}`}>{header}</Cell>
          ))}
        </HeaderRow>
        
        {rows.map((row, rowIndex) => (
          <Row 
            key={`row-${rowIndex}`}
            className={selectedRange && rowIndex >= selectedRange.startRow && rowIndex <= selectedRange.endRow ? 'selected' : ''}
          >
            {headers.map((header, colIndex) => (
              <Cell 
                key={`cell-${rowIndex}-${colIndex}`}
                className={isCellSelected(rowIndex, colIndex) ? 'selected' : ''}
                onMouseDown={() => startSelection(rowIndex, colIndex)}
                onMouseMove={() => updateSelection(rowIndex, colIndex)}
                onMouseUp={endSelection}
              >
                {row[header]}
              </Cell>
            ))}
          </Row>
        ))}
      </Table>
    </SpreadsheetContainer>
  );
};

export default SpreadsheetView; 