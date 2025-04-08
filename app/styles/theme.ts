import { DefaultTheme } from 'styled-components';

export const lightTheme: DefaultTheme = {
  colors: {
    primary: '#4A90E2',
    background: '#F5F5F5',
    text: '#333333',
    accent: '#50E3C2',
    error: '#D0021B',
    border: '#E1E1E1',
    surface: '#FFFFFF',
    muted: '#757575',
  },
  spacing: {
    base: '16px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: {
      small: '14px',
      base: '16px',
      large: '18px',
      h1: '24px',
      h2: '20px',
      h3: '18px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      base: 1.5,
      heading: 1.2,
    },
  },
  borderRadius: {
    small: '4px',
    base: '8px',
    large: '12px',
    round: '50%',
  },
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.1)',
    base: '0 4px 6px rgba(0,0,0,0.1)',
    large: '0 8px 16px rgba(0,0,0,0.1)',
  },
  transitions: {
    base: '0.2s ease-in-out',
    fast: '0.1s ease-in-out',
    slow: '0.3s ease-in-out',
  },
  zIndex: {
    modal: 1000,
    overlay: 900,
    dropdown: 800,
    header: 700,
    tooltip: 600,
  },
};

export const darkTheme: DefaultTheme = {
  ...lightTheme,
  colors: {
    primary: '#5C9CE6',
    background: '#1A1A1A',
    text: '#FFFFFF',
    accent: '#50E3C2',
    error: '#FF4D4D',
    border: '#333333',
    surface: '#2D2D2D',
    muted: '#999999',
  },
}; 