'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the App component with SSR disabled
const App = dynamic(() => import('./App'), { ssr: false });

export default function Home() {
  return <App />;
} 