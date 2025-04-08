import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './client-providers';
import { ClerkProvider } from '@clerk/nextjs';
import { auth } from "@clerk/nextjs/server";
import { getProfileByUserIdAction as getProfileByUserId, createProfileAction as createProfile } from "../db/actions/profiles-actions";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cognisheet',
  description: 'A user-friendly spreadsheet tool with a chat interface for natural language queries',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {userId} = await auth();

if (userId) {
    const profile = await getProfileByUserId(userId);
    if (!profile) {
      await createProfile({ userId });
    }
  }
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
    </ClerkProvider>
  );
}

