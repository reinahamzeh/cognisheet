import { supabase } from '../services/supabase.ts';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize the database with the required tables
 * Run this function once when setting up a new environment
 */
export const initializeDatabase = async () => {
  try {
    // Read the SQL schema file
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the SQL commands
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('Error initializing database:', error);
      return false;
    }
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

/**
 * Check if the database is properly initialized
 */
export const checkDatabaseTables = async () => {
  try {
    // Check if the profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError && profilesError.code === '42P01') {
      // Table doesn't exist
      console.log('Database not initialized. Tables missing.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking database tables:', error);
    return false;
  }
};

/**
 * Initialize database if not already initialized
 */
export const ensureDatabaseInitialized = async () => {
  try {
    if (!supabase) {
      console.log('No Supabase client found, skipping database initialization');
      return true;
    }
    
    // Check if the profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError) {
      console.log('Database not accessible or not initialized. Running in local mode.');
      return true;
    }
    
    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.log('Error checking database, running in local mode:', err);
    return true;
  }
}; 