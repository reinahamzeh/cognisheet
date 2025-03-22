import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useSpreadsheet } from './SpreadsheetContext';
import { io } from 'socket.io-client';
import nlp from 'compromise';
import { sendMessageToOpenAI } from '../services/openai';

// Create context
const ChatContext = createContext();

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const { getSelectedData, rows, headers, getAllData, fileName, addChart } = useSpreadsheet();
  const socketRef = useRef(null);
  const [previousMessages, setPreviousMessages] = useState([]);

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
  const sendMessage = async (message) => {
    if (!message.trim()) return null;
    
    // Set processing state
    setIsProcessing(true);

    try {
      // Always use all data to ensure AI has complete context
      const allData = getAllData();
      
      // If there's selected data, also provide that for context
      const selectedData = getSelectedData();
      
      // Use all data as the primary data source
      const dataToUse = allData;
      
      // Add information about selected data if available
      if (selectedData) {
        dataToUse.selectedData = selectedData;
        dataToUse.hasSelection = true;
      }
      
      // Add file name for context
      if (fileName) {
        dataToUse.fileName = fileName;
      }
      
      // Handle chart requests
      const doc = nlp(message);
      if (doc.has('(chart|graph|plot|visualize|visualization)')) {
        const response = await processChartQuery(message, selectedData || dataToUse);
        setIsProcessing(false);
        return response;
      }

      // Handle calculation queries
      if (doc.has('(sum|average|mean|max|min|count)') && (selectedData || dataToUse)) {
        const response = await processCalculationQuery(message, selectedData || dataToUse);
        setIsProcessing(false);
        return response;
      }
      
      // Handle formula generation
      if (doc.has('(formula|equation|calculate)')) {
        const response = generateFormula(message, selectedData || dataToUse);
        setIsProcessing(false);
        return response;
      }
      
      // Handle web research
      if (doc.has('(search|find online|web research|lookup)')) {
        const response = await performWebResearch(message);
        setIsProcessing(false);
        return response;
      }
      
      // Handle document data extraction
      if (doc.has('(extract|pdf|image|ocr|scan)')) {
        const response = await extractDocumentData(message);
        setIsProcessing(false);
        return response;
      }

      // Add the current message to previous messages
      const userMessage = { type: 'user', content: message };
      const updatedMessages = [...previousMessages, userMessage];
      
      // Send to OpenAI with complete context
      const aiResponse = await sendMessageToOpenAI(
        message, 
        updatedMessages.slice(-10), // Send last 10 messages for context
        dataToUse // Send all data
      );
      
      // Update previous messages with AI response
      const aiMessageObj = { type: 'response', content: aiResponse };
      setPreviousMessages([...updatedMessages, aiMessageObj]);
      
      setIsProcessing(false);
      return aiMessageObj;
    } catch (err) {
      console.error('Error in sendMessage:', err);
      const errorResponse = { type: 'error', content: `AI Error: ${err.message}` };
      setError(err.message);
      setIsProcessing(false);
      return errorResponse;
    }
  };

  // Process calculation queries locally
  const processCalculationQuery = async (query, selectedData) => {
    if (!selectedData) {
      return { type: 'error', content: 'No data available for calculation' };
    }

    try {
      const doc = nlp(query);
      let result = null;
      let operation = '';

      // Check if we're dealing with distance data
      const isDistanceData = selectedData.headers && 
        selectedData.headers.some(header => 
          header.toLowerCase().includes('distance') || 
          header.toLowerCase().includes('miles') || 
          header.toLowerCase().includes('km')
        );

      // If this is distance data and we're looking for a sum, we should use average instead
      if (isDistanceData && doc.has('sum')) {
        operation = 'average';
      } else if (doc.has('sum')) {
        operation = 'sum';
      } else if (doc.has('average') || doc.has('mean')) {
        operation = 'average';
      } else if (doc.has('max')) {
        operation = 'maximum';
      } else if (doc.has('min')) {
        operation = 'minimum';
      } else if (doc.has('count')) {
        operation = 'count';
      }

      // If we're dealing with distance data and multiple entries for the same entity,
      // we need to group by the entity first
      if (isDistanceData && selectedData.headers && selectedData.headers.length >= 2) {
        // Assume first column is the entity (e.g., company) and second column is the distance
        const entityIndex = 0; // First column
        const distanceIndex = selectedData.headers.findIndex(header => 
          header.toLowerCase().includes('distance') || 
          header.toLowerCase().includes('miles') || 
          header.toLowerCase().includes('km')
        );
        
        const valueIndex = distanceIndex >= 0 ? distanceIndex : 1; // Use found distance column or default to second column
        
        // Group by entity
        const entityGroups = new Map();
        const entityCounts = new Map();
        
        selectedData.data.forEach(row => {
          const entity = String(row[entityIndex] || '');
          const value = parseFloat(row[valueIndex]);
          
          if (!isNaN(value) && entity) {
            if (entityGroups.has(entity)) {
              entityGroups.set(entity, entityGroups.get(entity) + value);
              entityCounts.set(entity, entityCounts.get(entity) + 1);
            } else {
              entityGroups.set(entity, value);
              entityCounts.set(entity, 1);
            }
          }
        });
        
        // Calculate averages for each entity
        const averages = [];
        for (const [entity, sum] of entityGroups.entries()) {
          const count = entityCounts.get(entity);
          averages.push(sum / count);
        }
        
        // Now perform the requested operation on the averages
        if (operation === 'average') {
          result = averages.reduce((sum, val) => sum + val, 0) / averages.length;
        } else if (operation === 'maximum') {
          result = Math.max(...averages);
        } else if (operation === 'minimum') {
          result = Math.min(...averages);
        } else if (operation === 'count') {
          result = averages.length;
        } else {
          // Default to average for distance data
          result = averages.reduce((sum, val) => sum + val, 0) / averages.length;
        }
      } else {
        // Regular calculation for non-distance data
        // Flatten the data for calculations
        const flatData = selectedData.data.flat().filter(val => !isNaN(Number(val))).map(Number);

        if (flatData.length === 0) {
          return { type: 'error', content: 'No numeric data found in the selection' };
        }

        if (operation === 'sum') {
          result = flatData.reduce((sum, val) => sum + val, 0);
        } else if (operation === 'average') {
          result = flatData.reduce((sum, val) => sum + val, 0) / flatData.length;
        } else if (operation === 'maximum') {
          result = Math.max(...flatData);
        } else if (operation === 'minimum') {
          result = Math.min(...flatData);
        } else if (operation === 'count') {
          result = flatData.length;
        }
      }

      if (result !== null) {
        return {
          type: 'response',
          content: `The ${operation} of the selected data is ${result.toFixed(2)}`,
          result,
          operation
        };
      } else {
        return { type: 'error', content: 'I could not understand the calculation you want to perform' };
      }
    } catch (err) {
      return { type: 'error', content: `Error processing calculation: ${err.message}` };
    }
  };

  // Process chart queries locally
  const processChartQuery = async (query, selectedData) => {
    if (!selectedData || !selectedData.headers || !selectedData.data) {
      return { type: 'error', content: 'No data available for visualization' };
    }

    try {
      const doc = nlp(query);
      
      // Detect chart type
      let chartType = 'bar'; // Default chart type
      
      if (doc.has('(bar|column) (chart|graph|plot)')) {
        chartType = 'bar';
      } else if (doc.has('(line|trend) (chart|graph|plot)')) {
        chartType = 'line';
      } else if (doc.has('(pie|donut|doughnut) (chart|graph|plot)')) {
        chartType = 'pie';
      } else if (doc.has('(scatter|bubble) (chart|graph|plot)')) {
        chartType = 'scatter';
      } else if (doc.has('(radar|spider|web) (chart|graph|plot)')) {
        chartType = 'radar';
      } else if (doc.has('(polar|area) (chart|graph|plot)')) {
        chartType = 'polarArea';
      }
      
      // Detect if we need to perform any data transformation
      const dataTransformation = detectDataTransformation(query);
      
      // Transform data if necessary
      let transformedData = selectedData;
      if (dataTransformation) {
        transformedData = applyDataTransformation(selectedData, dataTransformation);
      }
      
      // Select appropriate columns for the chart
      const { categories, values } = selectChartColumns(transformedData, chartType, query);
      
      // Create chart data in the format expected by ChartDisplay
      const chartData = {
        headers: [categories.name, values.name],
        data: categories.values.map((category, index) => [
          category,
          values.values[index] || 0
        ])
      };
      
      // Create chart ID and title
      const chartId = Date.now();
      const chartTitle = generateChartTitle(query, categories.name, values.name);
      
      // Create chart object
      const chart = {
        id: chartId,
        type: chartType,
        title: chartTitle,
        data: chartData
      };
      
      // Add chart to spreadsheet
      if (addChart) {
        addChart(chart);
      }
      
      // Return chart message
      return {
        type: 'chart',
        content: chartTitle,
        chartId,
        chartType,
        data: chartData
      };
      
    } catch (err) {
      console.error('Error in processChartQuery:', err);
      return { type: 'error', content: `Failed to create chart: ${err.message}` };
    }
  };

  // Helper function to detect necessary data transformations
  const detectDataTransformation = (query) => {
    const doc = nlp(query);
    
    // Check for aggregation
    if (doc.has('(group|aggregate) by')) {
      return { type: 'aggregate' };
    }
    
    // Check for sorting
    if (doc.has('(sort|order) by')) {
      return { type: 'sort' };
    }
    
    // Check for filtering
    if (doc.has('(filter|where|only)')) {
      return { type: 'filter' };
    }
    
    return null;
  };

  // Helper function to apply data transformations
  const applyDataTransformation = (data, transformation) => {
    if (!data || !transformation) return data;
    
    const { type } = transformation;
    
    if (type === 'aggregate') {
      // Implement aggregation logic
      // This would group data by a specific column and aggregate values
      return data; // Placeholder
    }
    
    if (type === 'sort') {
      // Implement sorting logic
      return data; // Placeholder
    }
    
    if (type === 'filter') {
      // Implement filtering logic
      return data; // Placeholder
    }
    
    return data;
  };

  // Helper function to select appropriate columns for a chart
  const selectChartColumns = (data, chartType, query) => {
    if (!data || !data.headers || !data.data || data.headers.length < 2) {
      throw new Error('Insufficient data for chart creation');
    }
    
    // Try to intelligently select categories and values columns
    let categoriesCol = 0; // Default to first column for categories
    let valuesCol = 1;     // Default to second column for values
    
    // Check for numeric columns
    const numericCols = [];
    const textCols = [];
    
    data.headers.forEach((header, index) => {
      // Check if data in this column is mostly numeric
      const numericValues = data.data.filter(row => !isNaN(row[index])).length;
      const percentNumeric = numericValues / data.data.length;
      
      if (percentNumeric > 0.7) {
        numericCols.push(index);
      } else {
        textCols.push(index);
      }
    });
    
    // For bar, line, and radar charts, we need one category column and one value column
    if (['bar', 'line', 'radar', 'pie', 'polarArea'].includes(chartType)) {
      if (textCols.length > 0) {
        categoriesCol = textCols[0]; // Use the first text column for categories
      }
      
      if (numericCols.length > 0) {
        valuesCol = numericCols[0]; // Use the first numeric column for values
      }
    }
    
    // For scatter charts, we need two numeric columns
    if (chartType === 'scatter') {
      if (numericCols.length >= 2) {
        categoriesCol = numericCols[0]; // X-axis
        valuesCol = numericCols[1];     // Y-axis
      }
    }
    
    // Look for specific column mentions in the query
    const doc = nlp(query);
    const tokens = doc.terms().out('array');
    
    data.headers.forEach((header, index) => {
      // If the header name is mentioned in the query, use it
      if (tokens.some(token => header.toLowerCase().includes(token.toLowerCase()))) {
        if (numericCols.includes(index)) {
          valuesCol = index;
        } else {
          categoriesCol = index;
        }
      }
    });
    
    // Extract the columns
    const categories = {
      name: data.headers[categoriesCol],
      values: data.data.map(row => row[categoriesCol])
    };
    
    const values = {
      name: data.headers[valuesCol],
      values: data.data.map(row => {
        const val = row[valuesCol];
        return isNaN(val) ? 0 : parseFloat(val);
      })
    };
    
    return { categories, values };
  };

  // Helper function to generate a chart title
  const generateChartTitle = (query, categoriesName, valuesName) => {
    // Extract keywords from query
    const tokens = nlp(query).terms().out('array');
    
    // Predefined title options
    const titleOptions = [
      `${valuesName} by ${categoriesName}`,
      `${categoriesName} vs ${valuesName}`,
      `${valuesName} across ${categoriesName}`,
      `Analysis of ${valuesName} by ${categoriesName}`
    ];
    
    // Use tokens to create a more relevant title
    if (tokens.includes('distribution')) {
      return `Distribution of ${valuesName} by ${categoriesName}`;
    } else if (tokens.includes('comparison')) {
      return `Comparison of ${valuesName} across ${categoriesName}`;
    } else if (tokens.includes('trend') || tokens.includes('over time')) {
      return `${valuesName} Trend over ${categoriesName}`;
    }
    
    // Default to the first option
    return titleOptions[0];
  };

  // New function for formula generation
  const generateFormula = (query, selectedData) => {
    if (!selectedData) {
      return { type: 'error', content: 'No data available for formula generation' };
    }
    
    try {
      const doc = nlp(query);
      let formula = '=';
      
      // Generate SUM formula
      if (doc.has('(sum|total|add)')) {
        formula = '=SUM(';
      }
      // Generate AVERAGE formula
      else if (doc.has('(average|mean)')) {
        formula = '=AVERAGE(';
      }
      // Generate COUNT formula
      else if (doc.has('count')) {
        formula = '=COUNT(';
      }
      // Generate MIN formula
      else if (doc.has('(min|minimum|smallest)')) {
        formula = '=MIN(';
      }
      // Generate MAX formula
      else if (doc.has('(max|maximum|largest)')) {
        formula = '=MAX(';
      }
      // Generate IF formula
      else if (doc.has('if')) {
        formula = '=IF(';
      }
      // Default to custom formula
      else {
        return { 
          type: 'response', 
          content: 'I need more information to generate a formula. Try asking for a specific calculation like sum, average, or count.'
        };
      }
      
      // Determine range from selected data
      let range = '';
      
      if (selectedData.selectedRange) {
        const { startCol, startRow, endCol, endRow } = selectedData.selectedRange;
        range = `${startCol}${startRow}:${endCol}${endRow}`;
      } else {
        // If no range is selected, suggest using one
        return { 
          type: 'response', 
          content: 'Please select a range of cells first by highlighting them, then ask again.'
        };
      }
      
      // Add range to formula
      formula += range + ')';
      
      // For IF formulas, add additional parameters
      if (formula.startsWith('=IF(')) {
        formula = `=IF(${range}>0,"Positive","Negative")`;
      }
      
      return { 
        type: 'formula', 
        content: `Here's a formula you can use: ${formula}`,
        formula
      };
      
    } catch (err) {
      console.error('Error in generateFormula:', err);
      return { type: 'error', content: `Failed to generate formula: ${err.message}` };
    }
  };

  // Add a new function for web research (mock implementation for now)
  const performWebResearch = async (query) => {
    // This would integrate with external APIs for web scraping
    return {
      type: 'response',
      content: `Web research feature coming soon! Your query was: "${query}"`
    };
  };

  // Add a new function for document data extraction (mock implementation for now)
  const extractDocumentData = async (query) => {
    // This would integrate with OCR and PDF extraction tools
    return {
      type: 'response',
      content: `Document data extraction feature coming soon! Your query was: "${query}"`
    };
  };

  // Value object to be provided by the context
  const value = {
    inputValue,
    setInputValue,
    isProcessing,
    error,
    sendMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 