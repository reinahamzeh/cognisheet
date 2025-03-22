#!/usr/bin/env node

// CLI script to seed the database with test data
// Run with: node lib/seed-db-cli.js
// Make sure to set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY env variables

// Dynamic import for ES modules/TypeScript compatibility
async function run() {
  // Import the seed function
  const { seedDatabase } = await import('./seed-db.js')

  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL environment variable is required')
    process.exit(1)
  }

  if (!process.env.SUPABASE_SERVICE_KEY) {
    console.error('Error: SUPABASE_SERVICE_KEY environment variable is required')
    process.exit(1)
  }

  // Run the seeding
  console.log('Starting database seeding...')
  try {
    await seedDatabase()
    console.log('Database seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Database seeding failed:', error)
    process.exit(1)
  }
}

// Execute the function
run() 