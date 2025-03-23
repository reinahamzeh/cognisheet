"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Send, User, PlusCircle, History, Brain, Edit, X, BarChart3, TableProperties, Globe, Check, StopCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

// Define props interface
interface AIChatPanelProps {
  selectedCellRange?: string | null
}

// Sample chat messages for demonstration
const initialMessages = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI assistant for CogniSheet. How can I help you with your spreadsheet today?",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    isEditing: false,
  },
]

// Sample chat history for demonstration
const sampleChatHistory = [
  { id: "chat1", title: "Sales Data Analysis", timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: "chat2", title: "Q1 Budget Calculations", timestamp: new Date(Date.now() - 172800000).toISOString() },
  { id: "chat3", title: "Employee Schedule", timestamp: new Date(Date.now() - 259200000).toISOString() },
]

// Suggested prompt buttons
const suggestedPrompts = [
  { id: "analyze", text: "Analyze Data", icon: <TableProperties className="h-3 w-3 mr-1" /> },
  { id: "chart", text: "Generate a Chart", icon: <BarChart3 className="h-3 w-3 mr-1" /> },
  { id: "formula", text: "Add Formulas", icon: <Brain className="h-3 w-3 mr-1" /> },
  { id: "web", text: "Web Search", icon: <Globe className="h-3 w-3 mr-1" /> },
]

