"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Send, User, Sparkles, PlusCircle, History, Brain } from "lucide-react"

// Sample chat messages for demonstration
const initialMessages = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI assistant for CogniSheet. How can I help you with your spreadsheet today?",
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
]

// Sample chat history for demonstration
const sampleChatHistory = [
  { id: "chat1", title: "Sales Data Analysis", timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: "chat2", title: "Q1 Budget Calculations", timestamp: new Date(Date.now() - 172800000).toISOString() },
  { id: "chat3", title: "Employee Schedule", timestamp: new Date(Date.now() - 259200000).toISOString() },
]

export default function AIChatPanel() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [chatHistory] = useState(sampleChatHistory)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle sending a message
  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponses = [
        "I can help with that! To create a sum formula, select the cell where you want the result, then type =SUM(range) where 'range' is the cells you want to add.",
        "Let me analyze your data. Based on the numbers in columns B through D, a bar chart would be the best visualization. Would you like me to create one for you?",
        "I've formatted your selection with currency formatting. Would you like me to apply this to other columns as well?",
        "I notice you're working with dates. Would you like me to help you create a timeline chart or calculate date differences?",
      ]

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  // Start a new chat
  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Hello! I'm your AI assistant for CogniSheet. How can I help you with your spreadsheet today?",
        timestamp: new Date().toISOString(),
      },
    ])
    setInput("")
    setShowChatHistory(false)
  }

  // Load a chat from history
  const handleLoadChat = (chatId: string) => {
    // In a real app, this would load the chat from a database
    console.log(`Loading chat ${chatId}`)
    setShowChatHistory(false)
    // For demo purposes, we'll just start a new chat
    handleNewChat()
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format date for chat history
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between bg-background">
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-primary mr-2" />
          <h2 className="font-medium">AI Assistant</h2>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => setShowChatHistory(!showChatHistory)} title="Chat History">
            <History className="h-4 w-4 mr-1" />
            <span className="text-xs">History</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNewChat} title="New Chat">
            <PlusCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">New Chat</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Pro
          </Button>
        </div>
      </div>

      {showChatHistory ? (
        // Chat History View
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <h3 className="text-sm font-medium mb-2">Recent Conversations</h3>
          {chatHistory.map((chat) => (
            <div 
              key={chat.id} 
              className="p-2 rounded hover:bg-muted cursor-pointer flex justify-between items-center"
              onClick={() => handleLoadChat(chat.id)}
            >
              <div className="flex items-center">
                <Brain className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm">{chat.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(chat.timestamp)}</span>
            </div>
          ))}
        </div>
      ) : (
        // Messages container
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === "user" ? "bg-primary text-primary-foreground ml-4" : "bg-muted mr-4"
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.role === "assistant" ? <Brain className="h-4 w-4 mr-1" /> : <User className="h-4 w-4 mr-1" />}
                  <span className="text-xs opacity-70">
                    {message.role === "assistant" ? "Assistant" : "You"} • {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg p-3 bg-muted mr-4">
                <div className="flex items-center">
                  <Brain className="h-4 w-4 mr-1" />
                  <span className="text-xs opacity-70">Assistant</span>
                </div>
                <div className="mt-2 flex space-x-1">
                  <div
                    className="h-2 w-2 rounded-full bg-primary/30 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 rounded-full bg-primary/30 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 rounded-full bg-primary/30 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t bg-background">
        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your spreadsheet..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button size="icon" onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          <p>Try: "Sum column B" or "Create a chart from this data"</p>
        </div>
      </div>
    </div>
  )
} 