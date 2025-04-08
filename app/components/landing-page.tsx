"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { useSpreadsheet } from '../context/SpreadsheetContext';
import { useUser } from '../context/UserContext';
import { Auth } from './auth';
import { SavedSpreadsheets } from './saved-spreadsheets';
import { getSpreadsheetById } from '../services/supabase';

interface Spreadsheet {
  id: string;
  name?: string;
  data?: any;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 80vh;
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.h1};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.large};
  color: ${({ theme }) => theme.colors.text};
  max-width: 600px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  opacity: 0.8;
`;

const UploadButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.base} ${theme.spacing.lg}`};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.base};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
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
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 900px;
`;

const FeatureCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.small};
  width: 250px;
  
  h3 {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
  
  p {
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.7;
    font-size: ${({ theme }) => theme.typography.fontSize.small};
  }
`;

const AIFeature = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary}10;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  max-width: 600px;
  
  h2 {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
  
  p {
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const UserSection = styled.div`
  width: 100%;
  max-width: 900px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.h2};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: left;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

interface TabProps {
  active: boolean;
}

const Tab = styled.button<TabProps>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.surface : theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: ${({ active }) => active ? 'none' : '1px solid'};
  border-radius: ${({ theme }) => `${theme.borderRadius.small} ${theme.borderRadius.small} 0 0`};
  cursor: pointer;
  margin-right: ${({ theme }) => theme.spacing.sm};
  
  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  }
`;

const LandingPage: React.FC = () => {
  const { handleFileUpload, loading, setData } = useSpreadsheet() || {};
  const userContext = useUser() || {};
  const isSignedIn = userContext?.isSignedIn ?? false;
  const isLoaded = userContext?.isLoaded ?? true;
  const [activeTab, setActiveTab] = useState<'upload' | 'saved'>('upload');
  
  const handleLoadSpreadsheet = async (spreadsheet: Spreadsheet) => {
    if (!spreadsheet?.id) return;
    
    try {
      const fullSpreadsheet = await getSpreadsheetById(spreadsheet.id);
      
      if (fullSpreadsheet?.data && setData) {
        setData(fullSpreadsheet.data, spreadsheet.name || 'Untitled');
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