"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../context/UserContext';
import { getUserSpreadsheets, deleteSpreadsheet } from '../services/supabase';

interface Spreadsheet {
  id: string;
  name?: string;
  created_at?: string;
  data?: any;
}

interface SavedSpreadsheetsProps {
  onLoadSpreadsheet: (spreadsheet: Spreadsheet) => void;
}

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.h2};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const SpreadsheetList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.base};
`;

const SpreadsheetCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: ${({ theme }) => theme.spacing.base};
  transition: ${({ theme }) => theme.transitions.base};
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.small};
  }
`;

const SpreadsheetName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const SpreadsheetDate = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  color: ${({ theme }) => theme.colors.muted};
  margin: 0 0 ${({ theme }) => theme.spacing.base};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const Button = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.base}`};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.base};
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.accent};
  }
`;

const DeleteButton = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid ${({ theme }) => theme.colors.error};
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.error}10;
  }
`;

export const SavedSpreadsheets: React.FC<SavedSpreadsheetsProps> = ({ onLoadSpreadsheet }) => {
  const { user, isSignedIn, isLoaded } = useUser() || {};
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpreadsheets = async () => {
      if (isSignedIn && user?.id) {
        try {
          const data = await getUserSpreadsheets(user.id) || [];
          setSpreadsheets(data);
        } catch (error) {
          console.error('Error fetching spreadsheets:', error);
        } finally {
          setLoading(false);
        }
      } else if (isLoaded && !isSignedIn) {
        setSpreadsheets([]);
        setLoading(false);
      }
    };

    fetchSpreadsheets();
  }, [user?.id, isSignedIn, isLoaded]);

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this spreadsheet?')) {
      try {
        const success = await deleteSpreadsheet(id);
        if (success) {
          setSpreadsheets(spreadsheets.filter(sheet => sheet?.id !== id));
        }
      } catch (error) {
        console.error('Error deleting spreadsheet:', error);
      }
    }
  };

  const handleLoad = (spreadsheet: Spreadsheet) => {
    if (!spreadsheet) return;
    onLoadSpreadsheet(spreadsheet);
  };

  if (!isLoaded || loading) {
    return <div>Loading saved spreadsheets...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in to view your saved spreadsheets</div>;
  }

  return (
    <Container>
      <Title>Your Saved Spreadsheets</Title>
      
      {!spreadsheets?.length ? (
        <EmptyState>
          You don't have any saved spreadsheets yet. Upload a file and save it to see it here.
        </EmptyState>
      ) : (
        <SpreadsheetList>
          {spreadsheets.map((spreadsheet) => spreadsheet && (
            <SpreadsheetCard key={spreadsheet.id}>
              <SpreadsheetName>{spreadsheet.name || 'Untitled'}</SpreadsheetName>
              <SpreadsheetDate>
                {new Date(spreadsheet.created_at || Date.now()).toLocaleDateString()}
              </SpreadsheetDate>
              <ButtonContainer>
                <LoadButton onClick={() => handleLoad(spreadsheet)}>
                  Load
                </LoadButton>
                <DeleteButton onClick={() => handleDelete(spreadsheet.id)}>
                  Delete
                </DeleteButton>
              </ButtonContainer>
            </SpreadsheetCard>
          ))}
        </SpreadsheetList>
      )}
    </Container>
  );
}; 