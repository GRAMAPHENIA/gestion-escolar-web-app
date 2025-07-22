/**
 * Ejemplo de uso de las utilidades de exportación de instituciones
 * Este archivo muestra cómo usar las funciones de exportación en una aplicación real
 */

import { Institution, InstitutionExportOptions, InstitutionStats } from '../types';
import { exportInstitutions, validateExportOptions, getExportSummary } from './institution-export';

// Datos de ejemplo
const sampleInstitutions: Institution[] = [
  {
    id: '1',
    name: 'Instituto Tecnológico Superior',
    address: 'Av. Tecnología 123, Ciudad Tech',
    phone: '+1-555-0123',
    email: 'info@its.edu',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
  },
  {
    id: '2',
    name: 'Universidad Nacional de Ciencias',
    address: 'Calle Universidad 456, Campus Norte',
    phone: '+1-555-0456',
    email: 'contacto@unc.edu',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-10T14:00:00Z',
  },
  {
    id: '3',
    name: 'Colegio San Martín',
    address: 'Plaza Central 789, Barrio Educativo',
    phone: '+1-555-0789',
    email: 'admin@sanmartin.edu',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-15T16:45:00Z',
  }
];

const sampleStats: Record<string, InstitutionStats> = {
  '1': {
    courses_count: 12,
    students_count: 450,
    professors_count: 28,
    recent_activity: [
      {
        id: 'act1',
        type: 'course_created',
        description: 'Nuevo curso de Programación Avanzada',
        created_at: '2024-01-20T10:00:00Z'
      }
    ]
  },
  '2': {
    courses_count: 25,
    students_count: 800,
    professors_count: 45,
    recent_activity: [
      {
        id: 'act2',
        type: 'student_enrolled',
        description: 'Nuevo estudiante inscrito en Matemáticas',
        created_at: '2024-02-05T14:30:00Z'
      }
    ]
  },
  '3': {
    courses_count: 8,
    students_count: 200,
    professors_count: 15,
    recent_activity: []
  }
};

/**
 * Ejemplo 1: Exportar a Excel con estadísticas
 */
export async function exportToExcelWithStats() {
  const options: InstitutionExportOptions = {
    format: 'excel',
    includeStats: true,
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-12-31')
    }
  };

  // Validar opciones antes de exportar
  const validationErrors = validateExportOptions(options);
  if (validationErrors.length > 0) {
    console.error('Errores de validación:', validationErrors);
    return;
  }

  // Obtener resumen de la exportación
  const summary = getExportSummary(sampleInstitutions, options);
  console.log('Resumen de exportación:', summary);

  try {
    await exportInstitutions(sampleInstitutions, options, sampleStats);
    console.log('✅ Exportación a Excel completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la exportación a Excel:', error);
  }
}

/**
 * Ejemplo 2: Exportar a PDF sin estadísticas
 */
export async function exportToPDFBasic() {
  const options: InstitutionExportOptions = {
    format: 'pdf',
    includeStats: false
  };

  // Validar opciones
  const validationErrors = validateExportOptions(options);
  if (validationErrors.length > 0) {
    console.error('Errores de validación:', validationErrors);
    return;
  }

  try {
    await exportInstitutions(sampleInstitutions, options);
    console.log('✅ Exportación a PDF completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la exportación a PDF:', error);
  }
}

/**
 * Ejemplo 3: Exportar con configuración personalizada
 */
export async function exportWithCustomConfig() {
  const options: InstitutionExportOptions = {
    format: 'excel',
    includeStats: true,
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-06-30')
    }
  };

  // Configuración personalizada para Excel
  const excelConfig = {
    maxRows: 5000,
    maxFileSize: 25, // 25MB
    timeout: 20000 // 20 segundos
  };

  // Configuración personalizada para PDF
  const pdfConfig = {
    maxRows: 2000,
    maxFileSize: 15, // 15MB
    timeout: 30000, // 30 segundos
    pageFormat: 'a4' as const,
    orientation: 'landscape' as const,
    includeHeader: true,
    includeFooter: true
  };

  try {
    await exportInstitutions(
      sampleInstitutions, 
      options, 
      sampleStats, 
      excelConfig, 
      pdfConfig
    );
    console.log('✅ Exportación con configuración personalizada completada');
  } catch (error) {
    console.error('❌ Error durante la exportación personalizada:', error);
  }
}

/**
 * Ejemplo 4: Manejo de errores y validaciones
 */
export async function demonstrateErrorHandling() {
  // Ejemplo con opciones inválidas
  const invalidOptions = {
    format: 'invalid-format',
    includeStats: true,
    dateRange: {
      from: new Date('2024-06-01'),
      to: new Date('2024-01-01') // Fecha de fin anterior a fecha de inicio
    }
  } as any;

  console.log('🔍 Validando opciones inválidas...');
  const errors = validateExportOptions(invalidOptions);
  
  if (errors.length > 0) {
    console.log('❌ Errores encontrados:');
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  // Ejemplo con datos vacíos
  try {
    const validOptions: InstitutionExportOptions = {
      format: 'excel',
      includeStats: false
    };

    await exportInstitutions([], validOptions); // Array vacío
  } catch (error) {
    console.log('❌ Error esperado con datos vacíos:', (error as Error).message);
  }
}

/**
 * Función principal para ejecutar todos los ejemplos
 */
export async function runAllExamples() {
  console.log('🚀 Iniciando ejemplos de exportación de instituciones...\n');

  console.log('📊 Ejemplo 1: Exportar a Excel con estadísticas');
  await exportToExcelWithStats();
  console.log('');

  console.log('📄 Ejemplo 2: Exportar a PDF básico');
  await exportToPDFBasic();
  console.log('');

  console.log('⚙️ Ejemplo 3: Exportar con configuración personalizada');
  await exportWithCustomConfig();
  console.log('');

  console.log('🛠️ Ejemplo 4: Demostración de manejo de errores');
  await demonstrateErrorHandling();
  console.log('');

  console.log('✅ Todos los ejemplos completados');
}

// Exportar funciones individuales para uso en componentes React
export {
  sampleInstitutions,
  sampleStats
};