"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSpreadsheet } from "@/context/spreadsheet-context";
import { useUser } from "@/context/user-context";
import { Auth } from "@/components/auth";
import { SavedSpreadsheets } from "@/components/saved-spreadsheets";
import { getSpreadsheetById } from "@/lib/supabase";

export function LandingPage() {
  const { handleFileUpload, loading, setData } = useSpreadsheet();
  const userContext = useUser();
  const isSignedIn = userContext?.isSignedIn ?? false;
  const isLoaded = userContext?.isLoaded ?? true;
  const [activeTab, setActiveTab] = useState("upload");

  const handleLoadSpreadsheet = async (spreadsheet: any) => {
    try {
      const fullSpreadsheet = await getSpreadsheetById(spreadsheet.id);
      if (fullSpreadsheet && fullSpreadsheet.data) {
        setData(fullSpreadsheet.data, spreadsheet.name);
      }
    } catch (error) {
      console.error("Error loading spreadsheet:", error);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-start p-8 text-center">
      <h1 className="mb-4 text-4xl font-bold text-primary">
        Welcome to Cognisheet
      </h1>
      <p className="mb-8 max-w-[600px] text-lg text-muted-foreground">
        A user-friendly spreadsheet tool with an AI chat interface for natural
        language queries. Upload your CSV, Excel, or Numbers file and start asking
        questions in plain English.
      </p>

      <Button
        size="lg"
        onClick={handleFileUpload}
        disabled={loading}
        className="mb-8"
      >
        {loading ? "Loading..." : "Upload Spreadsheet"}
      </Button>

      {userContext && (
        <>
          {isLoaded && isSignedIn ? (
            <div className="mb-8 w-full max-w-[900px]">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload New</TabsTrigger>
                  <TabsTrigger value="saved">Saved Spreadsheets</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <Button
                    size="lg"
                    onClick={handleFileUpload}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Loading..." : "Upload Spreadsheet"}
                  </Button>
                </TabsContent>
                <TabsContent value="saved">
                  <SavedSpreadsheets onLoadSpreadsheet={handleLoadSpreadsheet} />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            isLoaded &&
            !isSignedIn && (
              <div className="mb-8 w-full max-w-[900px]">
                <h2 className="mb-4 text-left text-2xl font-semibold text-foreground">
                  Sign in to save your spreadsheets
                </h2>
                <Auth />
              </div>
            )
          )}
        </>
      )}

      <div className="mb-8 flex max-w-[900px] flex-wrap justify-center gap-8">
        <Card className="w-[250px] p-6">
          <h3 className="mb-2 text-lg font-semibold text-primary">
            AI-Powered Analysis
          </h3>
          <p className="text-sm text-muted-foreground">
            Get intelligent insights from your data using our advanced AI
            assistant.
          </p>
        </Card>

        <Card className="w-[250px] p-6">
          <h3 className="mb-2 text-lg font-semibold text-primary">
            Instant Visualizations
          </h3>
          <p className="text-sm text-muted-foreground">
            Create charts and graphs with simple commands like "create a bar
            chart".
          </p>
        </Card>

        <Card className="w-[250px] p-6">
          <h3 className="mb-2 text-lg font-semibold text-primary">
            Easy Data Selection
          </h3>
          <p className="text-sm text-muted-foreground">
            Select data ranges with your mouse or use Cmd+K to select all data.
          </p>
        </Card>
      </div>

      <div className="max-w-[600px] rounded-lg bg-primary/10 p-6">
        <h2 className="mb-2 text-xl font-semibold text-primary">
          Powered by OpenAI
        </h2>
        <p className="text-muted-foreground">
          Our AI assistant uses OpenAI's powerful language models to analyze your
          data and provide meaningful insights.
        </p>
      </div>
    </div>
  );
} 