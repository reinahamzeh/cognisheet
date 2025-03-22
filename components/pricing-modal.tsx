"use client"
import * as React from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Check } from "lucide-react"

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  
  const handleMonthlySubscription = async () => {
    window.location.href = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY || "https://buy.stripe.com/test_9AQ03F66K3BzdRSbII"
  }

  const handleYearlySubscription = async () => {
    window.location.href = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY || "https://buy.stripe.com/test_7sI5nZ8eS4FD4hi8wx"
  }

  const handleSignInThenSubscribe = () => {
    // Close modal and redirect to sign-in
    onClose()
    // Use Clerk's sign-in
    openSignIn()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>
            {isSignedIn 
              ? "Unlock unlimited spreadsheets and more powerful features with our Pro plan." 
              : "Sign in to upgrade to Pro and unlock unlimited spreadsheets and powerful features."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <span className="bg-primary/10 p-1 rounded-full mr-2">
                <Check className="h-4 w-4 text-primary" />
              </span>
              Pro Plan
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <Check className="h-3 w-3 text-primary mr-2" />
                Unlimited spreadsheet files
              </li>
              <li className="flex items-center">
                <Check className="h-3 w-3 text-primary mr-2" />
                Advanced AI features
              </li>
              <li className="flex items-center">
                <Check className="h-3 w-3 text-primary mr-2" />
                Custom chart styles
              </li>
              <li className="flex items-center">
                <Check className="h-3 w-3 text-primary mr-2" />
                Import/export all formats
              </li>
              <li className="flex items-center">
                <Check className="h-3 w-3 text-primary mr-2" />
                Priority support
              </li>
            </ul>
            
            {isSignedIn && (
              <div className="mt-4 space-y-3">
                <Button onClick={handleMonthlySubscription} className="w-full justify-between">
                  Monthly Plan <span className="font-bold">$12/month</span>
                </Button>
                <Button onClick={handleYearlySubscription} className="w-full justify-between">
                  Yearly Plan <span className="font-bold">$120/year <span className="text-xs text-green-400">Save 17%</span></span>
                </Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:w-auto w-full">
            Maybe Later
          </Button>
          {!isSignedIn && (
            <Button onClick={handleSignInThenSubscribe} className="sm:w-auto w-full">
              Sign In to Upgrade
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 