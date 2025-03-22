import React, { useState } from 'react';
import styled from 'styled-components';
import { useSpreadsheet } from '../context/SpreadsheetContext';

const OnboardingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.large};
  background-color: ${({ theme }) => theme.colors.background};
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.h1};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.body};
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.8;
  max-width: 600px;
  margin-bottom: ${({ theme }) => theme.spacing.large};
  line-height: 1.6;
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.large};
  margin-bottom: ${({ theme }) => theme.spacing.large};
  width: 100%;
  max-width: 600px;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.base};
  text-align: left;
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.h2};
    margin-bottom: ${({ theme }) => theme.spacing.small};
    color: ${({ theme }) => theme.colors.primary};
  }
  
  p {
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.7;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.base};
`;

const Button = styled.button`
  padding: ${({ theme }) => `${theme.spacing.small} ${theme.spacing.medium}`};
  background-color: ${({ theme, primary }) => primary ? theme.colors.primary : 'transparent'};
  color: ${({ theme, primary }) => primary ? theme.colors.white : theme.colors.text};
  border: 1px solid ${({ theme, primary }) => primary ? 'transparent' : theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, primary }) => primary ? theme.colors.accent : theme.colors.lightGray};
  }
`;

const Onboarding = ({ isFirstTime, onComplete, onSkip }) => {
  const { handleFileUpload } = useSpreadsheet();
  
  const handleUploadClick = async () => {
    await handleFileUpload();
    onComplete();
  };
  
  return (
    <OnboardingContainer>
      <Title>Welcome to Cognisheet</Title>
      <Description>
        Cognisheet is a simple spreadsheet tool that lets you interact with your data using natural language.
        Upload a spreadsheet file, select data, and ask questions in the chat to get insights and visualizations.
      </Description>
      
      <StepsContainer>
        <Step>
          <StepNumber>1</StepNumber>
          <StepContent>
            <h3>Upload a Spreadsheet</h3>
            <p>Start by uploading a CSV, Excel, or Numbers file with your data.</p>
          </StepContent>
        </Step>
        
        <Step>
          <StepNumber>2</StepNumber>
          <StepContent>
            <h3>Select Data</h3>
            <p>Click and drag to select cells, or use Cmd+K to select all data.</p>
          </StepContent>
        </Step>
        
        <Step>
          <StepNumber>3</StepNumber>
          <StepContent>
            <h3>Ask Questions</h3>
            <p>Use the chat panel to ask questions like "What's the average?" or "Create a bar chart".</p>
          </StepContent>
        </Step>
      </StepsContainer>
      
      <ButtonContainer>
        <Button onClick={onSkip}>Skip Tutorial</Button>
        <Button primary onClick={handleUploadClick}>Upload a File</Button>
      </ButtonContainer>
    </OnboardingContainer>
  );
};

export default Onboarding; 