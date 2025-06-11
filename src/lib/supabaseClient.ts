import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ucolnslwmhhqsscuhvcj.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjb2xuc2x3bWhocXNzY3VodmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NDQzNDksImV4cCI6MjA2NDQyMDM0OX0.T6ZhO8JF963PvpPe3-gmdYEZ7GtvqHUqdphllTg3vzk"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tree Database Types
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

// Volunteer Database Types
export interface Volunteer {
  id: string
  volunteer_id: string
  salutation?: string
  name: string
  type: "individual" | "organization"
  email: string
  gender?: string
  phone: string
  organization_name?: string
  no_of_volunteers?: number
  aadhaar_number?: string
  address?: string
  document_url?: string
  trees_planted: number
  last_activity?: string
  verification_status?: "pending" | "in_progress" | "completed"
  created_at?: string
  updated_at?: string
}

export interface Inspection {
  id: string
  inspection_id: string
  volunteer_id: string
  area: string
  trees_count: number
  due_date: string
  status: "Pending" | "In Progress" | "Completed" | "Overdue"
  trees_inspected: number
  completed_date?: string
  tree_condition?: string
  inspector_notes?: string
  inspection_images?: string[]
  assigned_by?: string
  scheme_name?: string
  tree_species?: string
  inspection_cycle?: string
  start_date?: string
  end_date?: string
  description?: string
  created_at?: string
  updated_at?: string
  volunteer?: Volunteer
}

export interface CreateVolunteerData {
  salutation?: string
  name: string
  type: "individual" | "organization"
  email: string
  gender?: string
  phone: string
  organization_name?: string
  no_of_volunteers?: number
  aadhaar_number?: string
  address?: string
  document_url?: string
  verification_status?: "pending" | "in_progress" | "completed"
}

export interface CreateInspectionData {
  volunteer_id: string
  area: string
  trees_count: number
  due_date: string
  assigned_by?: string
  status?: "Pending" | "In Progress" | "Completed" | "Overdue"
  scheme_name?: string
  tree_species?: string
  inspection_cycle?: string
  start_date?: string
  end_date?: string
  description?: string
}

// Tree Functions
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

export const getNextTreeId = async (): Promise<string> => {
  return `T${Math.floor(Math.random() * 900) + 100}`
}

// Volunteer Functions
export const getVolunteers = async () => {
  try {
    const { data, error } = await supabase.from("volunteers").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data: data as Volunteer[] }
  } catch (error) {
    console.error("Error getting volunteers:", error)
    return { success: false, error }
  }
}

export const createVolunteer = async (volunteerData: CreateVolunteerData) => {
  try {
    const { data, error } = await supabase.from("volunteers").insert([volunteerData]).select().single()

    if (error) throw error
    return { success: true, data: data as Volunteer }
  } catch (error) {
    console.error("Error creating volunteer:", error)
    return { success: false, error }
  }
}

export const updateVolunteer = async (id: string, updates: Partial<CreateVolunteerData>) => {
  try {
    const { data, error } = await supabase
      .from("volunteers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return { success: true, data: data as Volunteer }
  } catch (error) {
    console.error("Error updating volunteer:", error)
    return { success: false, error }
  }
}

export const deleteVolunteer = async (id: string) => {
  try {
    const { error } = await supabase.from("volunteers").delete().eq("id", id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error deleting volunteer:", error)
    return { success: false, error }
  }
}

// Inspection Functions
export const getInspections = async () => {
  try {
    const { data, error } = await supabase
      .from("inspections")
      .select(`
        *,
        volunteer:volunteers(*)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data: data as Inspection[] }
  } catch (error) {
    console.error("Error getting inspections:", error)
    return { success: false, error }
  }
}

export const createInspection = async (inspectionData: CreateInspectionData) => {
  try {
    const { data, error } = await supabase
      .from("inspections")
      .insert([inspectionData])
      .select(`
        *,
        volunteer:volunteers(*)
      `)
      .single()

    if (error) throw error
    return { success: true, data: data as Inspection }
  } catch (error) {
    console.error("Error creating inspection:", error)
    return { success: false, error }
  }
}

export const updateInspection = async (id: string, updates: Partial<CreateInspectionData>) => {
  try {
    const { data, error } = await supabase
      .from("inspections")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(`
        *,
        volunteer:volunteers(*)
      `)
      .single()

    if (error) throw error
    return { success: true, data: data as Inspection }
  } catch (error) {
    console.error("Error updating inspection:", error)
    return { success: false, error }
  }
}

export const deleteInspection = async (id: string) => {
  try {
    const { error } = await supabase.from("inspections").delete().eq("id", id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error deleting inspection:", error)
    return { success: false, error }
  }
}

// Test volunteer connection function
export const testVolunteerConnection = async () => {
  try {
    const { data, error } = await supabase.from("volunteers").select("count", { count: "exact", head: true })
    if (error) throw error
    return { success: true, count: data }
  } catch (error) {
    console.error("Volunteer connection error:", error)
    return { success: false, error }
  }
}
