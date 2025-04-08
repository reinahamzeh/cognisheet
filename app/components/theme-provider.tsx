"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

// Color mode context
interface ColorModeContextType {
  colorMode: string;
  setColorMode: (mode: string) => void;
  toggleColorMode: () => void;
}

const ColorModeContext = React.createContext<ColorModeContextType>({
  colorMode: "light",
  setColorMode: () => null,
  toggleColorMode: () => null
});

// Next.js theme provider
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Color mode provider
interface ColorModeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  enableSystem?: boolean;
  attribute?: string;
}

export function ColorModeProvider({
  children,
  defaultTheme = "light",
  enableSystem = false,
  attribute = "class",
  ...props
}: ColorModeProviderProps) {
  const [colorMode, setColorMode] = React.useState(defaultTheme);

  React.useEffect(() => {
    const root = window.document.documentElement;

    if (attribute === "class") {
      root.classList.remove("light", "dark");
      if (colorMode) {
        root.classList.add(colorMode);
      }
    } else {
      root.setAttribute(attribute, colorMode);
    }
  }, [colorMode, attribute]);

  const value = React.useMemo(() => ({
    colorMode,
    setColorMode: (newTheme: string) => setColorMode(newTheme),
    toggleColorMode: () => setColorMode(colorMode === "light" ? "dark" : "light")
  }), [colorMode]);

  return (
    <ColorModeContext.Provider {...props} value={value}>
      {children}
    </ColorModeContext.Provider>
  );
}

// Color mode hook
export const useColorMode = () => {
  const context = React.useContext(ColorModeContext);
  if (context === undefined) {
    throw new Error("useColorMode must be used within a ColorModeProvider");
  }
  return context;
}; 