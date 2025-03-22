import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './styles/GlobalStyle';
import { lightTheme } from './styles/theme';
import { UserProvider } from './context/UserContext';
import { ensureDatabaseInitialized } from './lib/initDB';
import './styles/globals.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Wrapper component that ensures database is initialized
const AppWithInit = () => {
  const { isLoaded, userId } = useAuth();
  
  useEffect(() => {
    // Initialize database when auth is loaded
    if (isLoaded) {
      console.log('Auth loaded, checking database...');
      ensureDatabaseInitialized()
        .then(initialized => {
          console.log('Database initialization check complete:', initialized);
        })
        .catch(err => {
          console.error('Error during database initialization:', err);
        });
    }
  }, [isLoaded]);

  return <App />;
};

// Render app with or without Clerk based on key availability
const renderApp = () => {
  if (clerkPubKey) {
    return (
      <BrowserRouter>
        <ClerkProvider publishableKey={clerkPubKey}>
          <UserProvider>
            <ThemeProvider theme={lightTheme}>
              <GlobalStyle />
              <AppWithInit />
            </ThemeProvider>
          </UserProvider>
        </ClerkProvider>
      </BrowserRouter>
    );
  } else {
    console.warn('No Clerk key found, running without authentication');
    return (
      <BrowserRouter>
        <ThemeProvider theme={lightTheme}>
          <GlobalStyle />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    );
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {renderApp()}
  </React.StrictMode>
); 