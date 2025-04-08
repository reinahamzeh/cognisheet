"use client"

import { ClerkProvider } from "@clerk/nextjs";
import { RecoilRoot } from 'recoil';
import { ThemeProvider as NextThemeProvider } from "./components/theme-provider";
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { UserProvider } from "../lib/context/user-context";
import { lightTheme, darkTheme } from './styles/theme';
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

function StyledThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  useEffect(() => {
    setCurrentTheme(resolvedTheme === 'dark' ? darkTheme : lightTheme);
  }, [resolvedTheme]);

  return (
    <StyledThemeProvider theme={currentTheme}>
      {children}
    </StyledThemeProvider>
  );
}

export default function ClientProviders({ 
  children 
}: { 
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <UserProvider>
        <RecoilRoot>
          <NextThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem 
            disableTransitionOnChange
          >
            <StyledThemeWrapper>
              {children}
            </StyledThemeWrapper>
          </NextThemeProvider>
        </RecoilRoot>
      </UserProvider>
    </ClerkProvider>
  );
} 