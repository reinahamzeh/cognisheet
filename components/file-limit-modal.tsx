"use client"

import React from "react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { UploadCloud, AlertCircle } from "lucide-react"

interface FileLimitModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
}

export default function FileLimitModal({ isOpen, onClose, onUpgrade }: FileLimitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            File Limit Reached
          </DialogTitle>
          <DialogDescription>
            You've reached the free limit of 1 file. Upgrade to Pro to create unlimited spreadsheets.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <UploadCloud className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-center text-amber-800">
              Your free account allows you to create 1 spreadsheet file. To create more files, 
              please upgrade to our Pro plan for unlimited spreadsheets and advanced features.
            </p>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:w-auto w-full">
            Maybe Later
          </Button>
          <Button onClick={onUpgrade} className="sm:w-auto w-full">
            Upgrade to Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 