import React from 'react';
import styled from 'styled-components';
import { useSpreadsheet } from '../context/SpreadsheetContext';
import { useUser } from '../context/UserContext';
import { UserButton, SignInButton } from '@clerk/clerk-react';
import { Sun, Moon } from 'lucide-react';
import { useColorMode } from './theme-provider';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.base};
  background-color: ${({ theme }) => theme.colors.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    opacity: 0.9;
  }
  
  h1 {
    font-size: ${({ theme }) => theme.fontSizes.h1};
    font-weight: 500;
    color: ${({ theme }) => theme.colors.white};
    margin: 0;
  }
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.small};
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

const Button = styled.button`
  padding: ${({ theme }) => `${theme.spacing.small} ${theme.spacing.base}`};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
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
  color: ${({ theme }) => theme.colors.white};
  border: none;
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const FileInfo = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.white};
`;

const UserContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
`;

const UserName = styled.span`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin-right: ${({ theme }) => theme.spacing.small};
`;

const Header = () => {
  const { handleFileUpload, fileName, loading, resetData } = useSpreadsheet();
  const { user, isSignedIn } = useUser();
  const { colorMode, toggleColorMode } = useColorMode();
  
  const handleLogoClick = () => {
    // Reset the data to go back to landing page
    if (resetData) {
      resetData();
    } else {
      // If resetData is not available, we can try to reload the page
      window.location.reload();
    }
  };
  
  return (
    <HeaderContainer>
      <Logo onClick={handleLogoClick}>
        <LogoIcon>C</LogoIcon>
        <h1>Cognisheet</h1>
      </Logo>
      
      {fileName && (
        <FileInfo>
          Current file: {fileName}
        </FileInfo>
      )}
      
      <Actions>
        <IconButton onClick={toggleColorMode}>
          {colorMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>
        
        <Button 
          onClick={handleFileUpload}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Upload File'}
        </Button>
        
        {isSignedIn ? (
          <UserContainer>
            <UserName>
              {user?.firstName || 'User'}
            </UserName>
            <UserButton />
          </UserContainer>
        ) : (
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        )}
      </Actions>
    </HeaderContainer>
  );
};

export default Header; 