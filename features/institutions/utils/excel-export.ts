import { utils, write, WorkBook, WorkSheet } from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Institution, InstitutionExportOptions, InstitutionStats } from '../types';

// Tipos para manejo de errores
export interface ExportError {
  code: 'GENERATION_ERROR' | 'DOWNLOAD_ERROR' | 'DATA_ERROR' | 'PERMISSION_ERROR';
  message: string;
  details?: any;
}

// Configuración de exportación
export interface ExcelExportConfig {
  maxRows: number;
  maxFileSize: number; // en MB
  timeout: number; // en ms
}

/**
 * Genera y descarga un archivo Excel (XLSX) con los datos de instituciones
 */
export async function exportToXLSX(
  institutions: Institution[],
  options: InstitutionExportOptions,
  stats?: Record<string, InstitutionStats>,
  config: ExcelExportConfig = {
    maxRows: 10000,
    maxFileSize: 50, // 50MB
    timeout: 30000 // 30 segundos
  }
): Promise<void> {
  // Validaciones iniciales
  if (!institutions || institutions.length === 0) {
    throw createExportError('DATA_ERROR', 'No hay instituciones para exportar');
  }

  if (institutions.length > config.maxRows) {
    throw createExportError('DATA_ERROR', `Demasiadas instituciones para exportar. Máximo permitido: ${config.maxRows}`);
  }

  // Configurar timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(createExportError('GENERATION_ERROR', 'Tiempo de espera agotado durante la exportación'));
    }, config.timeout);
  });

  try {
    // Ejecutar la exportación con timeout
    await Promise.race([
      performExcelExport(institutions, options, stats, config),
      timeoutPromise
    ]);
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error; // Re-lanzar errores de exportación personalizados
    }
    
    console.error('Error inesperado al exportar a Excel:', error);
    throw createExportError('GENERATION_ERROR', 'Error inesperado durante la exportación', error);
  }
}

/**
 * Realiza la exportación Excel real
 */
async function performExcelExport(
  institutions: Institution[],
  options: InstitutionExportOptions,
  stats?: Record<string, InstitutionStats>,
  config?: ExcelExportConfig
): Promise<void> {
  let wb: WorkBook;
  let objectUrl: string | null = null;

  try {
    // Crear un libro de trabajo
    wb = utils.book_new();
    
    // Preparar los datos para la hoja principal
    const wsData = prepareInstitutionsData(institutions, options, stats);
    
    // Crear la hoja de trabajo
    const ws = utils.aoa_to_sheet(wsData);
    
    // Aplicar estilos a la hoja
    applyStyles(ws, wsData.length);
    
    // Añadir la hoja al libro
    utils.book_append_sheet(wb, ws, 'Instituciones');
    
    // Si se incluyen estadísticas, crear una hoja adicional
    if (options.includeStats && stats) {
      try {
        const statsData = prepareStatsData(institutions, stats);
        const statsWs = utils.aoa_to_sheet(statsData);
        applyStyles(statsWs, statsData.length);
        utils.book_append_sheet(wb, statsWs, 'Estadísticas');
      } catch (statsError) {
        console.warn('Error al generar hoja de estadísticas, continuando sin ella:', statsError);
      }
    }
    
    // Generar el archivo
    const fileName = generateFileName(options);
    
    // Convertir a buffer
    const buffer = write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Verificar tamaño del archivo
    const fileSizeInMB = buffer.byteLength / (1024 * 1024);
    if (config && fileSizeInMB > config.maxFileSize) {
      throw createExportError('GENERATION_ERROR', `El archivo es demasiado grande (${fileSizeInMB.toFixed(2)}MB). Máximo permitido: ${config.maxFileSize}MB`);
    }
    
    // Crear blob
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Verificar soporte del navegador
    if (!window.URL || !window.URL.createObjectURL) {
      throw createExportError('PERMISSION_ERROR', 'Su navegador no soporta la descarga de archivos');
    }
    
    // Crear URL del objeto
    objectUrl = URL.createObjectURL(blob);
    
    // Crear y configurar el enlace de descarga
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.style.display = 'none';
    
    // Añadir al DOM, hacer clic y limpiar
    document.body.appendChild(link);
    
    // Verificar si el enlace se creó correctamente
    if (!link.href) {
      throw createExportError('DOWNLOAD_ERROR', 'Error al crear el enlace de descarga');
    }
    
    link.click();
    
    // Limpiar el DOM
    document.body.removeChild(link);
    
  } catch (error) {
    // Limpiar recursos en caso de error
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
    
    if (error instanceof Error && 'code' in error) {
      throw error; // Re-lanzar errores de exportación personalizados
    }
    
    // Manejar errores específicos de la librería XLSX
    if (error instanceof Error) {
      if (error.message.includes('Invalid file')) {
        throw createExportError('GENERATION_ERROR', 'Error al generar el archivo Excel: formato inválido');
      }
      if (error.message.includes('out of memory')) {
        throw createExportError('GENERATION_ERROR', 'No hay suficiente memoria para generar el archivo');
      }
    }
    
    throw createExportError('GENERATION_ERROR', 'Error al generar el archivo Excel', error);
  } finally {
    // Limpiar URL del objeto después de un tiempo
    if (objectUrl) {
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl!);
      }, 1000);
    }
  }
}

