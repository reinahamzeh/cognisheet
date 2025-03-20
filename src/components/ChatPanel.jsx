import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import ChartDisplay from './ChartDisplay';
import { useSpreadsheet } from '../context/SpreadsheetContext';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 350px;
  background-color: ${({ theme }) => theme.colors.white};
  border-left: 1px solid ${({ theme }) => theme.colors.lightGray};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const ChatHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.base};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primary};
  
  h2 {
    font-size: ${({ theme }) => theme.fontSizes.h2};
    margin: 0;
    color: ${({ theme }) => theme.colors.white};
  }
`;

const ClearButton = styled.button`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.white};
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.base};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
`;

const Message = styled.div`
  padding: ${({ theme }) => theme.spacing.base};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  max-width: 85%;
  
  ${({ type, theme }) => {
    if (type === 'user') {
      return `
        align-self: flex-end;
        background-color: ${theme.colors.primary};
        color: ${theme.colors.white};
      `;
    } else if (type === 'error') {
      return `
        align-self: flex-start;
        background-color: ${theme.colors.error}20;
        color: ${theme.colors.error};
        border: 1px solid ${theme.colors.error}40;
      `;
    } else if (type === 'system') {
      return `
        align-self: center;
        background-color: ${theme.colors.lightGray}80;
        color: ${theme.colors.text};
        font-style: italic;
        font-size: 0.9em;
        padding: ${theme.spacing.small};
      `;
    } else if (type === 'formula') {
      return `
        align-self: flex-start;
        background-color: ${theme.colors.accent}20;
        color: ${theme.colors.text};
        border: 1px solid ${theme.colors.accent}40;
        font-family: monospace;
      `;
    } else {
      return `
        align-self: flex-start;
        background-color: ${theme.colors.lightGray};
        color: ${theme.colors.text};
        border: 1px solid ${theme.colors.lightGray};
      `;
    }
  }}
`;

const InputContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.base};
  border-top: 1px solid ${({ theme }) => theme.colors.lightGray};
  display: flex;
  gap: ${({ theme }) => theme.spacing.small};
`;

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.small};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.5;
  }
`;

const SendButton = styled.button`
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.base};
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  
  p {
    margin-bottom: ${({ theme }) => theme.spacing.base};
  }
  
  ul {
    text-align: left;
    margin-bottom: ${({ theme }) => theme.spacing.base};
    
    li {
      margin-bottom: ${({ theme }) => theme.spacing.small};
    }
  }
`;

const FormulaButton = styled.button`
  display: block;
  margin-top: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.small};
  background-color: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  font-size: 0.9em;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ResearchResult = styled.div`
  margin-top: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.small};
  background-color: ${({ theme }) => theme.colors.lightGray}30;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.9em;
`;

const ChatPanel = () => {
  const { 
    messages, 
    inputValue, 
    setInputValue, 
    sendMessage, 
    clearChat, 
    isProcessing
  } = useChat();
  const { updateCell } = useSpreadsheet();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      sendMessage(inputValue);
    }
  };
  
  // Handle applying a formula to the selected range
  const handleApplyFormula = (formula) => {
    if (updateCell && formula) {
      // Extract the range from the formula (e.g., "=SUM(A1:B5)" -> "A1:B5")
      const rangeMatch = formula.match(/\(([A-Z][0-9]+:[A-Z][0-9]+)\)/);
      
      if (rangeMatch && rangeMatch[1]) {
        const range = rangeMatch[1];
        const [startCell, endCell] = range.split(':');
        
        // Apply the formula to the end cell of the range
        updateCell(endCell.charAt(0), parseInt(endCell.slice(1)), formula);
      }
    }
  };
  
  return (
    <ChatContainer>
      <ChatHeader>
        <h2>AI Assistant</h2>
        {messages.length > 0 && (
          <ClearButton onClick={clearChat}>Clear</ClearButton>
        )}
      </ChatHeader>
      
      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <p>Ask questions about your spreadsheet data:</p>
            <ul>
              <li>Select data and ask "What's the average?"</li>
              <li>Select two columns and say "Create a bar chart"</li>
              <li>Try "What's the maximum value in column A?"</li>
              <li>"Generate a sum formula for this range"</li>
              <li>"Analyze this data and tell me insights"</li>
              <li>"Summarize what this spreadsheet contains"</li>
            </ul>
            <p>Use Cmd+K to quickly select data</p>
          </EmptyState>
        ) : (
          messages.map((message, index) => (
            <React.Fragment key={index}>
              {message.type === 'chart' ? (
                <ChartDisplay 
                  type={message.chartType} 
                  data={message.data} 
                  title={message.content} 
                />
              ) : message.type === 'formula' ? (
                <Message type="formula">
                  {message.content}
                  <FormulaButton onClick={() => handleApplyFormula(message.formula)}>
                    Apply Formula
                  </FormulaButton>
                </Message>
              ) : message.type === 'research' ? (
                <Message type="response">
                  {message.content}
                  {message.results && (
                    <ResearchResult>
                      {message.results.map((result, idx) => (
                        <div key={idx}>
                          <strong>{result.title}</strong>
                          <p>{result.description}</p>
                        </div>
                      ))}
                    </ResearchResult>
                  )}
                </Message>
              ) : message.type === 'extraction' ? (
                <Message type="response">
                  {message.content}
                  {message.data && (
                    <ResearchResult>
                      <p>Extracted {message.data.length} rows of data</p>
                    </ResearchResult>
                  )}
                </Message>
              ) : (
                <Message type={message.type}>
                  {message.content}
                </Message>
              )}
            </React.Fragment>
          ))
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', gap: '8px' }}>
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask AI about your data..."
            disabled={isProcessing}
          />
          <SendButton type="submit" disabled={!inputValue.trim() || isProcessing}>
            {isProcessing ? '...' : 'Send'}
          </SendButton>
        </form>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatPanel; 