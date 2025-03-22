"use client";

import React, { createContext, useContext, useState } from "react";

interface UserContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: any | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  const signIn = async () => {
    try {
      // Sign in logic here
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSignedIn(true);
      setUser({ id: "1", name: "Test User" });
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const signOut = async () => {
    try {
      // Sign out logic here
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSignedIn(false);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        isSignedIn,
        isLoaded,
        user,
        signIn,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
} 