import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const ChatHistoryContext = createContext();

// Custom hook to use the chat history context
export const useChatHistory = () => useContext(ChatHistoryContext);

export const ChatHistoryProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setChatHistory(parsedHistory);
        
        // Set current chat to the most recent one if it exists
        if (parsedHistory.length > 0) {
          setCurrentChatId(parsedHistory[0].id);
        }
      } catch (error) {
        console.error('Error parsing chat history:', error);
        // If there's an error, start fresh
        setChatHistory([]);
      }
    } else {
      // Create a new chat if none exists
      createNewChat();
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Create a new chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: []
    };
    
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  // Get current chat
  const getCurrentChat = () => {
    return chatHistory.find(chat => chat.id === currentChatId) || null;
  };

  // Add message to current chat
  const addMessageToCurrentChat = (message) => {
    if (!currentChatId) {
      const newChatId = createNewChat();
      setChatHistory(prev => {
        const updatedHistory = prev.map(chat => {
          if (chat.id === newChatId) {
            // Update chat title based on first user message if it's a user message
            let title = chat.title;
            if (message.type === 'user') {
              // Limit title to first 30 characters of first message
              title = message.content.length > 30 
                ? `${message.content.substring(0, 30)}...` 
                : message.content;
            }
            
            return {
              ...chat,
              title,
              messages: [...chat.messages, message]
            };
          }
          return chat;
        });
        return updatedHistory;
      });
    } else {
      setChatHistory(prev => {
        const updatedHistory = prev.map(chat => {
          if (chat.id === currentChatId) {
            // Update chat title if this is the first message and it's from the user
            let title = chat.title;
            if (chat.messages.length === 0 && message.type === 'user') {
              // Limit title to first 30 characters of first message
              title = message.content.length > 30 
                ? `${message.content.substring(0, 30)}...` 
                : message.content;
            }
            
            return {
              ...chat,
              title,
              messages: [...chat.messages, message]
            };
          }
          return chat;
        });
        return updatedHistory;
      });
    }
  };

  // Delete a chat
  const deleteChat = (chatId) => {
    console.log("ChatHistoryContext: Deleting chat with ID:", chatId);
    
    // Store the current chat ID for reference
    const currentId = currentChatId;
    const currentHistoryLength = chatHistory.length;
    
    // Update chat history first
    setChatHistory(prev => {
      const newHistory = prev.filter(chat => chat.id !== chatId);
      console.log("New chat history after deletion:", newHistory);
      
      // Handle current chat selection in the same update to avoid timing issues
      if (chatId === currentId) {
        if (newHistory.length > 0) {
          // Set current chat to the first remaining chat
          setTimeout(() => {
            console.log("Setting current chat to:", newHistory[0].id);
            setCurrentChatId(newHistory[0].id);
          }, 0);
        } else {
          // Create a new chat if we deleted the last one
          setTimeout(() => {
            console.log("Creating new chat after deletion");
            createNewChat();
          }, 0);
        }
      } else if (currentHistoryLength <= 1) {
        // If we deleted the last chat, create a new one
        setTimeout(() => {
          console.log("Creating new chat after deleting the last one");
          createNewChat();
        }, 0);
      }
      
      return newHistory;
    });
  };

  // Clear all chats
  const clearAllChats = () => {
    setChatHistory([]);
    const newChatId = createNewChat();
    setCurrentChatId(newChatId);
  };

  // Value object to be provided by the context
  const value = {
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

export default ChatHistoryContext; 