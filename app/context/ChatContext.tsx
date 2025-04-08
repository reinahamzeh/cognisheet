import React, { createContext, useState, useContext, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useSpreadsheet } from './spreadsheet-context'; // Corrected path
import { io, Socket } from 'socket.io-client';
import nlp from 'compromise';
import { sendMessageToOpenAI } from '../services/openai';

// Types
interface Message {
  type: 'user' | 'error' | 'system' | 'formula' | 'assistant' | 'chart' | 'response';
  content: string;
  chartId?: number;
  chartType?: string;
  data?: any; // Chart data or calculation result
  operation?: string; // Calculation operation
  formula?: string; // Suggested formula
  result?: number; // Calculation result
}

interface SelectedData {
  data: any[][];
  headers: string[];
  selectedRange?: {
    startCol: string;
    startRow: number;
    endCol: string;
    endRow: number;
  };
}

interface AllData {
  data: any[][];
  headers: string[];
  selectedData?: SelectedData;
  hasSelection?: boolean;
  fileName?: string;
}

interface ChartObject {
  id: number;
  type: string;
  title: string;
  data: any; // Chart data structure
}

export interface InputToken {
  id: string;
  type: 'text' | 'range';
  value: string;
}

interface ChatContextType {
  inputContent: InputToken[];
  setInputContent: (content: InputToken[]) => void;
  insertRangeToken: (range: string) => void;
  isProcessing: boolean;
  error: string | null;
  sendMessage: (content: InputToken[]) => Promise<Message | null>;
  messages: Message[];
  addMessage: (message: Message) => void;
  clearChat: () => void;
}

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Custom hook to use the chat context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState<InputToken[]>([{ type: 'text', value: '', id: Date.now().toString() }]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { 
    data: spreadsheetData, 
    fileName, 
    // TODO: Need functions like getSelectedData, getAllData, addChart from SpreadsheetContext
    // Replace these placeholders with actual functions from useSpreadsheet when implemented
    getSelectedData,
    getAllData,
    addChart
  } = useSpreadsheet() as any; // Cast as any temporarily until context is fully typed
  const socketRef = useRef<Socket | null>(null);
  const [previousMessages, setPreviousMessages] = useState<Message[]>([]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:4000');
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setError(null); // Clear error on successful connection
    });

    newSocket.on('query-result', (data: any) => {
      console.log('Received query result:', data);
      setIsProcessing(false);
      // Assuming the server sends back a message object
      addMessage({ type: 'assistant', content: data.result || 'Received result' });
    });

    newSocket.on('connect_error', (err: Error) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to server. Make sure the server is running.');
      setIsProcessing(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Function to add a message to the state
  const addMessage = useCallback((message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);
  
  // Function to clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setPreviousMessages([]); // Clear history for OpenAI context too
    setError(null);
  }, []);

  // Function to insert a range token (basic version: appends)
  const insertRangeToken = useCallback((range: string) => {
    // TODO: Implement cursor position logic for accurate insertion
    // For now, just append a new range token and an empty text token after it
    setInputContent(prevContent => [
      ...prevContent,
      { type: 'range', value: range, id: `range-${Date.now()}` },
      { type: 'text', value: '', id: `text-${Date.now()}` } // Add empty text token for typing after the pill
    ]);
    // Focus logic might need adjustment based on the new input element
    setTimeout(() => {
        const chatInputElement = document.getElementById('chat-input');
        if (chatInputElement) {
            chatInputElement.focus();
            // Setting cursor in contentEditable is more complex, might need Range/Selection API
        }
    }, 0);
  }, []);

  // Function to send a message (adapted for inputContent)
  const sendMessage = async (contentToSend: InputToken[]): Promise<Message | null> => {
    // Reconstruct the message text from tokens
    const messageText = contentToSend
      .map(token => token.value)
      .join('') // Simple join for now, might need spaces depending on tokenization
      .trim();
      
    if (!messageText) return null;

    // Add user message (reconstructed text)
    const userMessage: Message = { type: 'user', content: messageText };
    addMessage(userMessage); 
    
    // Clear input content after sending
    setInputContent([{ type: 'text', value: '', id: Date.now().toString() }]);
    
    setIsProcessing(true);
    setError(null);
    
    let responseMessage: Message | null = null;

    try {
      // Extract cell range if present (e.g., "A1:B5 What is the sum?")
      const rangeRegex = /^([A-Z]+[0-9]+:[A-Z]+[0-9]+)\s+/i;
      const rangeMatch = messageText.match(rangeRegex);
      let queryText = messageText;
      let selectedRangeData: SelectedData | null = null;
      
      if (rangeMatch && rangeMatch[1]) {
        const range = rangeMatch[1];
        queryText = messageText.replace(rangeRegex, '').trim(); // Remove range from query
        // TODO: Implement getSelectedDataByRange(range) in SpreadsheetContext
        // selectedRangeData = getSelectedDataByRange(range); 
        console.log(`Extracted range ${range} for query: ${queryText}`);
        // For now, let's assume we get some dummy data if needed by handlers
        selectedRangeData = { headers: [], data: [], selectedRange: {startCol: 'A', startRow: 1, endCol: 'A', endRow: 1} }; // Placeholder
      }
      
      // Use all data for general context
      const allData = getAllData ? getAllData() : { headers: [], data: [] }; 
      const dataContext: AllData = { 
        ...allData,
        selectedData: selectedRangeData || (getSelectedData ? getSelectedData() : null),
        hasSelection: !!selectedRangeData || !!(getSelectedData && getSelectedData()),
        fileName: fileName || undefined
      };
      
      const doc = nlp(queryText);

      // --- Route to specific handlers based on NLP --- 
      if (doc.has('(chart|graph|plot|visualize|visualization)')) {
        responseMessage = await processChartQuery(queryText, dataContext.selectedData || dataContext);
      } else if (doc.has('(sum|average|mean|max|min|count)') && dataContext.hasSelection) {
        responseMessage = await processCalculationQuery(queryText, dataContext.selectedData || dataContext);
      } else if (doc.has('(formula|equation|calculate)') && dataContext.hasSelection) {
        responseMessage = generateFormula(queryText, dataContext.selectedData || dataContext);
      } else if (doc.has('(search|find online|web research|lookup)')) {
        responseMessage = await performWebResearch(queryText);
      } else if (doc.has('(extract|pdf|image|ocr|scan)')) {
        responseMessage = await extractDocumentData(queryText);
      } else {
        // Default: Send to OpenAI (or socket if available)
        const updatedMessages = [...previousMessages, userMessage];
        
        if (socket && socket.connected) {
            console.log('Sending query via socket:', { message: queryText, context: dataContext });
            socket.emit('query', { message: queryText, context: dataContext });
            // We might get the result via socket listener, so don't assume immediate response here
            // Or we could wait for a specific event if the backend confirms receipt
            responseMessage = null; // Assume async response via socket listener
        } else {
             console.log('Sending query to OpenAI...');
            const aiResponseContent = await sendMessageToOpenAI(
                queryText,
                updatedMessages.slice(-10), // Send last 10 messages for context
                dataContext // Send spreadsheet context
            );
            responseMessage = { type: 'assistant', content: aiResponseContent };
        }
        
        if (responseMessage) {
          setPreviousMessages([...updatedMessages, responseMessage]);
        }
      }

    } catch (err) {
      console.error('Error in sendMessage:', err);
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      responseMessage = { type: 'error', content: `AI Error: ${errorMsg}` };
      setError(errorMsg);
    }
    
    setIsProcessing(false);
    if (responseMessage) {
      addMessage(responseMessage);
    }
    return responseMessage;
  };

  // --- Calculation, Chart, Formula, Web, Document Processing Functions --- 
  // (These functions need careful typing)

  const processCalculationQuery = async (query: string, data: SelectedData | AllData): Promise<Message> => {
    // ... (Implementation with types)
    return { type: 'error', content: 'Calculation logic not fully typed yet' }; // Placeholder
  };

  const processChartQuery = async (query: string, data: SelectedData | AllData): Promise<Message> => {
    // ... (Implementation with types)
     if (!addChart) {
       return { type: 'error', content: 'Charting function not available in context.' };
     }
     // Placeholder data for demonstration
     const chartDataExample = {
       headers: ['Category', 'Value'],
       data: [['A', 10], ['B', 20], ['C', 15]]
     };
     const chartId = Date.now();
     const chart: ChartObject = {
       id: chartId,
       type: 'bar', 
       title: 'Example Chart',
       data: chartDataExample
     };
     addChart(chart);
     return {
       type: 'chart',
       content: 'Generated an example chart.',
       chartId,
       chartType: chart.type,
       data: chart.data
     };
  };

  const detectDataTransformation = (query: string): { type: string } | null => {
    // ... (Implementation)
    return null;
  };

  const applyDataTransformation = (data: any, transformation: { type: string }): any => {
    // ... (Implementation)
    return data;
  };

  const selectChartColumns = (data: any, chartType: string, query: string): { categories: any, values: any } => {
    // ... (Implementation)
    // Placeholder return
    return { categories: { name: 'Col1', values: [] }, values: { name: 'Col2', values: [] } };
  };

  const generateChartTitle = (query: string, categoriesName: string, valuesName: string): string => {
    // ... (Implementation)
    return `Chart: ${valuesName} by ${categoriesName}`;
  };

  const generateFormula = (query: string, data: SelectedData | AllData): Message => {
    // ... (Implementation with types)
    if (!data || !(data as SelectedData).selectedRange) {
      return { type: 'error', content: 'Please select a range to generate a formula.' };
    }
    const range = `${(data as SelectedData).selectedRange!.startCol}${(data as SelectedData).selectedRange!.startRow}:${(data as SelectedData).selectedRange!.endCol}${(data as SelectedData).selectedRange!.endRow}`;
    const formula = `=SUM(${range})`; // Example
    return {
      type: 'formula',
      content: `Suggested formula: ${formula}`,
      formula
    };
  };

  const performWebResearch = async (query: string): Promise<Message> => {
    // ... (Implementation)
    return { type: 'response', content: `Web research for "${query}" coming soon!` };
  };

  const extractDocumentData = async (query: string): Promise<Message> => {
    // ... (Implementation)
    return { type: 'response', content: `Document extraction for "${query}" coming soon!` };
  };

  // Value object to be provided by the context
  const value: ChatContextType = {
    messages,
    addMessage,
    clearChat,
    inputContent,
    setInputContent,
    insertRangeToken,
    isProcessing,
    error,
    sendMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 