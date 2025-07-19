import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de base de datos
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: "admin" | "director" | "profesor"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: "admin" | "director" | "profesor"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: "admin" | "director" | "profesor"
          created_at?: string
          updated_at?: string
        }
      }
      institutions: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          type: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          type?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          type?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          institution_id: string
          year: number | null
          division: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          institution_id: string
          year?: number | null
          division?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          institution_id?: string
          year?: number | null
          division?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          first_name: string
          last_name: string
          dni: string | null
          birth_date: string | null
          institution_id: string
          course_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          dni?: string | null
          birth_date?: string | null
          institution_id: string
          course_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          dni?: string | null
          birth_date?: string | null
          institution_id?: string
          course_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