/**
 * Crea un error de exportación tipado
 */
function createExportError(code: ExportError['code'], message: string, details?: any): ExportError & Error {
  const error = new Error(message) as ExportError & Error;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Prepara los datos de instituciones para la exportación
 */
function prepareInstitutionsData(
  institutions: Institution[],
  options: InstitutionExportOptions,
  stats?: Record<string, InstitutionStats>
): any[][] {
  try {
    // Validar datos de entrada
    if (!institutions || !Array.isArray(institutions)) {
      throw new Error('Datos de instituciones inválidos');
    }

    // Encabezados
    const headers = [
      'Nombre',
      'Dirección',
      'Teléfono',
      'Email',
      'Fecha de Creación',
      'Última Actualización'
    ];
    
    if (options.includeStats) {
      headers.push('Cursos', 'Estudiantes', 'Profesores');
    }
    
    // Crear filas de datos con manejo de errores
    const rows = institutions.map((institution, index) => {
      try {
        const institutionStats = stats?.[institution.id];
        
        const row = [
          institution.name || `Institución ${index + 1}`,
          institution.address || '',
          institution.phone || '',
          institution.email || '',
          institution.created_at ? format(new Date(institution.created_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A',
          institution.updated_at ? format(new Date(institution.updated_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'
        ];
        
        if (options.includeStats) {
          if (institutionStats) {
            row.push(
              institutionStats.courses_count || 0,
              institutionStats.students_count || 0,
              institutionStats.professors_count || 0
            );
          } else {
            row.push(0, 0, 0);
          }
        }
        
        return row;
      } catch (rowError) {
        console.warn(`Error procesando institución ${index}:`, rowError);
        // Retornar fila con datos básicos en caso de error
        const fallbackRow = [
          institution.name || `Institución ${index + 1}`,
          'Error al procesar',
          '',
          '',
          'N/A',
          'N/A'
        ];
        
        if (options.includeStats) {
          fallbackRow.push(0, 0, 0);
        }
        
        return fallbackRow;
      }
    });
    
    // Añadir información de metadatos del reporte
    const metaRows = [];
    metaRows.push(['Reporte de Instituciones']);
    metaRows.push(['Generado el:', format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })]);
    metaRows.push(['Total de instituciones:', institutions.length.toString()]);
    
    // Añadir información de filtros si existen
    if (options.dateRange?.from || options.dateRange?.to) {
      let dateRangeText = 'Rango de fechas:';
      try {
        if (options.dateRange.from && options.dateRange.to) {
          dateRangeText += ` ${format(options.dateRange.from, 'dd/MM/yyyy', { locale: es })} - ${format(options.dateRange.to, 'dd/MM/yyyy', { locale: es })}`;
        } else if (options.dateRange.from) {
          dateRangeText += ` Desde ${format(options.dateRange.from, 'dd/MM/yyyy', { locale: es })}`;
        } else if (options.dateRange.to) {
          dateRangeText += ` Hasta ${format(options.dateRange.to, 'dd/MM/yyyy', { locale: es })}`;
        }
      } catch (dateError) {
        console.warn('Error formateando fechas:', dateError);
        dateRangeText += ' Error en formato de fecha';
      }
      metaRows.push([dateRangeText]);
    }
    
    if (options.includeStats) {
      metaRows.push(['Incluye estadísticas:', 'Cursos, Estudiantes y Profesores']);
    }
    
    metaRows.push([]);  // Fila vacía para separación
    
    // Combinar todo
    return [...metaRows, headers, ...rows];
    
  } catch (error) {
    console.error('Error preparando datos para Excel:', error);
    // Retornar estructura mínima en caso de error
    return [
      ['Error al preparar datos'],
      ['Se produjo un error al procesar la información'],
      [],
      ['Nombre', 'Error'],
      ['Error al procesar datos', 'Contacte al administrador']
    ];
  }
}

/**
 * Prepara los datos de estadísticas para una hoja separada
 */
function prepareStatsData(
  institutions: Institution[],
  stats: Record<string, InstitutionStats>
): any[][] {
  try {
    // Validar datos de entrada
    if (!institutions || !Array.isArray(institutions)) {
      throw new Error('Datos de instituciones inválidos para estadísticas');
    }

    if (!stats || typeof stats !== 'object') {
      console.warn('No hay datos de estadísticas disponibles');
      // Retornar estructura básica sin estadísticas
      return [
        ['Estadísticas de Instituciones'],
        ['No hay datos de estadísticas disponibles'],
        [],
        ['Nombre', 'Estado'],
        ...institutions.map(inst => [inst.name, 'Sin estadísticas'])
      ];
    }

    // Encabezados
    const headers = [
      'ID Institución',
      'Nombre',
      'Cursos',
      'Estudiantes',
      'Profesores',
      'Ratio Estudiantes/Curso',
      'Ratio Profesores/Curso',
      'Total Actividades'
    ];
    
    // Crear filas de datos con manejo de errores
    const rows = institutions.map((institution, index) => {
      try {
        const institutionStats = stats[institution.id];
        
        if (!institutionStats) {
          return [
            institution.id || `inst_${index}`,
            institution.name || `Institución ${index + 1}`,
            0,
            0,
            0,
            '0.00',
            '0.00',
            0
          ];
        }
        
        // Calcular ratios con validación
        const coursesCount = institutionStats.courses_count || 0;
        const studentsCount = institutionStats.students_count || 0;
        const professorsCount = institutionStats.professors_count || 0;
        const activitiesCount = institutionStats.recent_activity?.length || 0;
        
        const studentsPerCourse = coursesCount > 0
          ? (studentsCount / coursesCount).toFixed(2)
          : '0.00';
          
        const professorsPerCourse = coursesCount > 0
          ? (professorsCount / coursesCount).toFixed(2)
          : '0.00';
        
        return [
          institution.id || `inst_${index}`,
          institution.name || `Institución ${index + 1}`,
          coursesCount,
          studentsCount,
          professorsCount,
          studentsPerCourse,
          professorsPerCourse,
          activitiesCount
        ];
      } catch (rowError) {
        console.warn(`Error procesando estadísticas para institución ${index}:`, rowError);
        // Retornar fila con datos básicos en caso de error
        return [
          institution.id || `inst_${index}`,
          institution.name || `Institución ${index + 1}`,
          'Error',
          'Error',
          'Error',
          'Error',
          'Error',
          'Error'
        ];
      }
    });
    
    // Calcular totales
    const totals = institutions.reduce((acc, institution) => {
      const institutionStats = stats[institution.id];
      if (institutionStats) {
        acc.totalCourses += institutionStats.courses_count || 0;
        acc.totalStudents += institutionStats.students_count || 0;
        acc.totalProfessors += institutionStats.professors_count || 0;
        acc.totalActivities += institutionStats.recent_activity?.length || 0;
      }
      return acc;
    }, { totalCourses: 0, totalStudents: 0, totalProfessors: 0, totalActivities: 0 });
    
    // Añadir información de resumen
    const metaRows = [];
    metaRows.push(['Estadísticas de Instituciones']);
    metaRows.push(['Generado el:', format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })]);
    metaRows.push(['Total de instituciones:', institutions.length.toString()]);
    metaRows.push([]);  // Fila vacía
    
    // Añadir fila de totales al final
    const totalRow = [
      'TOTALES',
      `${institutions.length} instituciones`,
      totals.totalCourses,
      totals.totalStudents,
      totals.totalProfessors,
      totals.totalCourses > 0 ? (totals.totalStudents / totals.totalCourses).toFixed(2) : '0.00',
      totals.totalCourses > 0 ? (totals.totalProfessors / totals.totalCourses).toFixed(2) : '0.00',
      totals.totalActivities
    ];
    
    // Combinar todo
    return [...metaRows, headers, ...rows, [], totalRow];
    
  } catch (error) {
    console.error('Error preparando datos de estadísticas:', error);
    // Retornar estructura mínima en caso de error
    return [
      ['Error en Estadísticas'],
      ['Se produjo un error al procesar las estadísticas'],
      [],
      ['Error', 'Descripción'],
      ['Error al procesar', 'Contacte al administrador']
    ];
  }
}

/**
 * Aplica estilos básicos a la hoja de trabajo
 */
function applyStyles(ws: WorkSheet, totalRows: number): void {
  try {
    // Configurar anchos de columna
    ws['!cols'] = [
      { width: 30 },  // Nombre
      { width: 30 },  // Dirección
      { width: 15 },  // Teléfono
      { width: 25 },  // Email
      { width: 18 },  // Fecha Creación
      { width: 18 },  // Última Actualización
      { width: 10 },  // Cursos
      { width: 12 },  // Estudiantes
      { width: 12 },  // Profesores
    ];

    // Configurar rango de datos
    if (totalRows > 0) {
      const range = utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 8, r: totalRows - 1 } });
      ws['!ref'] = range;
    }

    // Aplicar formato a las celdas de encabezado (si existen)
    const headerRow = 5; // Fila donde empiezan los encabezados después de la metadata
    for (let col = 0; col < 9; col++) {
      const cellAddress = utils.encode_cell({ r: headerRow, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "EEEEEE" } },
          alignment: { horizontal: "center" }
        };
      }
    }
  } catch (error) {
    console.warn('Error al aplicar estilos a la hoja Excel:', error);
    // Continuar sin estilos si hay error
  }
}

/**
 * Genera el nombre del archivo basado en las opciones
 */
function generateFileName(options: InstitutionExportOptions): string {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm', { locale: es });
  
  let fileName = `instituciones_${timestamp}`;
  
  // Agregar información de filtros si existen
  if (options.dateRange?.from) {
    const fromDate = format(options.dateRange.from, 'yyyy-MM-dd', { locale: es });
    fileName += `_desde_${fromDate}`;
  }
  
  if (options.dateRange?.to) {
    const toDate = format(options.dateRange.to, 'yyyy-MM-dd', { locale: es });
    fileName += `_hasta_${toDate}`;
  }
  
  if (options.includeStats) {
    fileName += '_con_estadisticas';
  }
  
  return `${fileName}.xlsx`;
}