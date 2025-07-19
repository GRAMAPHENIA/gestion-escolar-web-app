import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos actualizados basados en tu esquema
export type Database = {
  public: {
    Tables: {
      institutions: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          role: "admin" | "director" | "profesor"
          institution_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          role: "admin" | "director" | "profesor"
          institution_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          role?: "admin" | "director" | "profesor"
          institution_id?: string | null
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          description: string | null
          year: number | null
          institution_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          year?: number | null
          institution_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          year?: number | null
          institution_id?: string
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          full_name: string
          dni: string | null
          birth_date: string | null
          course_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          dni?: string | null
          birth_date?: string | null
          course_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          dni?: string | null
          birth_date?: string | null
          course_id?: string | null
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          course_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          course_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          course_id?: string
          created_at?: string
        }
      }
      grades: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          professor_id: string | null
          grade: number | null
          observation: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject_id: string
          professor_id?: string | null
          grade?: number | null
          observation?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string
          professor_id?: string | null
          grade?: number | null
          observation?: string | null
          date?: string
          created_at?: string
        }
      }
    }
  }
}
