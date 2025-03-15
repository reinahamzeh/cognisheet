import React from 'react';
import styled from 'styled-components';
import { useSpreadsheet } from '../context/SpreadsheetContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: ${({ theme }) => theme.spacing.large};
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.darkGray};
  max-width: 600px;
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const UploadButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.base} ${theme.spacing.large}`};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: ${({ theme }) => theme.spacing.large};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}dd;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
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
  background-color: white;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.large};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  width: 250px;
  
  h3 {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.small};
  }
  
  p {
    color: ${({ theme }) => theme.colors.darkGray};
    font-size: 0.9rem;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.large};
  padding: ${({ theme }) => theme.spacing.small};
  background-color: ${({ theme, connected }) => connected ? theme.colors.success + '20' : theme.colors.error + '20'};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  
  span {
    margin-left: ${({ theme }) => theme.spacing.small};
    color: ${({ theme, connected }) => connected ? theme.colors.success : theme.colors.error};
    font-weight: 500;
  }
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ theme, connected }) => connected ? theme.colors.success : theme.colors.error};
`;

const LandingPage = ({ serverConnected = false }) => {
  const { handleFileUpload, loading } = useSpreadsheet();
  
  return (
    <Container>
      <Title>Welcome to Cognisheet</Title>
      <Subtitle>
        A user-friendly spreadsheet tool with a chat interface for natural language queries.
        Upload your data and start asking questions in plain English.
      </Subtitle>
      
      <UploadButton onClick={handleFileUpload} disabled={loading}>
        {loading ? 'Loading...' : 'Upload Spreadsheet'}
      </UploadButton>
      
      <Features>
        <FeatureCard>
          <h3>Natural Language Queries</h3>
          <p>Ask questions about your data in plain English, no formulas needed.</p>
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
      
      <StatusIndicator connected={serverConnected}>
        <Dot connected={serverConnected} />
        <span>{serverConnected ? 'Server Connected' : 'Server Disconnected'}</span>
      </StatusIndicator>
    </Container>
  );
};

export default LandingPage; 