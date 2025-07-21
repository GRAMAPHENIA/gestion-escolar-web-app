/**
 * Core TypeScript interfaces for Institution management
 */

export interface Institution {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields for statistics
  courses_count?: number;
  students_count?: number;
  professors_count?: number;
}

export interface InstitutionFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface InstitutionFilters {
  search: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  sortBy: 'name' | 'created_at' | 'courses_count';
  sortOrder: 'asc' | 'desc';
}

export interface InstitutionStats {
  courses_count: number;
  students_count: number;
  professors_count: number;
  recent_activity: InstitutionActivity[];
}

export interface InstitutionActivity {
  id: string;
  type: 'course_created' | 'student_enrolled' | 'professor_assigned' | 'institution_updated';
  description: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface InstitutionListResponse {
  institutions: Institution[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface InstitutionExportOptions {
  format: 'excel' | 'pdf';
  includeStats: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  filters?: Partial<InstitutionFilters>;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}