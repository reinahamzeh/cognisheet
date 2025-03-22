"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

const ColorModeContext = createContext({ colorMode: "light", setColorMode: () => null })

export function ColorModeProvider({
  children,
  defaultTheme = "light",
  enableSystem = false,
  attribute = "class",
  ...props
}) {
  const [colorMode, setColorMode] = useState(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement

    if (attribute === "class") {
      root.classList.remove("light", "dark")
      if (colorMode) {
        root.classList.add(colorMode)
      }
    } else {
      root.setAttribute(attribute, colorMode)
    }
  }, [colorMode, attribute])

  const value = {
    colorMode,
    setColorMode: (newTheme) => setColorMode(newTheme),
    toggleColorMode: () => setColorMode(colorMode === "light" ? "dark" : "light")
  }

  return (
    <ColorModeContext.Provider {...props} value={value}>
      {children}
    </ColorModeContext.Provider>
  )
}

export const useColorMode = () => {
  const context = useContext(ColorModeContext)
  if (context === undefined) {
    throw new Error("useColorMode must be used within a ColorModeProvider")
  }
  return context
} 