import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SpreadsheetProvider } from './context/SpreadsheetContext';
import { ChatProvider } from './context/ChatContext';
import { ChatHistoryProvider } from './context/ChatHistoryContext';
import { EnhancedSpreadsheetApp } from './components/EnhancedSpreadsheetApp';
import LandingPage from './components/LandingPage';
import SpreadsheetView from './components/SpreadsheetView';
import ChatPanel from './components/ChatPanel';
import Header from './components/Header';
import NewChatInterface from './components/NewChatInterface';

// Main layout with spreadsheet and chat panel side by side
const MainLayout = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <SpreadsheetView />
        <ChatPanel />
      </div>
    </div>
  );
};

// Enhanced layout with EnhancedSpreadsheetApp
const EnhancedLayout = () => {
  return (
    <div className="app-container">
      <Header />
      <EnhancedSpreadsheetApp />
    </div>
  );
};

// New chat interface layout
const NewChatLayout = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <SpreadsheetView />
        <NewChatInterface />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <SpreadsheetProvider>
      <ChatProvider>
        <ChatHistoryProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<MainLayout />} />
            <Route path="/enhanced" element={<EnhancedLayout />} />
            <Route path="/new-chat" element={<NewChatLayout />} />
          </Routes>
        </ChatHistoryProvider>
      </ChatProvider>
    </SpreadsheetProvider>
  );
};

export default App; 