import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import XLSX from 'xlsx';

interface Props {
  data: string[][];
  title: string;
  onDataChange: (data: string[][]) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
`;

const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e1e1e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

const SpreadsheetContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 1rem;
`;

const TableContainer = styled.div`
  overflow: auto;
  height: 100%;
`;

const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  min-width: max-content;
`;

const Cell = styled.td<{ width?: number }>`
  border: 1px solid #e1e1e1;
  padding: 0;
  position: relative;
  min-width: ${props => props.width || 100}px;
  height: 24px;
`;

const EditableCell = styled.div`
  padding: 4px 8px;
  min-height: 24px;
  outline: none;
  width: 100%;
  height: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:focus {
    outline: 2px solid #1a73e8;
    background: #e8f0fe;
  }
`;

const HeaderCell = styled.th<{ width?: number }>`
  background: #f8f9fa;
  border: 1px solid #e1e1e1;
  padding: 8px;
  font-weight: 500;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 1;
  min-width: ${props => props.width || 100}px;
`;

const SpreadsheetView: React.FC<Props> = ({ data, title, onDataChange }) => {
  const [processedData, setProcessedData] = useState<string[][]>([]);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);
  
  useEffect(() => {
    if (data && data.length > 0) {
      // Filter out empty rows and ensure all rows have the same number of columns
      const maxColumns = Math.max(...data.map(row => row.length));
      const processed = data.map(row => {
        const newRow = [...row];
        while (newRow.length < maxColumns) {
          newRow.push('');
        }
        return newRow;
      }).filter(row => row.some(cell => cell !== ''));
      
      setProcessedData(processed);
      
      // Initialize column widths
      setColumnWidths(new Array(maxColumns).fill(100));
    }
  }, [data]);
  
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = processedData.map((row, i) => 
      i === rowIndex 
        ? row.map((cell, j) => j === colIndex ? value : cell)
        : row
    );
    
    setProcessedData(newData);
    onDataChange(newData);
  };
  
  if (!processedData || processedData.length === 0) {
    return (
      <Container>
        <Header>
          <Title>{title}</Title>
        </Header>
        <SpreadsheetContent>
          <div>No data available</div>
        </SpreadsheetContent>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <Title>{title}</Title>
      </Header>
      <SpreadsheetContent>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                {processedData[0].map((_, index) => (
                  <HeaderCell key={index} width={columnWidths[index]}>
                    {XLSX.utils.encode_col(index)}
                  </HeaderCell>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <Cell key={colIndex} width={columnWidths[colIndex]}>
                      <EditableCell
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleCellChange(rowIndex, colIndex, e.currentTarget.textContent || '')}
                        dangerouslySetInnerHTML={{ __html: cell }}
                      />
                    </Cell>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </SpreadsheetContent>
    </Container>
  );
};

export default SpreadsheetView; 