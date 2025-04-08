import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSpreadsheet } from '../context/SpreadsheetContext';

interface SpreadsheetViewProps {
  onExport?: () => void;
}

interface SelectionPoint {
  row: number;
  col: number;
}

interface SelectionRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

const SpreadsheetContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.small};
  overflow: hidden;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  
  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize.h2};
    margin-bottom: ${({ theme }) => theme.spacing.base};
    color: ${({ theme }) => theme.colors.primary};
  }
  
  p {
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.7;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
  
  button {
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.base}`};
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    cursor: pointer;
    transition: ${({ theme }) => theme.transitions.fast};
    
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
  color: ${({ theme }) => theme.colors.surface};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  z-index: 1;
`;

interface RowProps {
  selected?: boolean;
}

const Row = styled.div<RowProps>`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.border}20;
  }
  
  &.selected {
    background-color: ${({ theme }) => theme.colors.primary}20;
  }
`;

interface CellProps {
  selected?: boolean;
}

const Cell = styled.div<CellProps>`
  flex: 1;
  min-width: 100px;
  padding: ${({ theme }) => theme.spacing.sm};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
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
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  
  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize.h2};
    margin-bottom: ${({ theme }) => theme.spacing.base};
    color: ${({ theme }) => theme.colors.primary};
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid ${({ theme }) => theme.colors.border};
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

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({ onExport }) => {
  const { headers, rows, error, loading, handleFileUpload, handleCellSelection, selectedRange } = useSpreadsheet() || {};
  const [selectionStart, setSelectionStart] = useState<SelectionPoint | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<SelectionPoint | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  
  const startSelection = (rowIndex: number, colIndex: number) => {
    setSelectionStart({ row: rowIndex, col: colIndex });
    setSelectionEnd({ row: rowIndex, col: colIndex });
    setIsSelecting(true);
  };
  
  const updateSelection = (rowIndex: number, colIndex: number) => {
    if (isSelecting) {
      setSelectionEnd({ row: rowIndex, col: colIndex });
    }
  };
  
  const endSelection = () => {
    if (isSelecting && selectionStart && selectionEnd && handleCellSelection) {
      const startRow = Math.min(selectionStart.row, selectionEnd.row);
      const endRow = Math.max(selectionStart.row, selectionEnd.row);
      const startCol = Math.min(selectionStart.col, selectionEnd.col);
      const endCol = Math.max(selectionStart.col, selectionEnd.col);
      
      handleCellSelection({ startRow, endRow, startCol, endCol });
    }
    setIsSelecting(false);
  };
  
  const isCellSelected = (rowIndex: number, colIndex: number): boolean => {
    if (!selectedRange) return false;
    
    const { startRow, endRow, startCol, endCol } = selectedRange;
    return rowIndex >= startRow && rowIndex <= endRow && colIndex >= startCol && colIndex <= endCol;
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (rows?.length > 0 && headers?.length > 0 && handleCellSelection) {
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
          {headers?.map((header, index) => (
            <Cell key={`header-${index}`}>{header}</Cell>
          ))}
        </HeaderRow>
        
        {rows.map((row, rowIndex) => (
          <Row 
            key={`row-${rowIndex}`}
            className={selectedRange && rowIndex >= selectedRange.startRow && rowIndex <= selectedRange.endRow ? 'selected' : ''}
            onMouseDown={() => startSelection(rowIndex, 0)}
            onMouseMove={() => updateSelection(rowIndex, headers?.length - 1)}
            onMouseUp={endSelection}
          >
            {headers?.map((_, colIndex) => (
              <Cell 
                key={`cell-${rowIndex}-${colIndex}`}
                className={isCellSelected(rowIndex, colIndex) ? 'selected' : ''}
                onMouseDown={() => startSelection(rowIndex, colIndex)}
                onMouseMove={() => updateSelection(rowIndex, colIndex)}
                onMouseUp={endSelection}
              >
                {row[colIndex]}
              </Cell>
            ))}
          </Row>
        ))}
      </Table>
    </SpreadsheetContainer>
  );
}; 