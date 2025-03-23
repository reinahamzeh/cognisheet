'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';

interface Props {
  data: string[][];
  title: string;
  onDataChange: (data: string[][]) => void;
  enableWebSearch?: boolean;
  enableCharts?: boolean;
  enableMultiCellSelection?: boolean;
  enableDataEnrichment?: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  background: #fff;
`;

const SpreadsheetContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  overflow: hidden;
`;

const ChatContainer = styled.div`
  width: 300px;
  border-left: 1px solid #e1e1e1;
  display: flex;
  flex-direction: column;
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
  color: #000000;

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

const ChatInput = styled.div`
  padding: 1rem;
  border-top: 1px solid #e1e1e1;
  display: flex;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const SendButton = styled.button`
  padding: 0.5rem 1rem;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #1557b0;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const SpreadsheetView: React.FC<Props> = ({ 
  data, 
  title, 
  onDataChange,
  enableWebSearch = true,
  enableCharts = true,
  enableMultiCellSelection = true,
  enableDataEnrichment = true
}) => {
  const [currentData, setCurrentData] = useState<string[][]>(data);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [message, setMessage] = useState<string>('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I can help you analyze this spreadsheet. What would you like to know?' }
  ]);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);

  // All features are enabled regardless of user plan

  useEffect(() => {
    setCurrentData(data);
    
    // Initialize column widths if data exists
    if (data && data.length > 0) {
      const maxColumns = Math.max(...data.map(row => row.length));
      setColumnWidths(new Array(maxColumns).fill(100));
    }
  }, [data]);
  
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = currentData.map((row, i) => 
      i === rowIndex 
        ? row.map((cell, j) => j === colIndex ? value : cell)
        : row
    );
    
    setCurrentData(newData);
    onDataChange(newData);
  };
  
  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Implement chat functionality
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  if (!currentData || currentData.length === 0) {
    return (
      <Container>
        <SpreadsheetContainer>
          <Header>
            <Title>{title}</Title>
          </Header>
          <SpreadsheetContent>
            <div>No data to display</div>
          </SpreadsheetContent>
        </SpreadsheetContainer>
        <ChatContainer>
          <ChatMessages />
          <ChatInput>
            <Input 
              placeholder="Ask about your data..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <SendButton onClick={handleSendMessage}>Send</SendButton>
          </ChatInput>
        </ChatContainer>
      </Container>
    );
  }
  
  return (
    <Container>
      <SpreadsheetContainer>
        <Header>
          <Title>{title}</Title>
        </Header>
        <SpreadsheetContent>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  {currentData[0].map((_, index) => (
                    <HeaderCell key={index} width={columnWidths[index]}>
                      {XLSX.utils.encode_col(index)}
                    </HeaderCell>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, rowIndex) => (
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
      </SpreadsheetContainer>
      <ChatContainer>
        <ChatMessages />
        <ChatInput>
          <Input 
            placeholder="Ask about your data..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <SendButton onClick={handleSendMessage}>Send</SendButton>
        </ChatInput>
      </ChatContainer>
    </Container>
  );
};

export default SpreadsheetView; 