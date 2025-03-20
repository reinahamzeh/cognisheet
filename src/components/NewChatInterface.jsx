import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import { useChatHistory } from '../context/ChatHistoryContext';
import { useSpreadsheet } from '../context/SpreadsheetContext';
import ChartDisplay from './ChartDisplay';
import RechartsDisplay from './RechartsDisplay';
import Markdown from 'react-markdown';

// Container
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.white};
`;

const ChatHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGrey}30;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h3`
  margin: 0;
  color: #000000;
  font-weight: 600;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-behavior: auto;
`;

const MessageBubble = styled.div`
  padding: 8px 10px;
  border-radius: 8px;
  max-width: 85%;
  word-wrap: break-word;
  line-height: 1.3;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  ${({ type, theme }) => {
    if (type === 'user') {
      return `
        align-self: flex-end;
        background-color: ${theme.colors.lightGrey};
        color: #000000;
        font-weight: normal;
      `;
    } else if (type === 'error') {
      return `
        align-self: flex-start;
        background-color: ${theme.colors.error};
        color: ${theme.colors.white};
        font-weight: normal;
      `;
    } else {
      return `
        align-self: flex-start;
        background-color: ${theme.colors.lightGrey};
        color: #000000;
        font-weight: normal;
      `;
    }
  }}
`;

const CodeBlock = styled.pre`
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #333;
  margin: 10px 0;
`;

const ChartContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 10px 0;
  padding: 10px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #000000;
  font-weight: 600;
  text-align: center;
`;

const ChartCanvas = styled.canvas`
  width: 100%;
  height: 300px;
`;

const InputContainer = styled.div`
  padding: 15px;
  border-top: 1px solid ${({ theme }) => theme.colors.lightGrey}30;
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 15px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.lightGrey}50;
  outline: none;
  font-size: 14px;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.darkGrey}50;
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.darkGrey}20;
  }
`;

const SendButton = styled.button`
  background-color: ${({ theme }) => theme.colors.darkGrey};
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.accent};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.lightGrey};
    cursor: not-allowed;
  }
`;

const LoadingIndicator = styled.div`
  align-self: center;
  padding: 10px;
  color: #000000;
  font-style: italic;
  font-weight: normal;
`;

const ChartInfo = styled.div`
  margin-top: 2px;
  text-align: center;
  font-size: 0.6em;
  color: ${({ theme }) => theme.colors.darkGrey};
  opacity: 0.8;
`;

const NewChatInterface = () => {
  const { inputValue, setInputValue, isProcessing, sendMessage } = useChat();
  const { addMessageToCurrentChat, currentChatId, getCurrentChat } = useChatHistory();
  const { getSelectedData } = useSpreadsheet();
  const [isLoading, setIsLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Get current chat and its messages
  const currentChat = getCurrentChat();
  const messages = currentChat?.messages || [];

  // Update local messages when current chat changes
  useEffect(() => {
    if (currentChat) {
      setLocalMessages(currentChat.messages);
    } else {
      setLocalMessages([]);
    }
  }, [currentChat, currentChatId]);

  // Update the useEffect for scrolling to bottom
  useEffect(() => {
    // Only scroll to bottom if user is already at the bottom or a new message is added
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      
      if (isAtBottom) {
        // Use requestAnimationFrame to ensure DOM is updated before scrolling
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        });
      }
    }
  }, [localMessages, messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = { type: 'user', content: inputValue };
    
    // Update local messages immediately to show user message
    setLocalMessages(prev => [...prev, userMessage]);
    
    // Add user message to current chat
    addMessageToCurrentChat(userMessage);
    
    // Show loading indicator
    setIsLoading(true);
    setInputValue('');
    
    try {
      // Get AI response
      const response = await sendMessage(inputValue);
      
      if (response) {
        // Update local messages with AI response
        setLocalMessages(prev => [...prev, response]);
        
        // Add AI response to current chat
        addMessageToCurrentChat(response);
        
        // Handle chart response
        if (response.type === 'chart' && response.chartType && response.data) {
          // Auto-switch to charts tab if it's a chart response
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('switchToChartsTab');
            window.dispatchEvent(event);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        type: 'error', 
        content: `Error: ${error.message || 'Failed to get response'}` 
      };
      // Update local messages with error
      setLocalMessages(prev => [...prev, errorMessage]);
      addMessageToCurrentChat(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Render message content with support for code blocks
  const renderMessageContent = (content) => {
    if (typeof content !== 'string') return content;
    
    // Check if content contains markdown code blocks
    if (content.includes('```')) {
      return <Markdown>{content}</Markdown>;
    }
    
    return content;
  };

  // Find chart messages to render
  const chartMessages = localMessages.filter(msg => msg.type === 'chart');

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>AI Assistant</ChatTitle>
      </ChatHeader>
      
      <MessagesContainer>
        {localMessages.map((message, index) => (
          <React.Fragment key={index}>
            <MessageBubble type={message.type}>
              {renderMessageContent(message.content)}
            </MessageBubble>
            
            {/* Render chart immediately after its message */}
            {message.type === 'chart' && message.chartType && message.data && (
              <>
                <RechartsDisplay 
                  type={message.chartType}
                  data={message.data}
                  title={message.title}
                  inChat={true}
                />
                <ChartInfo>
                  Saved to <strong>Charts</strong> tab
                </ChartInfo>
              </>
            )}
          </React.Fragment>
        ))}
        
        {isLoading && (
          <LoadingIndicator>AI is thinking...</LoadingIndicator>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about your data..."
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
        />
        <SendButton 
          onClick={handleSubmit} 
          disabled={!inputValue.trim() || isLoading}
        >
          Send
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default NewChatInterface; 