/**
 * Tipos TypeScript para las estadísticas de instituciones
 */

export interface InstitutionStats {
  courses_count: number
  students_count: number
  professors_count: number
  subjects_count: number
  grades_count: number
  average_grade: number
  last_updated: string
}

export interface CourseDistribution {
  course_id: string
  course_name: string
  students_count: number
}

export interface RecentActivity {
  id: string
  type: 'grade_added' | 'student_enrolled' | 'course_created'
  description: string
  grade?: number
  observation?: string
  student_name?: string
  subject_name?: string
  professor_name?: string
  date: string
  created_at: string
}

export interface MonthlyTrend {
  month: string // YYYY-MM format
  average_grade: number
  grades_count: number
}

export interface InstitutionStatsResponse {
  institution: {
    id: string
    name: string
  }
  statistics: InstitutionStats
  course_distribution: CourseDistribution[]
  recent_activity: RecentActivity[]
  monthly_trends: MonthlyTrend[]
}

export interface InstitutionWithStats {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  created_at: string
  updated_at?: string
  courses_count: number
  students_count: number
  professors_count: number
  subjects_count?: number
  courses?: Array<{
    id: string
    name: string
    description?: string
    year?: number
    students_count: number
  }>
}