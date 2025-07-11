import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      test_suites: {
        Row: {
          id: string
          name: string
          description: string | null
          project_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          project_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          project_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      test_runs: {
        Row: {
          id: string
          name: string
          status: "pending" | "running" | "completed" | "failed"
          suite_id: string
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: "pending" | "running" | "completed" | "failed"
          suite_id: string
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: "pending" | "running" | "completed" | "failed"
          suite_id?: string
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      test_steps: {
        Row: {
          id: string
          name: string
          description: string | null
          step_type: "video" | "image" | "text"
          media_url: string | null
          run_id: string
          step_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          step_type: "video" | "image" | "text"
          media_url?: string | null
          run_id: string
          step_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          step_type?: "video" | "image" | "text"
          media_url?: string | null
          run_id?: string
          step_order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type TestSuite = Database["public"]["Tables"]["test_suites"]["Row"]
export type TestRun = Database["public"]["Tables"]["test_runs"]["Row"]
export type TestStep = Database["public"]["Tables"]["test_steps"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

// This file is kept for compatibility but uses mock data instead of Supabase
export * from "./mock-data"
