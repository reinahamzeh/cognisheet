#!/usr/bin/env node

// This is a CLI script to initialize the database
// Run with: ts-node lib/init-db.ts
// Make sure to set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY env variables

// Dynamic import for ES modules/TypeScript compatibility
async function run(): Promise<void> {
  // Import the initialization function
  const schema = await import('./init-schema.js');
  const { initializeDatabase } = schema;

  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL environment variable is required');
    process.exit(1);
  }

  if (!process.env.SUPABASE_SERVICE_KEY) {
    console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
    process.exit(1);
  }

  // Run the initialization
  console.log('Starting database initialization...');
  try {
    await initializeDatabase();
    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Execute the function
run(); 