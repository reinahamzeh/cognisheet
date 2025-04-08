import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { getUserProfile, createUserProfile, updateUserProfile } from '../services/supabase.ts';

const UserContext = createContext();

export const useUser = () => useContext(UserContext) || {};

export const UserProvider = ({ children }) => {
  const { user: clerkUser, isSignedIn, isLoaded: clerkLoaded } = useClerkUser() || {};
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const syncUserProfile = async () => {
      if (!clerkLoaded) return;
      
      try {
        setLoading(true);
        setError(null);
        
        if (isSignedIn && clerkUser) {
          // Get user profile from Supabase
          let userProfile = await getUserProfile(clerkUser.id);
          
          // If profile doesn't exist, create one
          if (!userProfile) {
            console.log('Creating new user profile in Supabase for', clerkUser.id);
            const emailAddress = clerkUser.primaryEmailAddress?.emailAddress;
            const firstName = clerkUser.firstName || '';
            const lastName = clerkUser.lastName || '';
            
            userProfile = await createUserProfile(clerkUser.id, {
              email: emailAddress,
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`.trim(),
              avatar_url: clerkUser.imageUrl
            });
          } 
          // If profile exists but needs updates
          else if (
            userProfile.email !== clerkUser.primaryEmailAddress?.emailAddress ||
            userProfile.first_name !== clerkUser.firstName ||
            userProfile.last_name !== clerkUser.lastName ||
            userProfile.avatar_url !== clerkUser.imageUrl
          ) {
            console.log('Updating user profile in Supabase for', clerkUser.id);
            const emailAddress = clerkUser.primaryEmailAddress?.emailAddress;
            const firstName = clerkUser.firstName || '';
            const lastName = clerkUser.lastName || '';
            
            userProfile = await updateUserProfile(clerkUser.id, {
              email: emailAddress,
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`.trim(),
              avatar_url: clerkUser.imageUrl
            });
          }
          
          setProfile(userProfile || null);
        } else if (clerkLoaded && !isSignedIn) {
          // Clear profile when user signs out
          setProfile(null);
        }
      } catch (err) {
        console.error('Error syncing user profile:', err);
        setError(err?.message || 'Failed to sync user profile');
      } finally {
        setLoading(false);
      }
    };

    syncUserProfile();
  }, [clerkUser, isSignedIn, clerkLoaded]);

  const value = {
    user: clerkUser || null,
    profile: profile || null,
    isSignedIn: isSignedIn || false,
    isLoaded: (clerkLoaded && !loading) || false,
    isLoading: (!clerkLoaded || loading) || false,
    error: error || null
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext; 