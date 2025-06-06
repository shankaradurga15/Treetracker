import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ucolnslwmhhqsscuhvcj.supabase.co'; // replace with your URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjb2xuc2x3bWhocXNzY3VodmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NDQzNDksImV4cCI6MjA2NDQyMDM0OX0.T6ZhO8JF963PvpPe3-gmdYEZ7GtvqHUqdphllTg3vzk'; // replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface TreeData {
  id: string
  custom_id: string
  tree_name: string
  species: string
  o2_released: string
  co2_released: string
  created_at?: string
  updated_at?: string
}

export interface TreeSummary {
  id: string
  custom_id: string
  tree_name: string
  species: string
  total_trees: number
  active_trees: number
  dead_trees: number
  o2_released: string
  co2_released: string
}

export interface TreeType {
  custom_id: string
  tree_name: string
  species: string
  tree_count: number
}

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from("trees").select("count", { count: "exact", head: true })
    if (error) throw error
    return { success: true, count: data }
  } catch (error) {
    console.error("Supabase connection error:", error)
    return { success: false, error }
  }
}

// Function to get tree types
export const getTreeTypes = async () => {
  try {
    const { data, error } = await supabase.rpc("get_tree_types")
    if (error) throw error
    return { success: true, data: data as TreeType[] }
  } catch (error) {
    console.error("Error getting tree types:", error)
    return { success: false, error }
  }
}

// Function to get or create tree type ID
export const getTreeTypeId = async (treeName: string, species: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc("get_tree_type_id", {
      p_tree_name: treeName,
      p_species: species,
    })

    if (error) {
      console.error("Error getting tree type ID:", error)
      return `T${Math.floor(Math.random() * 900) + 100}`
    }

    return data || `T${Math.floor(Math.random() * 900) + 100}`
  } catch (error) {
    console.error("Error in getTreeTypeId:", error)
    return `T${Math.floor(Math.random() * 900) + 100}`
  }
}

// Function to get the next tree ID (dummy implementation)
export const getNextTreeId = async (): Promise<string> => {
  return `T${Math.floor(Math.random() * 900) + 100}`
}

