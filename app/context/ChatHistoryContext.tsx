import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Types
interface Message {
  type: string; // Define more specific types if needed (e.g., 'user' | 'assistant' | 'error')
  content: string;
  // Add other message properties if they exist (e.g., timestamp, chart data)
}

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

interface ChatHistoryContextType {
  chatHistory: Chat[];
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  getCurrentChat: () => Chat | null;
  createNewChat: () => string; // Returns the ID of the new chat
  addMessageToCurrentChat: (message: Message) => void;
  deleteChat: (chatId: string) => void;
  clearAllChats: () => void;
}

// Create context
const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

// Custom hook to use the chat history context
export const useChatHistory = (): ChatHistoryContextType => {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
};

interface ChatHistoryProviderProps {
  children: ReactNode;
}

export const ChatHistoryProvider: React.FC<ChatHistoryProviderProps> = ({ children }) => {
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        const parsedHistory: Chat[] = JSON.parse(savedHistory);
        setChatHistory(parsedHistory);
        
        if (parsedHistory.length > 0) {
          setCurrentChatId(parsedHistory[0].id);
        } else {
           // If saved history is empty, create a new chat
           createNewChat();
        }
      } catch (error) {
        console.error('Error parsing chat history:', error);
        setChatHistory([]);
        createNewChat(); // Create a new chat if parsing fails
      }
    } else {
      createNewChat(); // Create a new chat if none exists in localStorage
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Added createNewChat to deps array might cause loop, disable for now

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    } else {
      // Optionally clear localStorage if history is empty
      localStorage.removeItem('chatHistory');
    }
  }, [chatHistory]);

  // Create a new chat
  const createNewChat = (): string => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat', // Default title
      createdAt: new Date().toISOString(),
      messages: []
    };
    
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    console.log("Created new chat:", newChat.id);
    return newChat.id;
  };

  // Get current chat
  const getCurrentChat = (): Chat | null => {
    return chatHistory.find(chat => chat.id === currentChatId) || null;
  };

  // Add message to current chat
  const addMessageToCurrentChat = (message: Message) => {
    let chatIdToUpdate = currentChatId;

    // If there's no current chat, create one first
    if (!chatIdToUpdate) {
      console.log("No current chat, creating new one before adding message.");
      chatIdToUpdate = createNewChat();
    }
    
    setChatHistory(prev => 
      prev.map(chat => {
        if (chat.id === chatIdToUpdate) {
          let newTitle = chat.title;
          // Update title only if it's the default and the first user message
          if (chat.messages.length === 0 && chat.title === 'New Chat' && message.type === 'user') {
             newTitle = message.content.length > 30 
               ? `${message.content.substring(0, 30)}...` 
               : message.content;
          }
          return {
            ...chat,
            title: newTitle,
            messages: [...chat.messages, message]
          };
        }
        return chat;
      })
    );
  };

  // Delete a chat
  const deleteChat = (chatId: string) => {
    setChatHistory(prev => {
      const newHistory = prev.filter(chat => chat.id !== chatId);
      
      if (chatId === currentChatId) {
        if (newHistory.length > 0) {
          // Set current chat to the first remaining chat
          setCurrentChatId(newHistory[0].id);
        } else {
          // If the last chat was deleted, create a new one
          // Delaying might be needed if createNewChat causes issues within setState
          setTimeout(() => createNewChat(), 0); 
        }
      } else if (newHistory.length === 0) {
         // If history becomes empty after deleting a non-current chat
         setTimeout(() => createNewChat(), 0);
      }
      return newHistory;
    });
  };

  // Clear all chats
  const clearAllChats = () => {
    setChatHistory([]);
    // Create a new chat after clearing
    createNewChat(); 
  };

  // Value object to be provided by the context
  const value: ChatHistoryContextType = {
    chatHistory,
    currentChatId,
    setCurrentChatId,
    getCurrentChat,
    createNewChat,
    addMessageToCurrentChat,
    deleteChat,
    clearAllChats
  };

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
};

// Removed default export as it might cause issues with named exports
// export default ChatHistoryContext; 