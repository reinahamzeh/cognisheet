import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
  }

  #root {
    height: 100%;
  }

  button, input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    background-color: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors.lightGray};
  }

  input, textarea, select {
    padding: 8px 12px;
    border-radius: 4px;
  }

  button {
    cursor: pointer;
    border: none;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    padding: 8px 16px;
    border-radius: 4px;
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.accent};
    }
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      opacity: 0.8;
    }
  }

  /* For accessibility */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* For scrollbars */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.lightGray};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`; 