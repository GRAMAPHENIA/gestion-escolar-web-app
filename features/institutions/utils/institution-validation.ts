import { z } from 'zod';

/**
 * Zod validation schemas for Institution management
 */

// Base institution schema for form validation
export const institutionSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  address: z.string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Formato de teléfono inválido')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('Formato de email inválido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .trim()
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

// Custom validation messages in Spanish
export const validationMessages = {
  required: 'Este campo es obligatorio',
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `No puede exceder ${max} caracteres`,
  invalidEmail: 'Formato de email inválido',
  invalidPhone: 'Formato de teléfono inválido',
  invalidUuid: 'ID inválido',
  duplicateName: 'Ya existe una institución con este nombre',
} as const;