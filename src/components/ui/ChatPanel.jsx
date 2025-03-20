"use client"

import React, { useState, useRef, useEffect } from "react"
import { Plus, Clock, Send, BarChart, Trash2, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"
import ChartDisplay from "../ChartDisplay"
import { useChatHistory } from "../../context/ChatHistoryContext"

/**
 * Chat panel component for the spreadsheet application
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onCreateChart - Function to call when a chart should be created
 */
export function ChatPanel({ onCreateChart }) {
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", message: "Hello! How can I help you with your spreadsheet today?" },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chatId: null })
  const chatContainerRef = useRef(null)
  const historyRef = useRef(null)
  
  // Use the chat history context
  const { 
    chatHistory, 
    currentChatId, 
    setCurrentChatId, 
    createNewChat, 
    deleteChat 
  } = useChatHistory()

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])
  
  // Handle clicks outside of history dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setHistoryDropdownOpen(false)
      }
    }
    
    // Handle clicks outside context menu to close it
    function handleGlobalClick() {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false })
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("click", handleGlobalClick)
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("click", handleGlobalClick)
    }
  }, [contextMenu])

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    // Add user message
    setChatMessages((prev) => [...prev, { sender: "user", message: inputMessage }])

    // Simulate AI response
    setTimeout(() => {
      // Check if the message might be asking for a chart
      if (inputMessage.toLowerCase().includes('chart') || 
          inputMessage.toLowerCase().includes('graph') || 
          inputMessage.toLowerCase().includes('plot') ||
          inputMessage.toLowerCase().includes('visualize')) {
        
        // Create chart data
        const chartData = {
          id: Date.now(),
          type: "bar",
          title: "Data Visualization",
          data: {
            headers: ["Category", "Value"],
            data: [
              ["Item A", "42"],
              ["Item B", "28"],
              ["Item C", "15"],
              ["Item D", "65"]
            ]
          }
        }
        
        // Add a simulated chart response
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            message: "Here's a chart based on your data:",
            chartData: chartData
          },
        ])
        
        // Notify the parent component about the new chart
        if (onCreateChart) {
          onCreateChart(chartData)
        }
      } else {
        // Add a regular text response
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            message: "Processing your request about the spreadsheet...",
          },
        ])
      }
    }, 500)

    setInputMessage("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startNewChat = () => {
    createNewChat();
    setChatMessages([
      { sender: "ai", message: "Starting a new conversation. How can I help you with your spreadsheet?" },
    ])
    setHistoryDropdownOpen(false);
  }
  
  const handleChartButtonClick = () => {
    // Create a new chart when the chart button is clicked
    const chartData = {
      id: Date.now(),
      type: "line",
      title: "Quick Chart",
      data: {
        headers: ["Month", "Sales"],
        data: [
          ["Jan", "40"],
          ["Feb", "45"],
          ["Mar", "55"],
          ["Apr", "60"],
          ["May", "65"]
        ]
      }
    }
    
    // Add a message about the chart
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        message: "I've created a line chart for you:",
        chartData: chartData
      },
    ])
    
    // Notify the parent component
    if (onCreateChart) {
      onCreateChart(chartData)
    }
  }
  
  const handleContextMenu = (e, chatId) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      chatId: chatId
    })
  }
  
  const handleDeleteChat = () => {
    if (contextMenu.chatId) {
      deleteChat(contextMenu.chatId);
      setContextMenu({ visible: false, x: 0, y: 0, chatId: null });
    }
  }

  const toggleHistoryDropdown = () => {
    setHistoryDropdownOpen(!historyDropdownOpen);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-3 border-b">
        <h2 className="font-semibold">AI Assistant</h2>
        <p className="text-sm text-gray-500">Ask the AI to help you with your spreadsheet</p>
        <div className="flex mt-2 justify-between">
          <button
            onClick={startNewChat}
            className="text-sm flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded"
          >
            <Plus size={16} /> New Chat
          </button>
          <div className="relative" ref={historyRef}>
            <button 
              onClick={toggleHistoryDropdown}
              className="text-sm flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded"
            >
              <Clock size={16} /> History 
              <span className="bg-gray-200 text-xs rounded-full px-1.5">{chatHistory.length}</span>
              <ChevronDown size={14} className={cn("transition-transform", historyDropdownOpen ? "rotate-180" : "")} />
            </button>
            
            {/* History Dropdown */}
            {historyDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 max-h-80 overflow-y-auto bg-white border rounded-md shadow-lg z-20">
                {chatHistory.length === 0 ? (
                  <div className="p-3 text-center text-gray-500 text-sm">No chat history yet</div>
                ) : (
                  chatHistory.map((chat) => (
                    <div 
                      key={chat.id} 
                      onClick={() => {
                        setCurrentChatId(chat.id);
                        setHistoryDropdownOpen(false);
                      }}
                      onContextMenu={(e) => handleContextMenu(e, chat.id)}
                      className={cn(
                        "p-2 cursor-pointer hover:bg-gray-50",
                        chat.id === currentChatId ? "bg-gray-100" : ""
                      )}
                    >
                      <p className="text-sm font-medium truncate">{chat.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(chat.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="fixed bg-white border rounded-md shadow-lg z-50 py-1"
          style={{ 
            top: `${contextMenu.y}px`, 
            left: `${contextMenu.x}px`,
          }}
        >
          <button 
            onClick={handleDeleteChat}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
          >
            <Trash2 size={14} /> Delete Chat
          </button>
        </div>
      )}

      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-4">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={cn("p-2 rounded-lg max-w-[90%]", msg.sender === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100")}
          >
            <p className="text-sm">{msg.message}</p>
            
            {/* Render chart if the message contains chart data */}
            {msg.chartData && (
              <div className="mt-2">
                <ChartDisplay 
                  type={msg.chartData.type} 
                  data={msg.chartData.data} 
                  title={msg.chartData.title} 
                  inChat={true}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-3 border-t">
        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your spreadsheet..."
            className="w-full p-2 pr-10 border rounded-md resize-none bg-gray-50"
            rows={2}
          />
          <button 
            onClick={sendMessage} 
            className="absolute right-3 top-[14px] text-gray-500 hover:text-gray-700"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>Try: "Create a bar chart from column A and B"</span>
          <button 
            onClick={handleChartButtonClick}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
          >
            <BarChart size={14} /> Chart
          </button>
        </div>
      </div>
    </div>
  )
} 