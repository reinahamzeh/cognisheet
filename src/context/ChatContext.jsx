import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useSpreadsheet } from './SpreadsheetContext';
import { io } from 'socket.io-client';
import nlp from 'compromise';

// Create context
const ChatContext = createContext();

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const { getSelectedData, rows, headers } = useSpreadsheet();
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    // Connect to the socket server
    const newSocket = io('http://localhost:4000');
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('query-result', (data) => {
      setMessages(prev => [...prev, { type: 'response', content: data.result }]);
      setIsProcessing(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to server. Make sure the server is running.');
    });

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Function to send a message
  const sendMessage = (message) => {
    if (!message.trim()) return;

    // Add user message to the chat
    const userMessage = { type: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setInputValue('');
    
    // Set processing state
    setIsProcessing(true);

    // Get selected data if any
    const selectedData = getSelectedData();

    // Process the query locally first using compromise
    const doc = nlp(message);
    
    // Check if it's a calculation query
    if (doc.has('(sum|average|mean|max|min|count)')) {
      processCalculationQuery(message, selectedData);
    } 
    // Check if it's a chart query
    else if (doc.has('(chart|graph|plot|visualize|visualization)')) {
      processChartQuery(message, selectedData);
    }
    // Otherwise, send to server for processing
    else {
      if (socketRef.current) {
        socketRef.current.emit('query', { 
          message, 
          selectedData,
          allData: { rows, headers }
        });
      } else {
        handleError('Server connection not available');
      }
    }
  };

  // Process calculation queries locally
  const processCalculationQuery = (query, selectedData) => {
    if (!selectedData) {
      handleError('Please select a data range first');
      return;
    }

    try {
      const doc = nlp(query);
      let result = null;
      let operation = '';

      // Flatten the data for calculations
      const flatData = selectedData.data.flat().filter(val => !isNaN(Number(val))).map(Number);

      if (flatData.length === 0) {
        handleError('No numeric data found in the selection');
        return;
      }

      if (doc.has('sum')) {
        operation = 'sum';
        result = flatData.reduce((sum, val) => sum + val, 0);
      } else if (doc.has('average') || doc.has('mean')) {
        operation = 'average';
        result = flatData.reduce((sum, val) => sum + val, 0) / flatData.length;
      } else if (doc.has('max')) {
        operation = 'maximum';
        result = Math.max(...flatData);
      } else if (doc.has('min')) {
        operation = 'minimum';
        result = Math.min(...flatData);
      } else if (doc.has('count')) {
        operation = 'count';
        result = flatData.length;
      }

      if (result !== null) {
        const response = {
          type: 'response',
          content: `The ${operation} of the selected data is ${result.toFixed(2)}`,
          result,
          operation
        };
        setMessages(prev => [...prev, response]);
      } else {
        handleError('I could not understand the calculation you want to perform');
      }
    } catch (err) {
      handleError(`Error processing calculation: ${err.message}`);
    }

    setIsProcessing(false);
  };

  // Process chart queries locally
  const processChartQuery = (query, selectedData) => {
    if (!selectedData) {
      handleError('Please select a data range first');
      return;
    }

    try {
      const doc = nlp(query);
      let chartType = 'bar'; // Default chart type

      if (doc.has('bar')) {
        chartType = 'bar';
      } else if (doc.has('line')) {
        chartType = 'line';
      } else if (doc.has('pie')) {
        chartType = 'pie';
      }

      const response = {
        type: 'chart',
        content: `Here's a ${chartType} chart of your data`,
        chartType,
        data: selectedData
      };

      setMessages(prev => [...prev, response]);
    } catch (err) {
      handleError(`Error creating chart: ${err.message}`);
    }

    setIsProcessing(false);
  };

  // Handle errors
  const handleError = (errorMessage) => {
    setError(errorMessage);
    setMessages(prev => [...prev, { type: 'error', content: errorMessage }]);
    setIsProcessing(false);
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  // Value object to be provided by the context
  const value = {
    messages,
    inputValue,
    setInputValue,
    isProcessing,
    error,
    sendMessage,
    clearChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 