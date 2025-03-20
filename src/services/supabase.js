import { createClient } from '@supabase/supabase-js';

// Extract Supabase URL and anon key from environment variables
// Make sure these are set correctly in .env.local
const supabaseUrl = 'https://sdyhsxekuofypisnegpl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User profile functions
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception in getUserProfile:', err);
    return null;
  }
};

export const createUserProfile = async (userId, profile) => {
  try {
    // Check if profile already exists to avoid duplicates
    const existingProfile = await getUserProfile(userId);
    if (existingProfile) {
      console.log('Profile already exists, updating instead');
      return await updateUserProfile(userId, profile);
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        { 
          user_id: userId,
          ...profile,
          created_at: new Date()
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    
    return data[0];
  } catch (err) {
    console.error('Exception in createUserProfile:', err);
    return null;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('user_id', userId)
      .select();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    return data[0];
  } catch (err) {
    console.error('Exception in updateUserProfile:', err);
    return null;
  }
};

// Spreadsheet functions
export const saveSpreadsheet = async (userId, spreadsheetData) => {
  try {
    const { data, error } = await supabase
      .from('spreadsheets')
      .insert([
        {
          user_id: userId,
          data: spreadsheetData.data,
          name: spreadsheetData.name,
          created_at: new Date()
        }
      ])
      .select();
    
    if (error) {
      console.error('Error saving spreadsheet:', error);
      return null;
    }
    
    return data[0];
  } catch (err) {
    console.error('Exception in saveSpreadsheet:', err);
    return null;
  }
};

export const getUserSpreadsheets = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('spreadsheets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user spreadsheets:', error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Exception in getUserSpreadsheets:', err);
    return [];
  }
};

export const getSpreadsheetById = async (spreadsheetId) => {
  try {
    const { data, error } = await supabase
      .from('spreadsheets')
      .select('*')
      .eq('id', spreadsheetId)
      .single();
    
    if (error) {
      console.error('Error fetching spreadsheet:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception in getSpreadsheetById:', err);
    return null;
  }
};

export const deleteSpreadsheet = async (spreadsheetId) => {
  try {
    const { error } = await supabase
      .from('spreadsheets')
      .delete()
      .eq('id', spreadsheetId);
    
    if (error) {
      console.error('Error deleting spreadsheet:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception in deleteSpreadsheet:', err);
    return false;
  }
}; 