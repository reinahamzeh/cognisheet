import React from 'react';
import styled from 'styled-components';
import { useSpreadsheet } from '../context/SpreadsheetContext';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.base};
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
  
  h1 {
    font-size: ${({ theme }) => theme.fontSizes.h1};
    font-weight: 500;
    color: ${({ theme }) => theme.colors.primary};
    margin: 0;
  }
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.base};
`;

const Button = styled.button`
  padding: ${({ theme }) => `${theme.spacing.small} ${theme.spacing.base}`};
  background-color: ${({ theme, primary }) => primary ? theme.colors.primary : 'transparent'};
  color: ${({ theme, primary }) => primary ? theme.colors.white : theme.colors.text};
  border: 1px solid ${({ theme, primary }) => primary ? theme.colors.primary : theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, primary }) => primary ? theme.colors.primary : theme.colors.lightGray};
    opacity: 0.9;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
`;

const FileInfo = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.darkGray};
`;

const Header = () => {
  const { handleFileUpload, fileName, loading } = useSpreadsheet();
  
  return (
    <HeaderContainer>
      <Logo>
        <LogoIcon>C</LogoIcon>
        <h1>Cognisheet</h1>
      </Logo>
      
      {fileName && (
        <FileInfo>
          Current file: {fileName}
        </FileInfo>
      )}
      
      <Actions>
        <Button 
          primary 
          onClick={handleFileUpload}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Upload File'}
        </Button>
      </Actions>
    </HeaderContainer>
  );
};

export default Header; 