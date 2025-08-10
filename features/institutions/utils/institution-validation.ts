import { z } from 'zod';

/**
 * Zod validation schemas for Institution management
 */

// Custom validation functions
const validatePhoneNumber = (phone: string) => {
  if (!phone || phone.trim() === '') return true;
  
  // Remove all spaces, dashes, and parentheses for validation
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it starts with + and has 10-15 digits, or just has 7-15 digits
  const phoneRegex = /^(\+?[1-9]\d{9,14}|\d{7,15})$/;
  return phoneRegex.test(cleanPhone);
};

const validateInstitutionName = (name: string) => {
  if (!name || name.trim().length < 2) return false;
  
  // Check for valid characters (letters, numbers, spaces, and common punctuation)
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\.\-_,&()]+$/;
  return nameRegex.test(name.trim());
};

// Base institution schema for form validation
export const institutionSchema = z.object({
  name: z.string()
    .min(1, 'El nombre de la institución es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .refine(validateInstitutionName, {
      message: 'El nombre contiene caracteres no válidos. Solo se permiten letras, números, espacios y signos de puntuación básicos'
    })
    .transform(val => val.trim()),
  
  address: z.string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .refine(val => !val || val.trim().length >= 5, {
      message: 'Si proporciona una dirección, debe tener al menos 5 caracteres'
    })
    .transform(val => val?.trim() || '')
    .optional()
    .or(z.literal('')),
    
  phone: z.string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .refine(validatePhoneNumber, {
      message: 'Formato de teléfono inválido. Ejemplos válidos: +1234567890, (123) 456-7890, 123-456-7890'
    })
    .transform(val => val?.trim() || '')
    .optional()
    .or(z.literal('')),
    
  email: z.string()
    .max(100, 'El email no puede exceder 100 caracteres')
    .refine(val => !val || z.string().email().safeParse(val).success, {
      message: 'Formato de email inválido. Ejemplo: contacto@institucion.edu'
    })
    .transform(val => val?.trim().toLowerCase() || '')
    .optional()
    .or(z.literal('')),
});

// Schema for creating a new institution
export const createInstitutionSchema = institutionSchema;

// Schema for updating an existing institution
export const updateInstitutionSchema = institutionSchema.partial();

// Schema for institution filters
export const institutionFiltersSchema = z.object({
  search: z.string().optional().default(''),
  dateRange: z.object({
    from: z.date().nullable().optional(),
    to: z.date().nullable().optional(),
  }).optional(),
  sortBy: z.enum(['name', 'created_at', 'courses_count']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
});

// Schema for export options
export const institutionExportSchema = z.object({
  format: z.enum(['excel', 'pdf']),
  includeStats: z.boolean().default(false),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  filters: institutionFiltersSchema.partial().optional(),
});

// Schema for API route parameters
export const institutionIdSchema = z.object({
  id: z.string().uuid('ID de institución inválido'),
});

// Schema for bulk operations
export const bulkInstitutionSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'Debe seleccionar al menos una institución'),
  action: z.enum(['delete', 'export']),
});

// Type inference from schemas
export type InstitutionFormData = z.infer<typeof institutionSchema>;
export type CreateInstitutionData = z.infer<typeof createInstitutionSchema>;
export type UpdateInstitutionData = z.infer<typeof updateInstitutionSchema>;
export type InstitutionFiltersData = z.infer<typeof institutionFiltersSchema>;
export type InstitutionExportData = z.infer<typeof institutionExportSchema>;
export type InstitutionIdData = z.infer<typeof institutionIdSchema>;
export type BulkInstitutionData = z.infer<typeof bulkInstitutionSchema>;

// Server-side validation schema with additional security checks
export const serverInstitutionSchema = institutionSchema.extend({
  name: institutionSchema.shape.name
    .refine(async (name) => {
      // This would be used in server-side validation to check for duplicates
      // The actual duplicate check should be done in the API route
      return true;
    }, {
      message: 'Ya existe una institución con este nombre'
    })
});

// Validation helper functions
export const validateInstitutionForm = (data: unknown) => {
  return institutionSchema.safeParse(data);
};

export const validateInstitutionFilters = (data: unknown) => {
  return institutionFiltersSchema.safeParse(data);
};

export const validateInstitutionId = (id: unknown) => {
  return z.string().uuid().safeParse(id);
};

