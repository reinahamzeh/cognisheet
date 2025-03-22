import React, { useState } from 'react';
import styled from 'styled-components';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';

const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const TabContainer = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGrey};
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: ${({ active }) => (active ? '600' : '400')};
  color: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.grey)};
  cursor: pointer;
  border-bottom: 2px solid ${({ active, theme }) => (active ? theme.colors.primary : 'transparent')};
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return null; // Don't render if user is already signed in
  }

  return (
    <AuthContainer>
      <TabContainer>
        <Tab 
          active={activeTab === 'signin'} 
          onClick={() => setActiveTab('signin')}
        >
          Sign In
        </Tab>
        <Tab 
          active={activeTab === 'signup'} 
          onClick={() => setActiveTab('signup')}
        >
          Sign Up
        </Tab>
      </TabContainer>
      
      {activeTab === 'signin' ? (
        <SignIn 
          routing="path" 
          path="/sign-in" 
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary-dark',
              card: 'w-full shadow-none',
              headerTitle: 'text-xl font-semibold',
              headerSubtitle: 'text-sm text-gray-500',
            }
          }}
        />
      ) : (
        <SignUp 
          routing="path" 
          path="/sign-up" 
          signInUrl="/sign-in"
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary-dark',
              card: 'w-full shadow-none',
              headerTitle: 'text-xl font-semibold',
              headerSubtitle: 'text-sm text-gray-500',
            }
          }}
        />
      )}
    </AuthContainer>
  );
};

export default Auth; 