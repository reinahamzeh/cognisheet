import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      background: string;
      text: string;
      accent: string;
      error: string;
      border: string;
      surface: string;
      muted: string;
    };
    spacing: {
      base: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    typography: {
      fontFamily: string;
      fontSize: {
        small: string;
        base: string;
        large: string;
        h1: string;
        h2: string;
        h3: string;
      };
      fontWeight: {
        regular: number;
        medium: number;
        bold: number;
      };
      lineHeight: {
        base: number;
        heading: number;
      };
    };
    borderRadius: {
      small: string;
      base: string;
      large: string;
      round: string;
    };
    shadows: {
      small: string;
      base: string;
      large: string;
    };
    transitions: {
      base: string;
      fast: string;
      slow: string;
    };
    zIndex: {
      modal: number;
      overlay: number;
      dropdown: number;
      header: number;
      tooltip: number;
    };
  }
} 