import React, { useState, useEffect } from 'react';
import { ArrowRight, BarChart3, FileSpreadsheet, MessageSquare, Shield, Moon, Sun, Upload, FilePlus } from 'lucide-react';
import { useSpreadsheet } from '../context/SpreadsheetContext';
import { useUser } from '../context/UserContext';
import { 
  useClerk, 
  SignUpButton,
  SignInButton
} from '@clerk/clerk-react';
import { ensureDatabaseInitialized } from '../lib/initDB';

const TailwindLandingPage = () => {
  const { handleFileUpload, loading, createNewSpreadsheet } = useSpreadsheet();
  const { isSignedIn, user, isLoaded, profile } = useUser();
  const { openSignIn, openSignUp, signOut } = useClerk();
  const [darkMode, setDarkMode] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user prefers dark mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
    
    // Enable scrolling
    document.body.style.overflow = 'auto';
    
    // Initialize database if needed
    const initDb = async () => {
      const initialized = await ensureDatabaseInitialized();
      setDbInitialized(initialized);
    };
    
    initDb();
    
    return () => {
      // Cleanup when component unmounts
      document.body.style.overflow = '';
    };
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleFileUploadClick = () => {
    if (isSignedIn) {
      handleFileUpload();
    } else {
      openSignIn();
    }
  };

  const handleNewFileClick = () => {
    if (isSignedIn) {
      // Call the createNewSpreadsheet function from context if it exists, otherwise use a fallback
      if (typeof createNewSpreadsheet === 'function') {
        createNewSpreadsheet();
      } else {
        // Fallback - you may need to implement this in your SpreadsheetContext
        console.log('Creating new spreadsheet');
        // Create empty data and set it
        const emptyData = [
          ['Column A', 'Column B', 'Column C', 'Column D', 'Column E'],
          ['', '', '', '', ''],
          ['', '', '', '', ''],
          ['', '', '', '', ''],
        ];
        // If there's a setData function in your context, you could call it here
      }
    } else {
      openSignIn();
    }
  };

  const handleSignUpClick = () => {
    openSignUp({
      redirectUrl: window.location.href,
      afterSignUpUrl: window.location.href,
    });
  };

  const handleSignInClick = () => {
    openSignIn({
      redirectUrl: window.location.href,
      afterSignInUrl: window.location.href,
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-900 dark:text-white transition-colors duration-200 overflow-auto">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-8 w-8 text-[#1A365D] dark:text-blue-400" />
          <span className="text-2xl font-bold text-[#333333] dark:text-white">Cognisheet</span>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {!isLoaded ? (
            <div className="animate-pulse bg-gray-300 h-10 w-24 rounded-md"></div>
          ) : !isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button 
                  className="bg-[#1A365D] dark:bg-blue-600 hover:bg-[#0F2942] dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button 
                  className="bg-[#1A365D] dark:bg-blue-600 hover:bg-[#0F2942] dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img 
                  src={profile?.avatar_url || user?.imageUrl || 'https://www.gravatar.com/avatar?d=mp'} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full"
                />
                <span className="hidden md:inline text-sm">
                  {profile?.full_name || user?.fullName || user?.emailAddresses[0]?.emailAddress || 'User'}
                </span>
              </button>
              
              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-auto min-w-[250px] py-2 bg-[#1A365D] dark:bg-gray-800 rounded-md shadow-xl z-50">
                  <div className="px-4 py-2 text-sm text-white border-b border-gray-200/20 dark:border-gray-700">
                    {user?.emailAddresses[0]?.emailAddress}
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#0F2942] dark:hover:bg-gray-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-5xl font-bold text-[#333333] dark:text-white mb-4">
            Spreadsheets Made <span className="text-[#1A365D] dark:text-blue-400">Simple</span>
          </h1>
          <p className="text-lg text-[#555555] dark:text-gray-300 mb-8">
            Ask questions about your data in plain English. No formulas, no complexity—just answers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {isSignedIn ? (
              <>
                <button 
                  onClick={handleFileUpload} 
                  disabled={loading}
                  className="bg-[#1A365D] dark:bg-blue-600 hover:bg-[#0F2942] dark:hover:bg-blue-700 text-white px-8 py-3 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : (
                    <>
                      <Upload className="h-4 w-4" /> Upload File
                    </>
                  )}
                </button>
                <button 
                  onClick={handleNewFileClick}
                  className="bg-[#1A365D] dark:bg-blue-600 hover:bg-[#0F2942] dark:hover:bg-blue-700 text-white px-8 py-3 rounded-md flex items-center justify-center gap-2 transition-colors"
                >
                  <FilePlus className="h-4 w-4" /> New File
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSignInClick}
                  disabled={loading}
                  className="bg-[#1A365D] dark:bg-blue-600 hover:bg-[#0F2942] dark:hover:bg-blue-700 text-white px-8 py-3 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : (
                    <>
                      <Upload className="h-4 w-4" /> Upload File
                    </>
                  )}
                </button>
                <button
                  onClick={handleSignInClick}
                  className="bg-[#1A365D] dark:bg-blue-600 hover:bg-[#0F2942] dark:hover:bg-blue-700 text-white px-8 py-3 rounded-md flex items-center justify-center gap-2 transition-colors"
                >
                  <FilePlus className="h-4 w-4" /> New File
                </button>
              </>
            )}
            <button className="border border-[#1A365D] text-[#1A365D] dark:border-blue-400 dark:text-blue-400 hover:bg-[#1A365D] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white px-8 py-3 rounded-md transition-colors flex items-center justify-center gap-2">
              Watch Demo
            </button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-medium dark:text-gray-300">Product</th>
                      <th className="text-left font-medium dark:text-gray-300">Q1</th>
                      <th className="text-left font-medium dark:text-gray-300">Q2</th>
                      <th className="text-left font-medium dark:text-gray-300">Q3</th>
                    </tr>
                  </thead>
                  <tbody className="dark:text-gray-300">
                    <tr>
                      <td className="py-1">Widgets</td>
                      <td className="py-1">120</td>
                      <td className="py-1">145</td>
                      <td className="py-1">190</td>
                    </tr>
                    <tr>
                      <td className="py-1">Gadgets</td>
                      <td className="py-1">85</td>
                      <td className="py-1">95</td>
                      <td className="py-1">110</td>
                    </tr>
                    <tr>
                      <td className="py-1">Tools</td>
                      <td className="py-1">65</td>
                      <td className="py-1">85</td>
                      <td className="py-1">95</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4 h-24 flex items-center justify-center">
                  <BarChart3 className="h-20 w-20 text-[#1A365D] dark:text-blue-400 opacity-70" />
                </div>
              </div>
              <div className="col-span-4">
                <div className="mb-2 font-medium dark:text-gray-300">Chat</div>
                <div className="space-y-2">
                  <div className="bg-[#E9F2FD] dark:bg-blue-900 p-2 rounded-md text-xs dark:text-gray-200">What's the average Q2 sales?</div>
                  <div className="bg-white dark:bg-gray-700 p-2 rounded-md text-xs border dark:border-gray-600 dark:text-gray-300">The average Q2 sales is 108.33</div>
                  <div className="bg-[#E9F2FD] dark:bg-blue-900 p-2 rounded-md text-xs dark:text-gray-200">Show me a bar chart of all products</div>
                  <div className="bg-white dark:bg-gray-700 p-2 rounded-md text-xs border dark:border-gray-600 dark:text-gray-300">Generated chart below</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#333333] dark:text-white mb-12">Simplify Your Data Analysis</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#F5F5F5] dark:bg-gray-700 p-6 rounded-lg">
              <MessageSquare className="h-12 w-12 text-[#1A365D] dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-2 dark:text-white">Smart Data Assistant</h3>
              <p className="text-[#555555] dark:text-gray-300">
                Ask questions, create charts, and analyze data with our AI-powered assistant.
              </p>
            </div>
            <div className="bg-[#F5F5F5] dark:bg-gray-700 p-6 rounded-lg">
              <FileSpreadsheet className="h-12 w-12 text-[#1A365D] dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-2 dark:text-white">Easy File Upload</h3>
              <p className="text-[#555555] dark:text-gray-300">Import your CSV or Excel files with a simple drag and drop interface.</p>
            </div>
            <div className="bg-[#F5F5F5] dark:bg-gray-700 p-6 rounded-lg">
              <BarChart3 className="h-12 w-12 text-[#1A365D] dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-2 dark:text-white">Instant Visualizations</h3>
              <p className="text-[#555555] dark:text-gray-300">
                Generate charts and graphs with a simple request. No configuration needed.
              </p>
            </div>
            <div className="bg-[#F5F5F5] dark:bg-gray-700 p-6 rounded-lg">
              <Shield className="h-12 w-12 text-[#1A365D] dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-2 dark:text-white">Privacy First</h3>
              <p className="text-[#555555] dark:text-gray-300">
                All data processing happens locally on your device. Your data never leaves your computer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#333333] dark:text-white mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-[#1A365D] dark:bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Upload Your File</h3>
            <p className="text-[#555555] dark:text-gray-300">Import your CSV or Excel spreadsheet with a simple drag and drop.</p>
          </div>
          <div className="text-center">
            <div className="bg-[#1A365D] dark:bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Ask Questions</h3>
            <p className="text-[#555555] dark:text-gray-300">Type your questions in plain English in the chat interface.</p>
          </div>
          <div className="text-center">
            <div className="bg-[#1A365D] dark:bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Get Instant Results</h3>
            <p className="text-[#555555] dark:text-gray-300">Receive answers, calculations, and visualizations immediately.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1A365D] dark:bg-blue-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Simplify Your Spreadsheet Experience?</h2>
          <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed the way they work with data using AI-powered analytics.
          </p>
          {isSignedIn ? (
            <button 
              onClick={handleFileUpload}
              disabled={loading}
              className="bg-white text-[#1A365D] dark:bg-gray-100 dark:text-blue-900 hover:bg-[#F0F0F0] dark:hover:bg-gray-200 px-8 py-3 rounded-md font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              {loading ? 'Loading...' : (
                <>
                  <Upload className="h-4 w-4" /> Upload File
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSignInClick}
              disabled={loading}
              className="bg-white text-[#1A365D] dark:bg-gray-100 dark:text-blue-900 hover:bg-[#F0F0F0] dark:hover:bg-gray-200 px-8 py-3 rounded-md font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              {loading ? 'Loading...' : (
                <>
                  <Upload className="h-4 w-4" /> Upload File
                </>
              )}
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#333333] dark:bg-gray-950 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <FileSpreadsheet className="h-6 w-6" />
              <span className="text-xl font-bold">Cognisheet</span>
            </div>
            <div className="text-sm text-gray-400">© {new Date().getFullYear()} Cognisheet. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TailwindLandingPage; 