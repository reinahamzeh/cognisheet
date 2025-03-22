"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SavedSpreadsheet {
  id: string;
  name: string;
  createdAt: string;
}

interface SavedSpreadsheetsProps {
  onLoadSpreadsheet: (spreadsheet: SavedSpreadsheet) => void;
}

export function SavedSpreadsheets({ onLoadSpreadsheet }: SavedSpreadsheetsProps) {
  // Mock data for now
  const savedSpreadsheets: SavedSpreadsheet[] = [
    {
      id: "1",
      name: "Sales Data 2024",
      createdAt: "2024-03-20",
    },
    {
      id: "2",
      name: "Inventory Report",
      createdAt: "2024-03-19",
    },
  ];

  return (
    <div className="grid gap-4">
      {savedSpreadsheets.map((spreadsheet) => (
        <Card key={spreadsheet.id}>
          <CardHeader>
            <CardTitle>{spreadsheet.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Created: {spreadsheet.createdAt}
              </span>
              <Button onClick={() => onLoadSpreadsheet(spreadsheet)}>Load</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 