"use client"

import React, { useState, useRef } from "react"
import { useTheme } from "next-themes"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Separator } from "./ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Bold, Italic, AlignLeft, ActivityIcon as Function, BarChart3, Upload, Sun, Moon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

interface TopNavbarProps {
  fileName: string
  setFileName: (name: string) => void
  onFileUpload: (file: File) => void
}

export default function TopNavbar({ fileName, setFileName, onFileUpload }: TopNavbarProps) {
  const { theme, setTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0])
    }
  }

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileNameClick = () => {
    setIsEditing(true)
  }

  const handleFileNameBlur = () => {
    setIsEditing(false)
  }

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value)
  }

  const handleFileNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-2 border-b bg-background">
      {/* Left section - File name and basic actions */}
      <div className="flex items-center space-x-2">
        <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mr-2">
          CogniSheet
        </div>
        <Separator orientation="vertical" className="h-6" />
        {isEditing ? (
          <Input
            value={fileName}
            onChange={handleFileNameChange}
            onBlur={handleFileNameBlur}
            onKeyDown={handleFileNameKeyDown}
            className="h-8 w-48 text-sm font-medium"
            autoFocus
          />
        ) : (
          <button onClick={handleFileNameClick} className="text-sm font-medium hover:bg-muted px-2 py-1 rounded">
            {fileName}
          </button>
        )}
      </div>

      {/* Middle section - Formatting tools */}
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="Align">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button variant="ghost" size="icon" title="Insert Formula">
          <Function className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="Insert Chart">
          <BarChart3 className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button variant="ghost" size="sm" onClick={triggerFileUpload} className="flex items-center">
          <Upload className="h-4 w-4 mr-1" />
          <span>Upload</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
            accept=".xlsx,.xls,.numbers,.csv"
          />
        </Button>
      </div>

      {/* Right section - Theme toggle and user */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 