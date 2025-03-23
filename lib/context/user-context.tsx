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
  const [isLoading, setIsLoading] = useState(false)
  // Permanently set all users to "pro" regardless of subscription status
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("pro")
  const [fileCount, setFileCount] = useState(0)

  useEffect(() => {
    // No need to fetch subscription status, everyone is "pro"
    setSubscriptionTier("pro")
    setFileCount(0)
    setIsLoading(false)
  }, [isLoaded, isSignedIn, user])

  // Always allow creating new files 
  const canCreateNewFile = true

  // Function to increment file count when user creates a new file
  // This won't actually restrict anything
  const incrementFileCount = () => {
    console.log('File count incremented (unrestricted)')
    // We don't actually increment the count since we don't want to limit files
  }

  return (
    <UserContext.Provider 
      value={{
        isLoading: false, // Always false to avoid loading state
        isAuthenticated: true, // Always authenticated
        subscriptionTier: "pro", // Always pro
        fileCount: 0, // Always 0 to avoid limits
        canCreateNewFile: true, // Always allowed
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