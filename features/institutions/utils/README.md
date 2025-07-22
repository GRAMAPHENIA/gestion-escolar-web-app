# Utilidades de Exportación de Instituciones

Este módulo proporciona funcionalidades robustas para exportar datos de instituciones a diferentes formatos (Excel y PDF) con manejo completo de errores y configuraciones personalizables.

## Características Principales

- ✅ **Exportación a Excel (XLSX)** con formato profesional
- ✅ **Exportación a PDF** con diseño optimizado
- ✅ **Manejo robusto de errores** con códigos específicos
- ✅ **Validación de datos** antes de la exportación
- ✅ **Configuración personalizable** para límites y timeouts
- ✅ **Soporte para estadísticas** opcionales
- ✅ **Filtrado por rangos de fechas**
- ✅ **Fallback a CSV** si falla la exportación XLSX
- ✅ **Tests unitarios** completos

## Archivos del Módulo

### Archivos Principales
- `institution-export.ts` - Funciones principales de exportación
- `excel-export.ts` - Utilidades específicas para Excel/XLSX
- `export-example.ts` - Ejemplos de uso
- `__tests__/institution-export.test.ts` - Tests unitarios

### Tipos
- `../types/institution.ts` - Definiciones de tipos TypeScript

## Uso Básico

### Importar las Funciones

```typescript
import { 
  exportInstitutions, 
  validateExportOptions, 
  getExportSummary 
} from './institution-export';
import { Institution, InstitutionExportOptions } from '../types';
```

### Exportar a Excel

```typescript
const options: InstitutionExportOptions = {
  format: 'excel',
  includeStats: true,
  dateRange: {
    from: new Date('2024-01-01'),
    to: new Date('2024-12-31')
  }
};

try {
  await exportInstitutions(institutions, options, stats);
  console.log('✅ Exportación completada');
} catch (error) {
  console.error('❌ Error:', error.message);
}
```

### Exportar a PDF

```typescript
const options: InstitutionExportOptions = {
  format: 'pdf',
  includeStats: false
};

await exportInstitutions(institutions, options);
```

## Configuración Avanzada

### Configuración de Excel

```typescript
const excelConfig = {
  maxRows: 10000,        // Máximo número de filas
  maxFileSize: 50,       // Tamaño máximo en MB
  timeout: 30000         // Timeout en milisegundos
};

await exportInstitutions(institutions, options, stats, excelConfig);
```

### Configuración de PDF

```typescript
const pdfConfig = {
  maxRows: 5000,
  maxFileSize: 25,
  timeout: 45000,
  pageFormat: 'a4',
  orientation: 'landscape',
  includeHeader: true,
  includeFooter: true
};

await exportInstitutions(institutions, options, stats, undefined, pdfConfig);
```

## Validación y Manejo de Errores

### Validar Opciones

```typescript
const errors = validateExportOptions(options);
if (errors.length > 0) {
  console.error('Errores de validación:', errors);
  return;
}
```

### Tipos de Error

Los errores de exportación incluyen un código específico:

- `DATA_ERROR` - Problemas con los datos de entrada
- `GENERATION_ERROR` - Errores durante la generación del archivo
- `DOWNLOAD_ERROR` - Problemas durante la descarga
- `PERMISSION_ERROR` - Problemas de permisos del navegador

```typescript
try {
  await exportInstitutions(institutions, options);
} catch (error) {
  if (error.code === 'DATA_ERROR') {
    // Manejar error de datos
  } else if (error.code === 'GENERATION_ERROR') {
    // Manejar error de generación
  }
}
```

## Obtener Resumen de Exportación

```typescript
const summary = getExportSummary(institutions, options);
console.log(`Se exportarán ${summary.totalInstitutions} instituciones`);
console.log(`Formato: ${summary.format}`);
console.log(`Tamaño estimado: ${summary.estimatedSize}`);
```

## Estructura de Datos

### Institution

```typescript
interface Institution {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}
```

### InstitutionStats (Opcional)

```typescript
interface InstitutionStats {
  courses_count: number;
  students_count: number;
  professors_count: number;
  recent_activity: InstitutionActivity[];
}
```

### InstitutionExportOptions

```typescript
interface InstitutionExportOptions {
  format: 'excel' | 'pdf';
  includeStats: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  filters?: Partial<InstitutionFilters>;
}
```

## Características del Archivo Excel

- **Múltiples hojas**: Datos principales + hoja de estadísticas (opcional)
- **Formato profesional**: Encabezados en negrita, anchos de columna optimizados
- **Metadatos**: Información del reporte, fechas de generación, filtros aplicados
- **Manejo de errores**: Fallback automático a CSV si falla XLSX

## Características del Archivo PDF

- **Diseño profesional**: Encabezados, pies de página, numeración
- **Orientación adaptable**: Portrait o Landscape según contenido
- **Paginación inteligente**: Repetición de encabezados en páginas nuevas
- **Información contextual**: Fechas, filtros, totales

## Ejecutar Tests

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar solo tests de exportación
pnpm vitest features/institutions/utils/__tests__/institution-export.test.ts --run
```

## Ejemplos Completos

Ver `export-example.ts` para ejemplos detallados de:
- Exportación básica a Excel y PDF
- Configuración personalizada
- Manejo de errores
- Validación de datos

## Limitaciones y Consideraciones

### Límites por Defecto
- **Excel**: 10,000 filas, 50MB, 30s timeout
- **PDF**: 5,000 filas, 25MB, 45s timeout

### Compatibilidad del Navegador
- Requiere soporte para `URL.createObjectURL()`
- Requiere soporte para descarga automática de archivos
- Funciona en todos los navegadores modernos

### Rendimiento
- Los archivos grandes pueden tomar tiempo en generarse
- Se recomienda mostrar indicadores de progreso al usuario
- Los timeouts son configurables según las necesidades

## Contribuir

Para añadir nuevas funcionalidades:

1. Añadir tests en `__tests__/institution-export.test.ts`
2. Implementar la funcionalidad
3. Actualizar la documentación
4. Ejecutar tests para verificar que todo funciona

## Soporte

Si encuentras problemas:

1. Verifica que los datos de entrada sean válidos
2. Revisa los mensajes de error específicos
3. Consulta los ejemplos en `export-example.ts`
4. Ejecuta los tests para verificar la funcionalidad base