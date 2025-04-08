'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { Routes, Route } from 'react-router-dom';
import FileLimitModal from '../components/file-limit-modal';
import PricingModal from '../components/pricing-modal';
import { useUser } from '../lib/context/user-context';
import { SpreadsheetProvider, useSpreadsheet } from './context/spreadsheet-context';
import { ChatProvider, useChat } from './context/ChatContext';
import { ChatHistoryProvider } from './context/ChatHistoryContext';

// Dynamic imports - ensure consistent casing for Header
const LandingPage = dynamic(() => import('./components/LandingPage'), { ssr: false });
const SpreadsheetView = dynamic(() => import('./components/SpreadsheetView'), { ssr: false });
const ChatPanel = dynamic(() => import('./components/ChatPanel'), { ssr: false });
const Header = dynamic(() => import('./components/Header'), { ssr: false });
const NewChatInterface = dynamic(() => import('./components/NewChatInterface'), { ssr: false });
const EnhancedSpreadsheetApp = dynamic(() => import('./components/EnhancedSpreadsheetApp') as any, { ssr: false });

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`;

// Main layout with spreadsheet and chat panel side by side
const MainLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <SpreadsheetView 
          title="Spreadsheet"
          enableWebSearch={true}
          enableCharts={true}
          enableMultiCellSelection={true}
          enableDataEnrichment={true}
        />
        <ChatPanel />
      </div>
    </div>
  );
};

// Enhanced layout with EnhancedSpreadsheetApp
const EnhancedLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <EnhancedSpreadsheetApp />
    </div>
  );
};

// New chat interface layout
const NewChatLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <SpreadsheetView 
          title="Spreadsheet"
          enableWebSearch={true}
          enableCharts={true}
          enableMultiCellSelection={true}
          enableDataEnrichment={true}
        />
        <NewChatInterface />
      </div>
    </div>
  );
};

// Define props for AppContent
interface AppContentProps {
  onUploadFile: (file: File) => Promise<boolean>;
  onNewFile: () => void;
  onWatchDemo: () => void;
}

// Wrapper component to access context for the keyboard listener
const AppContent: React.FC<AppContentProps> = ({ 
  onUploadFile,
  onNewFile,
  onWatchDemo 
}) => {
  const { selectedRange } = useSpreadsheet();
  const { setInputValue } = useChat();
  const { data: spreadsheetDataContext } = useSpreadsheet();
  const [view, setView] = useState<'landing' | 'spreadsheet'>('landing');

  useEffect(() => {
    if (spreadsheetDataContext && spreadsheetDataContext.length > 0) {
      setView('spreadsheet');
    }
  }, [spreadsheetDataContext]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isCmdK = (isMac && event.metaKey && event.key === 'k') || (!isMac && event.ctrlKey && event.key === 'k');

    if (isCmdK && selectedRange) {
      event.preventDefault();
      setInputValue(`${selectedRange} `);
    }
  }, [selectedRange, setInputValue]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (view === 'landing') {
    return (
      <LandingPage 
        onUploadFile={onUploadFile}
        onNewFile={onNewFile}
        onWatchDemo={onWatchDemo}
      />
    );
  } 
  
  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/app" element={<MainLayout />} />
      <Route path="/enhanced" element={<EnhancedLayout />} />
      <Route path="/new-chat" element={<NewChatLayout />} />
    </Routes>
  );
}

const App: React.FC = () => {
  const [showFileLimitModal, setShowFileLimitModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const { incrementFileCount } = useUser();
  const { handleFileUpload: contextHandleFileUpload } = useSpreadsheet();

  const handleNewFile = useCallback(() => {
    console.log('Creating new file via context (placeholder)');
    incrementFileCount();
  }, [incrementFileCount]);

  const handleWatchDemo = useCallback(() => {
    console.log('Opening demo video');
    alert('Demo video would play here');
  }, []);

  return (
    <SpreadsheetProvider>
      <ChatProvider>
        <ChatHistoryProvider>
          <AppContainer>
            <AppContent 
              onUploadFile={contextHandleFileUpload}
              onNewFile={handleNewFile}
              onWatchDemo={handleWatchDemo}
            /> 

            {/* Modals remain disabled */}
            {false && (
              <>
                <FileLimitModal 
                  isOpen={false}
                  onClose={() => {}}
                  onUpgrade={() => {}}
                />
                <PricingModal 
                  isOpen={false}
                  onClose={() => {}}
                />
              </>
            )}
          </AppContainer>
        </ChatHistoryProvider>
      </ChatProvider>
    </SpreadsheetProvider>
  );
};

export default App; 