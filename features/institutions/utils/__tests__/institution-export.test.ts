/**
 * Tests básicos para las utilidades de exportación de instituciones
 */

import { describe, it, expect } from 'vitest';
import { Institution, InstitutionExportOptions, InstitutionStats } from '../../types/institution';
import { validateExportOptions, getExportSummary } from '../institution-export';

// Mock data para pruebas
const mockInstitutions: Institution[] = [
  {
    id: '1',
    name: 'Instituto Tecnológico',
    address: 'Calle Principal 123',
    phone: '+1234567890',
    email: 'info@instituto.edu',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
  },
  {
    id: '2',
    name: 'Universidad Nacional',
    address: 'Avenida Central 456',
    phone: '+0987654321',
    email: 'contacto@universidad.edu',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-10T14:00:00Z',
  }
];

const mockStats: Record<string, InstitutionStats> = {
  '1': {
    courses_count: 5,
    students_count: 150,
    professors_count: 12,
    recent_activity: []
  },
  '2': {
    courses_count: 8,
    students_count: 300,
    professors_count: 25,
    recent_activity: []
  }
};

describe('Utilidades de Exportación de Instituciones', () => {
  describe('validateExportOptions', () => {
    it('debería validar opciones correctas', () => {
      const options: InstitutionExportOptions = {
        format: 'excel',
        includeStats: true
      };
      
      const errors = validateExportOptions(options);
      expect(errors).toHaveLength(0);
    });

    it('debería detectar formato inválido', () => {
      const options = {
        format: 'invalid',
        includeStats: false
      } as any;
      
      const errors = validateExportOptions(options);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('válido'))).toBe(true);
    });

    it('debería validar rangos de fechas', () => {
      const options: InstitutionExportOptions = {
        format: 'pdf',
        includeStats: false,
        dateRange: {
          from: new Date('2024-02-01'),
          to: new Date('2024-01-01') // Fecha de fin anterior a fecha de inicio
        }
      };
      
      const errors = validateExportOptions(options);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('fecha de inicio'))).toBe(true);
    });
  });

  describe('getExportSummary', () => {
    it('debería generar resumen correcto para Excel', () => {
      const options: InstitutionExportOptions = {
        format: 'excel',
        includeStats: true
      };
      
      const summary = getExportSummary(mockInstitutions, options);
      
      expect(summary.totalInstitutions).toBe(2);
      expect(summary.format).toBe('Excel (.csv)');
      expect(summary.includeStats).toBe(true);
      expect(summary.estimatedSize).toBeDefined();
    });

    it('debería generar resumen correcto para PDF', () => {
      const options: InstitutionExportOptions = {
        format: 'pdf',
        includeStats: false
      };
      
      const summary = getExportSummary(mockInstitutions, options);
      
      expect(summary.totalInstitutions).toBe(2);
      expect(summary.format).toBe('PDF (.pdf)');
      expect(summary.includeStats).toBe(false);
    });

    it('debería incluir información de rango de fechas', () => {
      const options: InstitutionExportOptions = {
        format: 'excel',
        includeStats: false,
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-12-31')
        }
      };
      
      const summary = getExportSummary(mockInstitutions, options);
      
      expect(summary.dateRange).toBeDefined();
      expect(summary.dateRange).toContain('2024');
      expect(summary.dateRange).toContain(' - ');
    });
  });
});