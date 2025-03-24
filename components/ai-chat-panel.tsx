"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRecoilState, useSetRecoilState } from "recoil"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Send, User, PlusCircle, History, Brain, Edit, X, BarChart3, TableProperties, Globe, Check, StopCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { selectedCellRangeState, isChatFocusedState, isChatOpenState, cmdKTriggeredState } from "../atoms/spreadsheetAtoms"
import { CellReference } from "./ui/CellReference"

// Define props interface
interface AIChatPanelProps {
  selectedCellRange?: string | null
}

// Sample chat messages for demonstration
const initialMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI assistant for CogniSheet. I'm here to help when you need me - just ask a question or use Cmd+K to reference cells.",
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

// Add new interface for cell data
interface CellData {
  value: string
  isBold: boolean
  isItalic: boolean
  textAlign: 'left' | 'center' | 'right'
  wrapText: boolean
}

// Add new interface for message with cell references
interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  isEditing: boolean
  cellReferences?: {
    range: string
    data?: { [key: string]: CellData }
  }[]
}

export default function AIChatPanel({ selectedCellRange }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [chatHistory] = useState(sampleChatHistory)
  const [isStopping, setIsStopping] = useState(false)
  const [chatTitle, setChatTitle] = useState("New Conversation")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Track active cell references for the current input
  const [activeCellReferences, setActiveCellReferences] = useState<string[]>([])
  
  // Use Recoil state for chat focus and selected cell range
  const [isChatFocused, setIsChatFocused] = useRecoilState(isChatFocusedState)
  const [recoilSelectedCellRange] = useRecoilState(selectedCellRangeState)
  const [isChatOpen, setIsChatOpen] = useRecoilState(isChatOpenState)
  const [cmdKTriggered] = useRecoilState(cmdKTriggeredState)

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle cell range selection via Cmd+K
  useEffect(() => {
    // Only process the cell range if:
    // 1. The chat is focused
    // 2. We have a new range
    // 3. The Cmd+K trigger has been activated
    if (recoilSelectedCellRange && isChatFocused && cmdKTriggered) {
      // Add the cell reference to the active references
      setActiveCellReferences(prev => {
        // Don't add duplicate references
        if (!prev.includes(recoilSelectedCellRange)) {
          return [...prev, recoilSelectedCellRange];
        }
        return prev;
      });
      
      // Focus the chat input
      inputRef.current?.focus();
    }
  }, [recoilSelectedCellRange, isChatFocused, cmdKTriggered]);

  // Handle input focus/blur events
  const handleInputFocus = () => {
    setIsChatFocused(true);
  };

  const handleInputBlur = () => {
    // Only blur if we're not in the middle of a Cmd+K operation
    // This prevents the chat from losing focus right after a cell selection
    setTimeout(() => {
      const activeElement = document.activeElement;
      const chatElements = document.querySelectorAll('.ai-chat-panel, .ai-chat-input');
      
      // Check if focus is still within any chat element
      let focusInChat = false;
      for (const el of chatElements) {
        if (el.contains(activeElement)) {
          focusInChat = true;
          break;
        }
      }
      
      // Only update focus state if focus is truly outside of chat
      if (!focusInChat) {
        setIsChatFocused(false);
      }
    }, 100);
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (!input.trim() && activeCellReferences.length === 0) return

    // Add user message with cell references
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
      isEditing: false,
      cellReferences: activeCellReferences.map(range => ({
        range,
        // In a real implementation, you would get the actual cell data here
        data: {}
      }))
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setActiveCellReferences([]) // Clear active references after sending
    setIsLoading(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'll help analyze the data from the selected cells. Let me process that for you...",
        timestamp: new Date().toISOString(),
        isEditing: false,
        cellReferences: activeCellReferences.map(range => ({
          range,
          // In a real implementation, you would get the actual cell data here
          data: {}
        }))
      }

      setMessages((prev) => [...prev, aiMessage])
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
        content: "Hello! I'm ready to help with your spreadsheet when you need me. I'll only analyze data you specifically ask about.",
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
    // Only set the prompt if the user is actively interacting with the chat
    setInput(promptText)
    setIsChatFocused(true)
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

  // Remove a cell reference
  const handleRemoveCellReference = (range: string) => {
    setActiveCellReferences(prev => prev.filter(ref => ref !== range));
  }

  return (
    <div className="flex flex-col h-full ai-chat-panel">
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

      {/* Pro Tip - only show when chat is focused */}
      {isChatFocused && (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-xs border-b">
          <span className="font-medium text-blue-600 dark:text-blue-400">Tip:</span> Select multiple cells and press Cmd+K (or Ctrl+K) to instantly reference them in chat.
        </div>
      )}

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
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                    {message.cellReferences?.map((ref, index) => (
                      <React.Fragment key={index}>
                        {" "}
                        <CellReference 
                          range={ref.range} 
                          data={ref.data}
                          className={message.role === "user" ? "bg-primary-foreground/10" : undefined}
                        />
                      </React.Fragment>
                    ))}
                  </div>
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

      {/* Suggested Prompts - only shown when chat is actively being used */}
      {isChatFocused && (
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
      )}

      {/* Input Area */}
      <div>
        {/* Active Cell References */}
        {activeCellReferences.length > 0 && (
          <div className="px-3 pt-3 pb-0 flex flex-wrap gap-2 items-center">
            {activeCellReferences.map((range, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden"
              >
                <div className="px-2 py-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  @
                </div>
                <div className="pr-2 pl-1 py-1 text-sm font-mono">
                  {range}
                </div>
                <button 
                  className="p-1 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  onClick={() => handleRemoveCellReference(range)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="p-3 border-t flex items-center gap-2">
          <Input
            placeholder="Ask anything about your spreadsheet data..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="flex-1 ai-chat-input"
            ref={inputRef}
          />
          <Button
            size="icon"
            disabled={(!input.trim() && activeCellReferences.length === 0) || isLoading}
            onClick={handleSendMessage}
          >
            <Send className={`h-4 w-4 ${isLoading ? "opacity-50" : ""}`} />
          </Button>
        </div>
      </div>
    </div>
  )
} 