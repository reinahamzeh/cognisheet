import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common Supabase operations
export async function getUserFiles(userId: string) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user files:', error)
    return []
  }
  
  return data || []
}

export async function getSpreadsheetById(id: string) {
  const { data, error } = await supabase
    .from('spreadsheets')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching spreadsheet:', error)
    return null
  }
  
  return data
}

export async function createFile(userId: string, fileName: string, content: any) {
  const { data, error } = await supabase
    .from('files')
    .insert([
      { 
        user_id: userId, 
        name: fileName, 
        content: content 
      }
    ])
    .select()
  
  if (error) {
    console.error('Error creating file:', error)
    throw error
  }
  
  return data?.[0]
}

export async function updateFile(fileId: string, updates: any) {
  const { data, error } = await supabase
    .from('files')
    .update(updates)
    .eq('id', fileId)
    .select()
  
  if (error) {
    console.error('Error updating file:', error)
    throw error
  }
  
  return data?.[0]
}

export async function deleteFile(fileId: string) {
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId)
  
  if (error) {
    console.error('Error deleting file:', error)
    throw error
  }
  
  return true
}

// Additional spreadsheet-specific functions
export async function getUserSpreadsheets(userId: string) {
  const { data, error } = await supabase
    .from('spreadsheets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user spreadsheets:', error)
    return []
  }
  
  return data || []
}

export async function saveSpreadsheet(spreadsheetData: any) {
  const { userId, name, content } = spreadsheetData
  
  if (!userId) {
    throw new Error('User ID is required')
  }
  
  const { data, error } = await supabase
    .from('spreadsheets')
    .insert([
      { 
        user_id: userId, 
        name: name || 'Untitled Spreadsheet', 
        content: content || {},
        created_at: new Date().toISOString(),
      }
    ])
    .select()
  
  if (error) {
    console.error('Error saving spreadsheet:', error)
    throw error
  }
  
  return data?.[0]
}

export async function updateSpreadsheet(id: string, updates: any) {
  const { data, error } = await supabase
    .from('spreadsheets')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
  
  if (error) {
    console.error('Error updating spreadsheet:', error)
    throw error
  }
  
  return data?.[0]
}

export async function deleteSpreadsheet(id: string) {
  const { error } = await supabase
    .from('spreadsheets')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting spreadsheet:', error)
    throw error
  }
  
  return true
} 