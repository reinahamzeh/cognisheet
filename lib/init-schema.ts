// This file is for initializing the Supabase schema
// Run this once manually to set up the required tables

import { createClient } from '@supabase/supabase-js'

// Create a client with admin privileges for schema management
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || '' // Service key with admin privileges
)

async function createTables() {
  console.log('Creating tables...')

  try {
    // Using Supabase's SQL executor for DDL statements
    // Create users table
    await supabaseAdmin.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'password',
      user_metadata: { full_name: 'Admin User' }
    })

    const { error: usersError } = await supabaseAdmin.rpc('create_schema_if_not_exists', {
      schema_name: 'public'
    })

    // Execute SQL as a batch
    const { error: tablesError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        -- Users table
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          plan_type TEXT DEFAULT 'free',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
        );

        -- Spreadsheets table
        CREATE TABLE IF NOT EXISTS public.spreadsheets (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users NOT NULL,
          name TEXT NOT NULL,
          content JSONB,
          storage_path TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
        );

        -- Files table
        CREATE TABLE IF NOT EXISTS public.files (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users NOT NULL,
          name TEXT NOT NULL,
          content JSONB,
          type TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
        );
      `
    })

    if (tablesError) {
      console.error('Error creating tables:', tablesError)
    } else {
      console.log('Tables created or already exist')
    }
  } catch (error) {
    console.error('Error in table creation:', error)
  }
}

async function setupRLS() {
  console.log('Setting up RLS policies...')

  try {
    // Execute SQL for RLS policies
    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        -- Enable RLS
        ALTER TABLE public.spreadsheets ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

        -- Spreadsheet policies
        CREATE POLICY IF NOT EXISTS "Users can view their own spreadsheets" 
          ON public.spreadsheets FOR SELECT 
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert their own spreadsheets" 
          ON public.spreadsheets FOR INSERT 
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own spreadsheets" 
          ON public.spreadsheets FOR UPDATE
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own spreadsheets" 
          ON public.spreadsheets FOR DELETE
          USING (auth.uid() = user_id);

        -- File policies
        CREATE POLICY IF NOT EXISTS "Users can view their own files" 
          ON public.files FOR SELECT 
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert their own files" 
          ON public.files FOR INSERT 
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own files" 
          ON public.files FOR UPDATE
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own files" 
          ON public.files FOR DELETE
          USING (auth.uid() = user_id);
      `
    })

    if (rlsError) {
      console.error('Error setting up RLS policies:', rlsError)
    } else {
      console.log('RLS policies created or already exist')
    }
  } catch (error) {
    console.error('Error in RLS setup:', error)
  }
}

async function createStorageBuckets() {
  console.log('Creating storage buckets...')

  try {
    // Create spreadsheets bucket
    const { error: spreadsheetsBucketError } = await supabaseAdmin.storage.createBucket('spreadsheets', {
      public: false,
      fileSizeLimit: 10485760, // 10MB
    })

    if (spreadsheetsBucketError) {
      console.error('Error creating spreadsheets bucket:', spreadsheetsBucketError)
    } else {
      console.log('Spreadsheets bucket created or already exists')
    }

    // Create files bucket
    const { error: filesBucketError } = await supabaseAdmin.storage.createBucket('files', {
      public: false,
      fileSizeLimit: 10485760, // 10MB
    })

    if (filesBucketError) {
      console.error('Error creating files bucket:', filesBucketError)
    } else {
      console.log('Files bucket created or already exists')
    }

    // Set up bucket policies
    const { error: bucketPoliciesError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        -- Create bucket policies for spreadsheets
        CREATE POLICY IF NOT EXISTS "Users can access their own spreadsheet files"
          ON storage.objects FOR ALL
          USING (bucket_id = 'spreadsheets' AND auth.uid() = (storage.foldername(name))[1]::uuid);

        -- Create bucket policies for files
        CREATE POLICY IF NOT EXISTS "Users can access their own files"
          ON storage.objects FOR ALL
          USING (bucket_id = 'files' AND auth.uid() = (storage.foldername(name))[1]::uuid);
      `
    })

    if (bucketPoliciesError) {
      console.error('Error setting up bucket policies:', bucketPoliciesError)
    } else {
      console.log('Bucket policies created or already exist')
    }
  } catch (error) {
    console.error('Error in storage bucket setup:', error)
  }
}

// Main function to run all initialization steps
export async function initializeDatabase() {
  console.log('Starting database initialization...')
  
  try {
    await createTables()
    await setupRLS()
    await createStorageBuckets()
    console.log('Database initialization complete!')
  } catch (error) {
    console.error('Database initialization failed:', error)
  }
}

// Usage:
// Run this function during app initialization or deployment:
// initializeDatabase().then(() => console.log('Done!')) 