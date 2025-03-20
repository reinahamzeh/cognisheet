import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SpreadsheetProvider } from "@/context/spreadsheet-context";
import { UserProvider } from "@/context/user-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cognisheet",
  description: "AI-powered spreadsheet analysis tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <SpreadsheetProvider>{children}</SpreadsheetProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 