"use client";

import React, { createContext, useContext, useState } from "react";

interface SpreadsheetContextType {
  data: any[][] | null;
  fileName: string | null;
  loading: boolean;
  handleFileUpload: () => Promise<void>;
  setData: (data: any[][], fileName: string) => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(
  undefined
);

export function SpreadsheetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setSpreadsheetData] = useState<any[][] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async () => {
    setLoading(true);
    try {
      // File upload logic here
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setLoading(false);
    }
  };

  const setData = (newData: any[][], newFileName: string) => {
    setSpreadsheetData(newData);
    setFileName(newFileName);
  };

  return (
    <SpreadsheetContext.Provider
      value={{
        data,
        fileName,
        loading,
        handleFileUpload,
        setData,
      }}
    >
      {children}
    </SpreadsheetContext.Provider>
  );
}

export function useSpreadsheet() {
  const context = useContext(SpreadsheetContext);
  if (context === undefined) {
    throw new Error("useSpreadsheet must be used within a SpreadsheetProvider");
  }
  return context;
} 