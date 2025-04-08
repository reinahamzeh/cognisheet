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

interface Profile {
  avatar_url?: string;
  full_name?: string;
}

interface User {
  imageUrl?: string;
  fullName?: string;
  emailAddresses: Array<{ emailAddress: string }>;
}

interface UserContext {
  isSignedIn: boolean;
  user: User | null;
  isLoaded: boolean;
  profile: Profile | null;
}

interface SpreadsheetContext {
  handleFileUpload: () => void;
  loading: boolean;
  createNewSpreadsheet?: () => void;
}

export const TailwindLandingPage: React.FC = () => {
  const { handleFileUpload, loading, createNewSpreadsheet } = useSpreadsheet() as SpreadsheetContext;
  const { isSignedIn, user, isLoaded, profile } = useUser() as UserContext;
  const { openSignIn, openSignUp, signOut } = useClerk();
  const [darkMode, setDarkMode] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
    
    document.body.style.overflow = 'auto';
    
    const initDb = async () => {
      const initialized = await ensureDatabaseInitialized();
      setDbInitialized(initialized);
    };
    
    initDb();
    
    return () => {
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
      if (typeof createNewSpreadsheet === 'function') {
        createNewSpreadsheet();
      } else {
        console.log('Creating new spreadsheet');
        const emptyData = [
          ['Column A', 'Column B', 'Column C', 'Column D', 'Column E'],
          ['', '', '', '', ''],
          ['', '', '', '', ''],
          ['', '', '', '', ''],
        ];
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
                      <th className="text-left font-medium dark:text-gray-300">Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-1 dark:text-gray-400">Widget A</td>
                      <td className="py-1 dark:text-gray-400">$1,200</td>
                    </tr>
                    <tr>
                      <td className="py-1 dark:text-gray-400">Widget B</td>
                      <td className="py-1 dark:text-gray-400">$800</td>
                    </tr>
                    <tr>
                      <td className="py-1 dark:text-gray-400">Widget C</td>
                      <td className="py-1 dark:text-gray-400">$2,100</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-span-4 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MessageSquare className="h-4 w-4" />
                <span>"Show me the total sales for each product"</span>
              </div>
              <div className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                Total sales by product:
                <ul className="mt-1 space-y-1">
                  <li>Widget A: $1,200</li>
                  <li>Widget B: $800</li>
                  <li>Widget C: $2,100</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#333333] dark:text-white mb-12">
          Why Choose Cognisheet?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#333333] dark:text-white mb-2">
              Natural Language Interface
            </h3>
            <p className="text-[#555555] dark:text-gray-300">
              Ask questions in plain English and get instant answers from your data.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#333333] dark:text-white mb-2">
              Instant Visualizations
            </h3>
            <p className="text-[#555555] dark:text-gray-300">
              Create beautiful charts and graphs with simple voice commands.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#333333] dark:text-white mb-2">
              Secure & Private
            </h3>
            <p className="text-[#555555] dark:text-gray-300">
              Your data is encrypted and stored securely. We never share your information.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-[#1A365D] dark:bg-gray-800 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already making data analysis simpler with Cognisheet.
          </p>
          <button
            onClick={isSignedIn ? handleFileUploadClick : handleSignUpClick}
            className="bg-white text-[#1A365D] hover:bg-gray-100 px-8 py-3 rounded-md inline-flex items-center gap-2 transition-colors"
          >
            {isSignedIn ? 'Upload Your First File' : 'Create Free Account'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}; 