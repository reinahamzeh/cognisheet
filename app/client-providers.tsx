"use client"

import { ClerkProvider } from "@clerk/nextjs";
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from "../components/theme-provider";
import { UserProvider } from "../lib/context/user-context";
import React from 'react';

export default function ClientProviders({ 
  children 
}: { 
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <UserProvider>
        <RecoilRoot>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem 
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </RecoilRoot>
      </UserProvider>
    </ClerkProvider>
  );
} 