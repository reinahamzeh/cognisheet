import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../context/UserContext';
import { getUserSpreadsheets, deleteSpreadsheet } from '../services/supabase';

const Container = styled.div`
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  color: ${({ theme }) => theme.colors.darkGrey};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.grey};
  font-size: 0.875rem;
`;

const SpreadsheetList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const SpreadsheetCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.lightGrey};
  border-radius: 6px;
  padding: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SpreadsheetName = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.5rem;
  color: ${({ theme }) => theme.colors.darkGrey};
`;

const SpreadsheetDate = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.grey};
  margin: 0 0 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const DeleteButton = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid ${({ theme }) => theme.colors.error};
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.errorLight};
  }
`;

const SavedSpreadsheets = ({ onLoadSpreadsheet }) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpreadsheets = async () => {
      if (isSignedIn && user) {
        try {
          const data = await getUserSpreadsheets(user.id);
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
  }, [user, isSignedIn, isLoaded]);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this spreadsheet?')) {
      try {
        const success = await deleteSpreadsheet(id);
        if (success) {
          setSpreadsheets(spreadsheets.filter(sheet => sheet.id !== id));
        }
      } catch (error) {
        console.error('Error deleting spreadsheet:', error);
      }
    }
  };

  const handleLoad = (spreadsheet) => {
    if (onLoadSpreadsheet) {
      onLoadSpreadsheet(spreadsheet);
    }
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
      
      {spreadsheets.length === 0 ? (
        <EmptyState>
          You don't have any saved spreadsheets yet. Upload a file and save it to see it here.
        </EmptyState>
      ) : (
        <SpreadsheetList>
          {spreadsheets.map((spreadsheet) => (
            <SpreadsheetCard key={spreadsheet.id}>
              <SpreadsheetName>{spreadsheet.name}</SpreadsheetName>
              <SpreadsheetDate>
                {new Date(spreadsheet.created_at).toLocaleDateString()}
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

export default SavedSpreadsheets; 