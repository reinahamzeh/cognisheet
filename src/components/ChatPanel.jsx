import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import ChartDisplay from './ChartDisplay';

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
  
  h2 {
    font-size: ${({ theme }) => theme.fontSizes.h2};
    margin: 0;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ClearButton = styled.button`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.darkGray};
  background: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
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
    } else {
      return `
        align-self: flex-start;
        background-color: ${theme.colors.lightGray};
        color: ${theme.colors.text};
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
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
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
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.lightGray};
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
  color: ${({ theme }) => theme.colors.darkGray};
  
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

const ChatPanel = () => {
  const { messages, inputValue, setInputValue, sendMessage, clearChat, isProcessing } = useChat();
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
  
  return (
    <ChatContainer>
      <ChatHeader>
        <h2>Chat</h2>
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
            placeholder="Ask a question about your data..."
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