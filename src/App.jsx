import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import SpreadsheetView from './components/SpreadsheetView';
import ChatPanel from './components/ChatPanel';
import LandingPage from './components/LandingPage';
import { SpreadsheetProvider } from './context/SpreadsheetContext';
import { ChatProvider } from './context/ChatContext';
import Onboarding from './components/Onboarding';
import { io } from 'socket.io-client';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Roboto', sans-serif;
`;

const MainContent = styled.main`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const SpreadsheetContainer = styled.div`
  flex: 1;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing.base};
`;

function App() {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [serverConnected, setServerConnected] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Check server connectivity
  useEffect(() => {
    const socket = io('http://localhost:4000', {
      timeout: 5000,
      reconnectionAttempts: 3
    });

    socket.on('connect', () => {
      console.log('Connected to server');
      setServerConnected(true);
    });

    socket.on('connect_error', () => {
      console.log('Failed to connect to server');
      setServerConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Check if user has used the app before
    const hasUsedBefore = localStorage.getItem('hasUsedCognisheet');
    if (hasUsedBefore) {
      setIsFirstTime(false);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('hasUsedCognisheet', 'true');
    setShowOnboarding(false);
  };

  // This function will be called when data is loaded
  const handleDataLoaded = () => {
    setDataLoaded(true);
  };

  return (
    <SpreadsheetProvider onDataLoaded={handleDataLoaded}>
      <ChatProvider>
        <AppContainer>
          <Header />
          
          {showOnboarding ? (
            <Onboarding 
              isFirstTime={isFirstTime} 
              onComplete={completeOnboarding} 
              onSkip={completeOnboarding} 
            />
          ) : !dataLoaded ? (
            <LandingPage serverConnected={serverConnected} />
          ) : (
            <MainContent>
              <SpreadsheetContainer>
                <SpreadsheetView />
              </SpreadsheetContainer>
              <ChatPanel />
            </MainContent>
          )}
        </AppContainer>
      </ChatProvider>
    </SpreadsheetProvider>
  );
}

export default App; 