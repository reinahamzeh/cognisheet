"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useUser as useClerkUser } from "@clerk/nextjs"

type SubscriptionTier = "free" | "pro"

interface UserContextType {
  isLoading: boolean
  isAuthenticated: boolean
  subscriptionTier: SubscriptionTier
  fileCount: number
  canCreateNewFile: boolean
  incrementFileCount: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useClerkUser()
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("free")
  const [fileCount, setFileCount] = useState(0)

  useEffect(() => {
    // Only load subscription data when the user is signed in
    if (!isLoaded) return
    
    if (isSignedIn && user) {
      // Check user's subscription status
      // In a real app, you'd fetch this from your API/database
      const checkSubscription = async () => {
        try {
          // Mock API call - replace with real API call to your backend
          // const response = await fetch('/api/user/subscription')
          // const data = await response.json()
          // setSubscriptionTier(data.subscriptionTier)
          // setFileCount(data.fileCount)
          
          // For now, we'll just use free tier as default
          setSubscriptionTier("free")
          setFileCount(0)
        } catch (error) {
          console.error("Failed to fetch subscription data:", error)
        } finally {
          setIsLoading(false)
        }
      }
      
      checkSubscription()
    } else {
      // If not signed in, reset to defaults
      setSubscriptionTier("free")
      setFileCount(0)
      setIsLoading(false)
    }
  }, [isLoaded, isSignedIn, user])

  // Determine if user can create a new file based on subscription and usage
  const canCreateNewFile = subscriptionTier === "pro" || fileCount < 1

  // Function to increment file count when user creates a new file
  const incrementFileCount = () => {
    setFileCount(prevCount => prevCount + 1)
    // In a real app, you'd also update this on your backend
    // await fetch('/api/user/incrementFileCount', { method: 'POST' })
  }

  return (
    <UserContext.Provider 
      value={{
        isLoading,
        isAuthenticated: !!isSignedIn,
        subscriptionTier,
        fileCount,
        canCreateNewFile,
        incrementFileCount
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
} 