// Mock function for now
export async function getSpreadsheetById(id: string) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Return mock data
  return {
    id,
    name: "Mock Spreadsheet",
    data: [
      ["Header 1", "Header 2", "Header 3"],
      ["Data 1", "Data 2", "Data 3"],
      ["Data 4", "Data 5", "Data 6"],
    ],
  };
} 