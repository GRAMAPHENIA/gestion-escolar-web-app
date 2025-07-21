import { Institution, InstitutionFormData, InstitutionFilters, InstitutionListResponse } from '../types/institution';

/**
 * Utility functions for data transformation in Institution management
 */

// Transform form data to API payload
export const transformFormDataToPayload = (formData: InstitutionFormData) => {
  return {
    name: formData.name.trim(),
    address: formData.address?.trim() || null,
    phone: formData.phone?.trim() || null,
    email: formData.email?.trim() || null,
  };
};

// Transform API response to Institution object
export const transformApiResponseToInstitution = (apiData: any): Institution => {
  return {
    id: apiData.id,
    name: apiData.name,
    address: apiData.address,
    phone: apiData.phone,
    email: apiData.email,
    created_at: apiData.created_at,
    updated_at: apiData.updated_at,
    courses_count: apiData.courses_count || 0,
    students_count: apiData.students_count || 0,
    professors_count: apiData.professors_count || 0,
  };
};

// Transform Institution to form data for editing
export const transformInstitutionToFormData = (institution: Institution): InstitutionFormData => {
  return {
    name: institution.name,
    address: institution.address || '',
    phone: institution.phone || '',
    email: institution.email || '',
  };
};

// Transform filters to query parameters
export const transformFiltersToQueryParams = (filters: InstitutionFilters) => {
  const params = new URLSearchParams();
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  if (filters.dateRange.from) {
    params.append('dateFrom', filters.dateRange.from.toISOString());
  }
  
  if (filters.dateRange.to) {
    params.append('dateTo', filters.dateRange.to.toISOString());
  }
  
  params.append('sortBy', filters.sortBy);
  params.append('sortOrder', filters.sortOrder);
  
  return params.toString();
};

// Transform query parameters to filters
export const transformQueryParamsToFilters = (searchParams: URLSearchParams): Partial<InstitutionFilters> => {
  const filters: Partial<InstitutionFilters> = {};
  
  const search = searchParams.get('search');
  if (search) {
    filters.search = search;
  }
  
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  if (dateFrom || dateTo) {
    filters.dateRange = {
      from: dateFrom ? new Date(dateFrom) : null,
      to: dateTo ? new Date(dateTo) : null,
    };
  }
  
  const sortBy = searchParams.get('sortBy') as InstitutionFilters['sortBy'];
  if (sortBy && ['name', 'created_at', 'courses_count'].includes(sortBy)) {
    filters.sortBy = sortBy;
  }
  
  const sortOrder = searchParams.get('sortOrder') as InstitutionFilters['sortOrder'];
  if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
    filters.sortOrder = sortOrder;
  }
  
  return filters;
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format date and time for display
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format phone number for display
export const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return 'No especificado';
  
  // Basic phone formatting - can be enhanced based on requirements
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Generate institution display name with stats
export const getInstitutionDisplayName = (institution: Institution): string => {
  const stats = [];
  if (institution.courses_count) {
    stats.push(`${institution.courses_count} cursos`);
  }
  if (institution.students_count) {
    stats.push(`${institution.students_count} estudiantes`);
  }
  
  return stats.length > 0 ? `${institution.name} (${stats.join(', ')})` : institution.name;
};

// Sort institutions by different criteria
export const sortInstitutions = (
  institutions: Institution[],
  sortBy: InstitutionFilters['sortBy'],
  sortOrder: InstitutionFilters['sortOrder']
): Institution[] => {
  return [...institutions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'es-ES');
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'courses_count':
        comparison = (a.courses_count || 0) - (b.courses_count || 0);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

// Filter institutions by search term
export const filterInstitutionsBySearch = (
  institutions: Institution[],
  searchTerm: string
): Institution[] => {
  if (!searchTerm.trim()) return institutions;
  
  const term = searchTerm.toLowerCase().trim();
  return institutions.filter(institution =>
    institution.name.toLowerCase().includes(term) ||
    institution.address?.toLowerCase().includes(term) ||
    institution.email?.toLowerCase().includes(term)
  );
};

// Calculate pagination info
export const calculatePagination = (
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;
  const hasPrevious = page > 1;
  
  return {
    totalPages,
    hasMore,
    hasPrevious,
    startIndex: (page - 1) * limit + 1,
    endIndex: Math.min(page * limit, total),
  };
};

// Generate export filename
export const generateExportFilename = (
  format: 'excel' | 'pdf',
  filters?: Partial<InstitutionFilters>
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const hasFilters = filters?.search || filters?.dateRange?.from || filters?.dateRange?.to;
  const suffix = hasFilters ? '_filtrado' : '';
  
  return `instituciones_${timestamp}${suffix}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
};

// Sanitize data for export
export const sanitizeForExport = (institutions: Institution[]) => {
  return institutions.map(institution => ({
    'Nombre': institution.name,
    'Dirección': institution.address || 'No especificada',
    'Teléfono': formatPhoneNumber(institution.phone),
    'Email': institution.email || 'No especificado',
    'Cursos': institution.courses_count || 0,
    'Estudiantes': institution.students_count || 0,
    'Profesores': institution.professors_count || 0,
    'Fecha de Creación': formatDate(institution.created_at),
    'Última Actualización': formatDate(institution.updated_at),
  }));
};