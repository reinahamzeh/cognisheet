import React, { useState } from 'react';
import styled from 'styled-components';
import { useSpreadsheet } from '../context/SpreadsheetContext';
import { useUser } from '../context/UserContext';
import Auth from './auth';
import SavedSpreadsheets from './SavedSpreadsheets';
import { getSpreadsheetById } from '../services/supabase';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 80vh;
  padding: ${({ theme }) => theme.spacing.large};
  text-align: center;
  background-color: ${({ theme }) => theme.colors.white};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
  max-width: 600px;
  margin-bottom: ${({ theme }) => theme.spacing.large};
  opacity: 0.8;
`;

const UploadButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.base} ${theme.spacing.large}`};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: ${({ theme }) => theme.spacing.large};
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.accent};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Features = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.large};
  max-width: 900px;
`;

const FeatureCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.large};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  box-shadow: ${({ theme }) => theme.shadows.small};
  width: 250px;
  
  h3 {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.small};
  }
  
  p {
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.7;
    font-size: 0.9rem;
  }
`;

const AIFeature = styled.div`
  margin-top: ${({ theme }) => theme.spacing.large};
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.primary}10;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  max-width: 600px;
  
  h2 {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.small};
  }
  
  p {
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.small};
  }
`;

const UserSection = styled.div`
  width: 100%;
  max-width: 900px;
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.darkGrey};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  text-align: left;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Tab = styled.button`
  padding: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.medium};
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.white : theme.colors.darkGrey};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  border-bottom: ${({ active }) => active ? 'none' : '1px solid'};
  border-radius: ${({ theme }) => `${theme.borderRadius.small} ${theme.borderRadius.small} 0 0`};
  cursor: pointer;
  margin-right: ${({ theme }) => theme.spacing.small};
  
  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.lightGray};
  }
`;

const LandingPage = () => {
  const { handleFileUpload, loading, setData } = useSpreadsheet();
  const userContext = useUser();
  const isSignedIn = userContext?.isSignedIn ?? false;
  const isLoaded = userContext?.isLoaded ?? true;
  const [activeTab, setActiveTab] = useState('upload');
  
  const handleLoadSpreadsheet = async (spreadsheet) => {
    try {
      // Get the full spreadsheet data
      const fullSpreadsheet = await getSpreadsheetById(spreadsheet.id);
      
      if (fullSpreadsheet && fullSpreadsheet.data) {
        // Set the data in the spreadsheet context
        setData(fullSpreadsheet.data, spreadsheet.name);
      }
    } catch (error) {
      console.error('Error loading spreadsheet:', error);
    }
  };
  
  return (
    <Container>
      <Title>Welcome to Cognisheet</Title>
      <Subtitle>
        A user-friendly spreadsheet tool with an AI chat interface for natural language queries.
        Upload your CSV, Excel, or Numbers file and start asking questions in plain English.
      </Subtitle>
      
      <UploadButton onClick={handleFileUpload} disabled={loading}>
        {loading ? 'Loading...' : 'Upload Spreadsheet'}
      </UploadButton>
      
      {userContext && (
        <>
          {isLoaded && isSignedIn ? (
            <UserSection>
              <Tabs>
                <Tab 
                  active={activeTab === 'upload'} 
                  onClick={() => setActiveTab('upload')}
                >
                  Upload New
                </Tab>
                <Tab 
                  active={activeTab === 'saved'} 
                  onClick={() => setActiveTab('saved')}
                >
                  Saved Spreadsheets
                </Tab>
              </Tabs>
              
              {activeTab === 'upload' ? (
                <UploadButton onClick={handleFileUpload} disabled={loading}>
                  {loading ? 'Loading...' : 'Upload Spreadsheet'}
                </UploadButton>
              ) : (
                <SavedSpreadsheets onLoadSpreadsheet={handleLoadSpreadsheet} />
              )}
            </UserSection>
          ) : (
            isLoaded && !isSignedIn && (
              <UserSection>
                <SectionTitle>Sign in to save your spreadsheets</SectionTitle>
                <Auth />
              </UserSection>
            )
          )}
        </>
      )}
      
      <Features>
        <FeatureCard>
          <h3>AI-Powered Analysis</h3>
          <p>Get intelligent insights from your data using our advanced AI assistant.</p>
        </FeatureCard>
        
        <FeatureCard>
          <h3>Instant Visualizations</h3>
          <p>Create charts and graphs with simple commands like "create a bar chart".</p>
        </FeatureCard>
        
        <FeatureCard>
          <h3>Easy Data Selection</h3>
          <p>Select data ranges with your mouse or use Cmd+K to select all data.</p>
        </FeatureCard>
      </Features>
      
      <AIFeature>
        <h2>Powered by OpenAI</h2>
        <p>Our AI assistant uses OpenAI's powerful language models to analyze your data and provide meaningful insights.</p>
      </AIFeature>
    </Container>
  );
};

export default LandingPage; 