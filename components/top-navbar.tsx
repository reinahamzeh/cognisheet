"use client"

import React, { useState, useRef } from "react"
import { useTheme } from "next-themes"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Separator } from "./ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { ActivityIcon as Function, BarChart3, Upload, Sun, Moon, Download, Grid, Home, Sparkles } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import Link from "next/link"

interface FormatFunctions {
  toggleBold: () => void
  toggleItalic: () => void
  setTextAlign: (alignment: 'left' | 'center' | 'right') => void
  toggleWrapText: () => void
}

interface TopNavbarProps {
  fileName: string
  setFileName: (name: string) => void
  onFileUpload: (file: File) => void
  onExport?: () => void
  formatFunctions?: FormatFunctions | null
}

export default function TopNavbar({ 
  fileName, 
  setFileName, 
  onFileUpload, 
  onExport,
  formatFunctions 
}: TopNavbarProps) {
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
      {/* Left section - Cognisheet branding and file name */}
      <div className="flex items-center space-x-2">
        <Link href="/" className="flex items-center mr-4 hover:opacity-80 transition-opacity">
          <Grid className="h-5 w-5 text-primary mr-1" />
          <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Cognisheet
          </div>
        </Link>
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

      {/* Middle section - Simplified tools with labels */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" title="Insert Formula" className="flex items-center">
          <Function className="h-4 w-4 mr-1" />
          <span>Formula</span>
        </Button>
        <Button variant="ghost" size="sm" title="Insert Chart" className="flex items-center">
          <BarChart3 className="h-4 w-4 mr-1" />
          <span>Charts</span>
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
        {onExport && (
          <Button variant="ghost" size="sm" onClick={onExport} className="flex items-center">
            <Download className="h-4 w-4 mr-1" />
            <span>Export</span>
          </Button>
        )}
      </div>

      {/* Right section - Pro Features, Theme toggle and user */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="flex items-center">
          <Sparkles className="h-4 w-4 mr-1 text-amber-500" />
          <span>Pro Features</span>
        </Button>
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