// Advanced validation functions
export const validateInstitutionFormWithContext = (data: unknown, context?: {
  isEdit?: boolean;
  existingNames?: string[];
  currentId?: string;
}) => {
  const baseValidation = institutionSchema.safeParse(data);
  
  if (!baseValidation.success) {
    return baseValidation;
  }

  const validatedData = baseValidation.data;
  const errors: Record<string, string> = {};

  // Check for duplicate names if context is provided
  if (context?.existingNames && validatedData.name) {
    const isDuplicate = context.existingNames.some(name => 
      name.toLowerCase() === validatedData.name.toLowerCase()
    );
    
    if (isDuplicate) {
      errors.name = 'Ya existe una institución con este nombre';
    }
  }

  // Additional contextual validations
  if (validatedData.email && validatedData.phone) {
    // If both email and phone are provided, ensure at least one is valid
    const emailValid = z.string().email().safeParse(validatedData.email).success;
    const phoneValid = validatePhoneNumber(validatedData.phone);
    
    if (!emailValid && !phoneValid) {
      errors.email = 'Debe proporcionar al menos un método de contacto válido';
      errors.phone = 'Debe proporcionar al menos un método de contacto válido';
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false as const,
      error: {
        issues: Object.entries(errors).map(([field, message]) => ({
          path: [field],
          message,
          code: 'custom' as const,
        })),
        name: 'ZodError' as const,
      },
    };
  }

  return baseValidation;
};

// Field-specific validation functions for real-time validation
export const validateField = {
  name: (value: string) => {
    const result = z.string()
      .min(1, 'El nombre es obligatorio')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .refine(validateInstitutionName, {
        message: 'El nombre contiene caracteres no válidos'
      })
      .safeParse(value);
    
    return result.success ? null : result.error.issues[0].message;
  },
  
  address: (value: string) => {
    if (!value || value.trim() === '') return null;
    
    const result = z.string()
      .max(200, 'La dirección no puede exceder 200 caracteres')
      .min(5, 'La dirección debe tener al menos 5 caracteres')
      .safeParse(value);
    
    return result.success ? null : result.error.issues[0].message;
  },
  
  phone: (value: string) => {
    if (!value || value.trim() === '') return null;
    
    if (!validatePhoneNumber(value)) {
      return 'Formato de teléfono inválido. Ejemplos: +1234567890, (123) 456-7890';
    }
    
    if (value.length > 20) {
      return 'El teléfono no puede exceder 20 caracteres';
    }
    
    return null;
  },
  
  email: (value: string) => {
    if (!value || value.trim() === '') return null;
    
    const result = z.string()
      .email('Formato de email inválido')
      .max(100, 'El email no puede exceder 100 caracteres')
      .safeParse(value);
    
    return result.success ? null : result.error.issues[0].message;
  },
};

// Custom validation messages in Spanish
export const validationMessages = {
  required: 'Este campo es obligatorio',
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `No puede exceder ${max} caracteres`,
  invalidEmail: 'Formato de email inválido. Ejemplo: contacto@institucion.edu',
  invalidPhone: 'Formato de teléfono inválido. Ejemplos: +1234567890, (123) 456-7890',
  invalidUuid: 'ID inválido',
  duplicateName: 'Ya existe una institución con este nombre',
  invalidCharacters: 'Contiene caracteres no válidos',
  contactRequired: 'Debe proporcionar al menos un método de contacto válido',
  serverError: 'Error en el servidor. Por favor, inténtelo de nuevo',
  networkError: 'Error de conexión. Verifique su conexión a internet',
  unauthorized: 'No tiene permisos para realizar esta acción',
  notFound: 'La institución no fue encontrada',
  conflict: 'Ya existe una institución con estos datos',
} as const;

// Error code mapping for better user experience
export const mapErrorCodeToMessage = (code: string, field?: string): string => {
  const errorMap: Record<string, string> = {
    'too_small': field === 'name' ? 'El nombre es muy corto' : 'El valor es muy corto',
    'too_big': field === 'name' ? 'El nombre es muy largo' : 'El valor es muy largo',
    'invalid_string': field === 'email' ? validationMessages.invalidEmail : 'Formato inválido',
    'custom': 'Error de validación personalizado',
  };
  
  return errorMap[code] || 'Error de validación';
};