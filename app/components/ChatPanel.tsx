import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import ChartDisplay from './ChartDisplay';
import { useSpreadsheet } from '../context/SpreadsheetContext';

interface Message {
  type: 'user' | 'error' | 'system' | 'formula' | 'assistant';
  content: string;
  chart?: any; // Replace with proper chart type when available
  researchResults?: string[];
  suggestedFormula?: string;
}

interface Theme {
  colors: {
    primary: string;
    background: string;
    text: string;
    accent: string;
    error: string;
    border: string;
    surface: string;
    muted: string;
  };
  spacing: {
    base: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      base: string;
      large: string;
      h1: string;
      h2: string;
      h3: string;
    };
  };
  borderRadius: {
    small: string;
    base: string;
    large: string;
    round: string;
  };
  shadows: {
    small: string;
    base: string;
    large: string;
  };
  transitions: {
    base: string;
    fast: string;
    slow: string;
  };
}

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 350px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const ChatHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.base};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primary};
  
  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize.h2};
    margin: 0;
    color: ${({ theme }) => theme.colors.surface};
  }
`;

const ClearButton = styled.button`
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  color: ${({ theme }) => theme.colors.surface};
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

interface MessageProps {
  type: Message['type'];
  theme?: Theme;
}

const Message = styled.div<MessageProps>`
  padding: ${({ theme }) => theme.spacing.base};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  max-width: 85%;
  
  ${({ type, theme }) => {
    if (type === 'user') {
      return `
        align-self: flex-end;
        background-color: ${theme.colors.primary};
        color: ${theme.colors.surface};
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
        background-color: ${theme.colors.muted}80;
        color: ${theme.colors.text};
        font-style: italic;
        font-size: 0.9em;
        padding: ${theme.spacing.sm};
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
        background-color: ${theme.colors.muted};
        color: ${theme.colors.text};
        border: 1px solid ${theme.colors.border};
      `;
    }
  }}
`;

const InputContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.base};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
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
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.base}`};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
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
      margin-bottom: ${({ theme }) => theme.spacing.sm};
    }
  }
`;

const FormulaButton = styled.button`
  display: block;
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  font-size: 0.9em;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ResearchResult = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.muted}30;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.9em;
`;

const ChatPanel: React.FC = () => {
  const { 
    messages, 
    inputValue, 
    setInputValue, 
    sendMessage, 
    clearChat, 
    isProcessing
  } = useChat();
  const { updateCell } = useSpreadsheet();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      sendMessage(inputValue);
    }
  };
  
  // Handle applying a formula to the selected range
  const handleApplyFormula = (formula: string) => {
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
            <p>Welcome! I'm your AI assistant. Here's what I can help you with:</p>
            <ul>
              <li>Analyze your spreadsheet data</li>
              <li>Generate charts and visualizations</li>
              <li>Suggest formulas and calculations</li>
              <li>Answer questions about your data</li>
              <li>Provide insights and recommendations</li>
            </ul>
            <p>Type your question or request below to get started!</p>
          </EmptyState>
        ) : (
          messages.map((message, index) => (
            <Message key={index} type={message.type}>
              {message.content}
              {message.chart && <ChartDisplay data={message.chart} />}
              {message.researchResults && message.researchResults.map((result, i) => (
                <ResearchResult key={i}>{result}</ResearchResult>
              ))}
              {message.suggestedFormula && (
                <FormulaButton onClick={() => handleApplyFormula(message.suggestedFormula!)}>
                  Apply Formula: {message.suggestedFormula}
                </FormulaButton>
              )}
            </Message>
          ))
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <form onSubmit={handleSubmit}>
        <InputContainer>
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about your data..."
            disabled={isProcessing}
          />
          <SendButton type="submit" disabled={!inputValue.trim() || isProcessing}>
            Send
          </SendButton>
        </InputContainer>
      </form>
    </ChatContainer>
  );
};

export default ChatPanel; 