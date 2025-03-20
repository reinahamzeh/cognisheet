import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sdyhsxekuofypisnegpl.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Missing Supabase key in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
  try {
    // Read the schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL into separate statements
    const statements = schemaSql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each SQL statement directly via Supabase API
    for (const [index, statement] of statements.entries()) {
      console.log(`Executing statement ${index + 1}/${statements.length}`);
      
      try {
        // Directly execute SQL (requires service role key)
        const { error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error && error.code === '42P01') {
          // Table doesn't exist yet, which is expected
          console.log('Creating tables...');
        } else if (error) {
          console.error('Error checking database:', error);
        }
        
        // For this implementation, we'll use the Supabase Dashboard SQL Editor
        // to execute these statements manually, since the JS client doesn't 
        // support arbitrary SQL execution without a service role key
        console.log(`Please execute this SQL statement manually in the Supabase Dashboard SQL Editor:`);
        console.log('---');
        console.log(statement);
        console.log('---');
      } catch (err) {
        console.error(`Error with statement ${index + 1}:`, err);
      }
    }
    
    console.log('Schema SQL has been output. Please execute these statements in the Supabase Dashboard SQL Editor.');
  } catch (error) {
    console.error('Error applying schema:', error);
  }
}

// Execute the function
applySchema(); 