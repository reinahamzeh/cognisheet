"use client";

import React, { createContext, useContext, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface SpreadsheetContextType {
  data: any[][] | null;
  fileName: string | null;
  loading: boolean;
  handleFileUpload: (file: File) => Promise<void>;
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
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      setSpreadsheetData(data.content);
      setFileName(file.name);

      toast({
        title: "Success",
        description: "File uploaded successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
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