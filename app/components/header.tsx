"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { CheckSquare, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useColorMode } from './theme-provider';
import { useSpreadsheet } from '../context/SpreadsheetContext';
import { useUser } from '../context/UserContext';

interface Theme {
  spacing: {
    base: string;
    small: string;
    xs: string;
  };
  colors: {
    primary: string;
    lightGray: string;
    white: string;
    surface: string;
    border: string;
  };
  transitions: {
    fast: string;
    base: string;
  };
  fontSizes: {
    h1: string;
    small: string;
  };
  borderRadius: {
    small: string;
    base: string;
  };
  typography: {
    fontSize: {
      h1: string;
      small: string;
    };
  };
}

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.base};
  background-color: ${({ theme }) => theme.colors.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transitions.base};
  
  &:hover {
    opacity: 0.9;
  }
  
  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize.h1};
    font-weight: 500;
    color: ${({ theme }) => theme.colors.surface};
    margin: 0;
  }
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  font-size: 18px;
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.base};
  align-items: center;
`;

const StyledButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.base}`};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};
  
  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.9);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.base};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const FileInfo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  color: ${({ theme }) => theme.colors.surface};
`;

const UserContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const UserName = styled.span`
  color: ${({ theme }) => theme.colors.surface};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  margin-right: ${({ theme }) => theme.spacing.xs};
`;

interface User {
  firstName?: string;
}

interface SpreadsheetContext {
  handleFileUpload: () => void;
  fileName?: string;
  loading: boolean;
  resetData?: () => void;
}

interface ColorMode {
  colorMode: 'light' | 'dark';
  toggleColorMode: () => void;
}

export default function Header(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { handleFileUpload, fileName, loading, resetData } = useSpreadsheet() as SpreadsheetContext;
  const { user, isSignedIn } = useUser() as { user: User | null; isSignedIn: boolean };
  const { colorMode, toggleColorMode } = useColorMode() as ColorMode;
  
  const handleLogoClick = (): void => {
    if (resetData) {
      resetData();
    } else {
      window.location.reload();
    }
  };
  
  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2" onClick={handleLogoClick}>
          <CheckSquare className="h-6 w-6" />
          <h1 className="text-xl font-bold">Cognisheet</h1>
        </div>

        {fileName && (
          <FileInfo>
            Current file: {fileName}
          </FileInfo>
        )}

        <nav className="hidden md:flex space-x-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <SignedIn>
            <Link href="/notes" className="hover:underline">
              Notes
            </Link>
          </SignedIn>
        </nav>

        <Actions>
          <IconButton onClick={toggleColorMode}>
            {colorMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
          
          <StyledButton 
            onClick={handleFileUpload}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Upload File'}
          </StyledButton>
          
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton>
                <StyledButton>Sign In</StyledButton>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserContainer>
                <UserName>
                  {user?.firstName || 'User'}
                </UserName>
                <UserButton />
              </UserContainer>
            </SignedIn>
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </Actions>
      </div>

      {isMenuOpen && (
        <nav className="md:hidden bg-primary-foreground text-primary p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="block hover:underline"
                onClick={toggleMenu}
              >
                Home
              </Link>
            </li>
            <SignedIn>
              <li>
                <Link
                  href="/notes"
                  className="block hover:underline"
                  onClick={toggleMenu}
                >
                  Notes
                </Link>
              </li>
            </SignedIn>
          </ul>
        </nav>
      )}
    </header>
  );
} 