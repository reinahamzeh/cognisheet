// Seed script to populate the database with test data
// Run this after initializing the database structure

import { createClient } from '@supabase/supabase-js'

// Create a client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || '' // Service key with admin privileges
)

// Create demo users
async function createDemoUsers() {
  console.log('Creating demo users...')

  try {
    // Create a few demo users with different subscription plans
    const demoUsers = [
      {
        email: 'free@example.com',
        password: 'demopassword',
        user_metadata: { full_name: 'Free User' },
        plan_type: 'free'
      },
      {
        email: 'basic@example.com',
        password: 'demopassword',
        user_metadata: { full_name: 'Basic User' },
        plan_type: 'basic'
      },
      {
        email: 'premium@example.com',
        password: 'demopassword',
        user_metadata: { full_name: 'Premium User' },
        plan_type: 'premium'
      }
    ]

    // Create each user
    for (const user of demoUsers) {
      // First create auth user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: user.user_metadata,
        email_confirm: true
      })

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError)
        continue
      }

      // Then add the user to the users table with their plan
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authUser.user.id,
          email: user.email,
          full_name: user.user_metadata.full_name,
          plan_type: user.plan_type
        })

      if (userError) {
        console.error(`Error adding user ${user.email} to users table:`, userError)
      } else {
        console.log(`Created user: ${user.email} with plan: ${user.plan_type}`)
      }
    }
  } catch (error) {
    console.error('Error creating demo users:', error)
  }
}

// Create demo spreadsheets for users
async function createDemoSpreadsheets() {
  console.log('Creating demo spreadsheets...')

  try {
    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }

    // For each user, create 1-3 demo spreadsheets
    for (const user of users) {
      const numSheets = Math.floor(Math.random() * 3) + 1 // 1-3 sheets per user
      
      for (let i = 1; i <= numSheets; i++) {
        const sheetName = `Demo Spreadsheet ${i}`
        
        // Create a simple spreadsheet structure
        const demoContent = {
          cells: {
            'A1': { value: 'Product', type: 'string' },
            'B1': { value: 'Category', type: 'string' },
            'C1': { value: 'Price', type: 'number' },
            'D1': { value: 'Stock', type: 'number' },
            'A2': { value: 'Laptop', type: 'string' },
            'B2': { value: 'Electronics', type: 'string' },
            'C2': { value: 1299.99, type: 'number' },
            'D2': { value: 15, type: 'number' },
            'A3': { value: 'Desk Chair', type: 'string' },
            'B3': { value: 'Furniture', type: 'string' },
            'C3': { value: 199.99, type: 'number' },
            'D3': { value: 25, type: 'number' },
            'A4': { value: 'Coffee Maker', type: 'string' },
            'B4': { value: 'Appliances', type: 'string' },
            'C4': { value: 89.99, type: 'number' },
            'D4': { value: 42, type: 'number' }
          },
          columnWidths: {
            'A': 150,
            'B': 120,
            'C': 100,
            'D': 100
          },
          rowHeights: {
            '1': 30
          }
        }

        // Insert the spreadsheet
        const { error: sheetError } = await supabaseAdmin
          .from('spreadsheets')
          .insert({
            user_id: user.id,
            name: sheetName,
            content: demoContent,
            storage_path: null
          })

        if (sheetError) {
          console.error(`Error creating spreadsheet for user ${user.email}:`, sheetError)
        } else {
          console.log(`Created spreadsheet "${sheetName}" for user ${user.email}`)
        }
      }
    }
  } catch (error) {
    console.error('Error creating demo spreadsheets:', error)
  }
}

// Main function to seed the database
export async function seedDatabase() {
  console.log('Starting database seeding...')
  
  try {
    await createDemoUsers()
    await createDemoSpreadsheets()
    console.log('Database seeding complete!')
  } catch (error) {
    console.error('Database seeding failed:', error)
  }
}

// Usage:
// seedDatabase().then(() => console.log('Done!')) 