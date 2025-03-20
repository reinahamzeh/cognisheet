import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 2rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  min-width: 180px;

  &:hover {
    transform: translateY(-2px);
  }
`;

const UploadButton = styled(Button)`
  background-color: #1e2c54;

  &:hover {
    background-color: #283a6d;
  }
`;

const NewFileButton = styled(Button)`
  background-color: #1e2c54;

  &:hover {
    background-color: #283a6d;
  }
`;

const WatchDemoButton = styled(Button)`
  background-color: #1e3854;

  &:hover {
    background-color: #284a6d;
  }
`;

interface LandingPageProps {
  onUploadFile: (file: File) => void;
  onNewFile: () => void;
  onWatchDemo: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onUploadFile, onNewFile, onWatchDemo }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change event triggered');
    
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.error('No files selected');
      return;
    }
    
    const file = files[0];
    console.log('Selected file:', file.name, 'size:', file.size, 'type:', file.type);
    
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
    
    onUploadFile(file);
  };

  return (
    <Container>
      <Title>Welcome to Cognisheet</Title>
      <ButtonContainer>
        <label>
          <input
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <UploadButton as="span">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 11L12 8L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 16H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Upload File
          </UploadButton>
        </label>
        <NewFileButton onClick={onNewFile}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New File
        </NewFileButton>
        <WatchDemoButton onClick={onWatchDemo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 6L18 12L8 18V6Z" fill="currentColor"/>
          </svg>
          Watch Demo
        </WatchDemoButton>
      </ButtonContainer>
    </Container>
  );
};

export default LandingPage; 