export default function AIChatPanel({ selectedCellRange }: AIChatPanelProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [chatHistory] = useState(sampleChatHistory)
  const [isStopping, setIsStopping] = useState(false)
  const [chatTitle, setChatTitle] = useState("New Conversation")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle cell range selection via Cmd+K
  useEffect(() => {
    if (selectedCellRange) {
      const updatedInput = input ? 
        `${input} [Range: ${selectedCellRange}]` : 
        `Analyze data in range ${selectedCellRange}`
      
      setInput(updatedInput)
      inputRef.current?.focus()
    }
  }, [selectedCellRange])

  // Handle sending a message
  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
      isEditing: false,
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
        isEditing: false,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  // Handle stopping AI generation
  const handleStopGeneration = () => {
    setIsStopping(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsStopping(false)
    }, 500)
  }

  // Start a new chat
  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Hello! I'm your AI assistant for CogniSheet. How can I help you with your spreadsheet today?",
        timestamp: new Date().toISOString(),
        isEditing: false,
      },
    ])
    setChatTitle("New Conversation")
    setInput("")
    setShowChatHistory(false)
  }

  // Load a chat from history
  const handleLoadChat = (chatId: string, title: string) => {
    // In a real app, this would load the chat from a database
    console.log(`Loading chat ${chatId}`)
    setChatTitle(title)
    setShowChatHistory(false)
    // For demo purposes, we'll just start a new chat
    handleNewChat()
  }

  // Make message editable
  const handleEditMessage = (id: string) => {
    setMessages((prev) => 
      prev.map((msg) => 
        msg.id === id ? { ...msg, isEditing: true } : msg
      )
    )
  }

  // Save edited message
  const handleSaveEdit = (id: string, newContent: string) => {
    setMessages((prev) => 
      prev.map((msg) => 
        msg.id === id ? { ...msg, content: newContent, isEditing: false } : msg
      )
    )
  }

  // Cancel message edit
  const handleCancelEdit = (id: string) => {
    setMessages((prev) => 
      prev.map((msg) => 
        msg.id === id ? { ...msg, isEditing: false } : msg
      )
    )
  }

  // Handle chat title edit
  const handleEditTitle = () => {
    setIsEditingTitle(true)
  }

  // Save chat title
  const handleSaveTitle = (newTitle: string) => {
    setChatTitle(newTitle)
    setIsEditingTitle(false)
  }

  // Use a suggested prompt
  const handleSuggestedPrompt = (promptText: string) => {
    setInput(promptText)
    inputRef.current?.focus()
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

  // Handle rename of chat in history via right-click context menu
  const handleRenameChat = (id: string, newTitle: string) => {
    console.log(`Renaming chat ${id} to ${newTitle}`)
    // In a real app, this would update the chat title in a database
  }

  // Handle delete chat from history via right-click context menu
  const handleDeleteChat = (id: string) => {
    console.log(`Deleting chat ${id}`)
    // In a real app, this would delete the chat from a database
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between bg-background">
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-primary mr-2" />
          {isEditingTitle ? (
            <div className="flex items-center">
              <Input
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                className="h-7 text-sm font-medium w-48"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={() => setIsEditingTitle(false)} className="h-7 w-7 ml-1">
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <h2 className="font-medium cursor-pointer" onClick={handleEditTitle}>
              {chatTitle}
            </h2>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="New Chat" onClick={handleNewChat}>
            <PlusCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Chat History"
            onClick={() => setShowChatHistory(!showChatHistory)}
          >
            <History className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat History Panel */}
      {showChatHistory && (
        <div className="p-2 border-b bg-muted/40">
          <h3 className="text-sm font-medium mb-2">Recent Conversations</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {chatHistory.map((chat) => (
              <DropdownMenu key={chat.id}>
                <div className="flex items-center justify-between p-2 text-sm hover:bg-muted rounded cursor-pointer" onClick={() => handleLoadChat(chat.id, chat.title)}>
                  <div className="truncate flex-1">{chat.title}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(chat.timestamp)}</div>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => {
                    const newTitle = prompt("Enter new chat name:", chat.title)
                    if (newTitle) handleRenameChat(chat.id, newTitle)
                  }}>
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (confirm("Delete this chat?")) handleDeleteChat(chat.id)
                  }}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </div>
        </div>
      )}

      {/* Pro Tip */}
      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-xs border-b">
        <span className="font-medium text-blue-600 dark:text-blue-400">Tip:</span> Select multiple cells and press Cmd+K (or Ctrl+K) to instantly reference them in chat.
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-3 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block max-w-[85%] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={message.content}
                    onChange={(e) => {
                      setMessages((prev) =>
                        prev.map((msg) =>
                          msg.id === message.id
                            ? { ...msg, content: e.target.value }
                            : msg
                        )
                      )
                    }}
                    className="text-sm"
                    autoFocus
                  />
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleCancelEdit(message.id)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleSaveEdit(message.id, message.content)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.timestamp)}
                  </div>
                  {message.role === "user" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 absolute -right-7 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEditMessage(message.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 text-left">
            <div className="inline-block max-w-[85%] p-3 rounded-lg bg-muted relative">
              <div className="flex items-center gap-1">
                <div className="animate-bounce h-2 w-2 bg-primary rounded-full"></div>
                <div className="animate-bounce h-2 w-2 bg-primary rounded-full" style={{ animationDelay: "0.2s" }}></div>
                <div className="animate-bounce h-2 w-2 bg-primary rounded-full" style={{ animationDelay: "0.4s" }}></div>
              </div>
              {!isStopping && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-3 top-2 h-7 text-xs"
                  onClick={handleStopGeneration}
                >
                  <StopCircle className="h-3 w-3 mr-1" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="p-2 border-t flex flex-wrap gap-1">
        {suggestedPrompts.map((prompt) => (
          <Button 
            key={prompt.id} 
            variant="outline" 
            size="sm" 
            className="text-xs h-7"
            onClick={() => handleSuggestedPrompt(prompt.text)}
          >
            {prompt.icon}
            {prompt.text}
          </Button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t flex items-center gap-2">
        <Input
          placeholder="Ask anything about your spreadsheet data..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1"
          ref={inputRef}
        />
        <Button
          size="icon"
          disabled={!input.trim() || isLoading}
          onClick={handleSendMessage}
        >
          <Send className={`h-4 w-4 ${isLoading ? "opacity-50" : ""}`} />
        </Button>
      </div>
    </div>
  )
} 