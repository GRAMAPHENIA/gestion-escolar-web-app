import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Institution, InstitutionExportOptions, InstitutionStats } from '../types';
import { exportToXLSX, ExportError, ExcelExportConfig } from './excel-export';

// Configuración para exportación PDF
export interface PDFExportConfig {
  maxRows: number;
  maxFileSize: number; // en MB
  timeout: number; // en ms
  pageFormat: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  includeHeader: boolean;
  includeFooter: boolean;
}

// Tipos de error específicos para PDF
export type PDFExportError = ExportError;

// Tipos para los datos de exportación
export interface ExportData {
  institutions: Institution[];
  stats?: Record<string, InstitutionStats>;
  options: InstitutionExportOptions;
}

/**
 * Genera y descarga un archivo Excel con los datos de instituciones
 */
export async function exportToExcel(
  data: ExportData,
  config?: ExcelExportConfig
): Promise<void> {
  // Validaciones iniciales
  if (!data.institutions || data.institutions.length === 0) {
    throw createExcelError('DATA_ERROR', 'No hay instituciones para exportar');
  }

  try {
    // Usar la exportación XLSX para un formato Excel más profesional
    await exportToXLSX(data.institutions, data.options, data.stats, config);
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    
    // Si es un error de exportación personalizado, re-lanzarlo
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    
    // Fallback a CSV si falla la exportación XLSX
    try {
      console.warn('Intentando fallback a CSV debido a error en XLSX');
      await exportToCSVFallback(data);
    } catch (fallbackError) {
      console.error('Error en fallback CSV:', fallbackError);
      throw createExcelError('GENERATION_ERROR', 'Error al generar el archivo Excel y su alternativa CSV', {
        originalError: error,
        fallbackError
      });
    }
  }
}

/**
 * Exportación de fallback a CSV cuando falla XLSX
 */
async function exportToCSVFallback(data: ExportData): Promise<void> {
  try {
    // Crear el contenido CSV (Excel puede abrir archivos CSV)
    const csvContent = generateCSVContent(data);
    
    // Verificar que el contenido no esté vacío
    if (!csvContent || csvContent.trim().length === 0) {
      throw createExcelError('DATA_ERROR', 'No se pudo generar contenido CSV válido');
    }
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Verificar soporte del navegador
    if (!window.URL || !window.URL.createObjectURL) {
      throw createExcelError('PERMISSION_ERROR', 'Su navegador no soporta la descarga de archivos');
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    if (!link.download) {
      URL.revokeObjectURL(url);
      throw createExcelError('PERMISSION_ERROR', 'Su navegador no soporta la descarga automática de archivos');
    }
    
    link.setAttribute('href', url);
    link.setAttribute('download', generateFileName('excel', data.options));
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpiar URL después de un tiempo
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    throw createExcelError('DOWNLOAD_ERROR', 'Error al descargar el archivo CSV', error);
  }
}

/**
 * Crea un error de exportación Excel tipado
 */
function createExcelError(code: ExportError['code'], message: string, details?: any): ExportError & Error {
  const error = new Error(message) as ExportError & Error;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Genera y descarga un archivo PDF con los datos de instituciones
 */
export async function exportToPDF(
  data: ExportData,
  config: PDFExportConfig = {
    maxRows: 5000,
    maxFileSize: 25, // 25MB
    timeout: 45000, // 45 segundos
    pageFormat: 'a4',
    orientation: 'landscape',
    includeHeader: true,
    includeFooter: true
  }
): Promise<void> {
  // Validaciones iniciales
  if (!data.institutions || data.institutions.length === 0) {
    throw createPDFError('DATA_ERROR', 'No hay instituciones para exportar');
  }

  if (data.institutions.length > config.maxRows) {
    throw createPDFError('DATA_ERROR', `Demasiadas instituciones para exportar. Máximo permitido: ${config.maxRows}`);
  }

  // Configurar timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(createPDFError('GENERATION_ERROR', 'Tiempo de espera agotado durante la exportación PDF'));
    }, config.timeout);
  });

  try {
    // Ejecutar la exportación con timeout
    await Promise.race([
      performPDFExport(data, config),
      timeoutPromise
    ]);
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error; // Re-lanzar errores de exportación personalizados
    }
    
    console.error('Error inesperado al exportar a PDF:', error);
    throw createPDFError('GENERATION_ERROR', 'Error inesperado durante la exportación PDF', error);
  }
}

/**
 * Realiza la exportación PDF real
 */
async function performPDFExport(data: ExportData, config: PDFExportConfig): Promise<void> {
  let pdf: jsPDF;
  
  try {
    // Configurar el documento PDF
    pdf = new jsPDF({
      orientation: config.orientation,
      unit: 'mm',
      format: config.pageFormat
    });
    
    // Configuración inicial
    pdf.setFont('helvetica');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const lineHeight = 6;
    let yPosition = margin;
    
    // Verificar si jsPDF se inicializó correctamente
    if (!pdf.internal) {
      throw createPDFError('GENERATION_ERROR', 'Error al inicializar el generador PDF');
    }
    
    // Título del documento (si está habilitado)
    if (config.includeHeader) {
      yPosition = addPDFHeader(pdf, data, yPosition, margin, pageWidth);
    }
    
    // Configurar columnas basado en la orientación y estadísticas
    const { headers, columnWidths } = configurePDFColumns(data.options, config.orientation, pageWidth, margin);
    
    // Dibujar encabezados de tabla
    yPosition = drawPDFTableHeaders(pdf, headers, columnWidths, yPosition, margin);
    
    // Procesar datos de instituciones
    let currentPage = 1;
    const maxYPosition = pageHeight - (config.includeFooter ? 25 : 15);
    
    for (let i = 0; i < data.institutions.length; i++) {
      const institution = data.institutions[i];
      
      // Verificar si necesitamos una nueva página
      if (yPosition > maxYPosition) {
        // Añadir pie de página a la página actual
        if (config.includeFooter) {
          addPDFFooter(pdf, currentPage, Math.ceil(data.institutions.length / 35), pageWidth, pageHeight);
        }
        
        pdf.addPage();
        currentPage++;
        yPosition = margin;
        
        // Repetir encabezados en nueva página
        if (config.includeHeader) {
          yPosition = addPDFHeader(pdf, data, yPosition, margin, pageWidth, true);
        }
        yPosition = drawPDFTableHeaders(pdf, headers, columnWidths, yPosition, margin);
      }
      
      // Dibujar fila de datos
      yPosition = drawPDFTableRow(pdf, institution, data.stats?.[institution.id], data.options, columnWidths, yPosition, margin);
    }
    
    // Añadir pie de página a la última página
    if (config.includeFooter) {
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addPDFFooter(pdf, i, totalPages, pageWidth, pageHeight);
      }
    }
    
    // Verificar tamaño del archivo antes de guardar
    const pdfOutput = pdf.output('arraybuffer');
    const fileSizeInMB = pdfOutput.byteLength / (1024 * 1024);
    
    if (fileSizeInMB > config.maxFileSize) {
      throw createPDFError('GENERATION_ERROR', `El archivo PDF es demasiado grande (${fileSizeInMB.toFixed(2)}MB). Máximo permitido: ${config.maxFileSize}MB`);
    }
    
    // Generar nombre del archivo y descargar
    const fileName = generateFileName('pdf', data.options);
    
    try {
      pdf.save(fileName);
    } catch (saveError) {
      throw createPDFError('DOWNLOAD_ERROR', 'Error al descargar el archivo PDF', saveError);
    }
    
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error; // Re-lanzar errores de exportación personalizados
    }
    
    // Manejar errores específicos de jsPDF
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw createPDFError('GENERATION_ERROR', 'Error al generar el PDF: formato inválido');
      }
      if (error.message.includes('out of memory')) {
        throw createPDFError('GENERATION_ERROR', 'No hay suficiente memoria para generar el PDF');
      }
      if (error.message.includes('Maximum call stack')) {
        throw createPDFError('GENERATION_ERROR', 'Demasiados datos para procesar en el PDF');
      }
    }
    
    throw createPDFError('GENERATION_ERROR', 'Error al generar el archivo PDF', error);
  }
}

/**
 * Añade el encabezado al PDF
 */
function addPDFHeader(pdf: jsPDF, data: ExportData, yPosition: number, margin: number, pageWidth: number, isSubsequentPage = false): number {
  // Título principal
  if (!isSubsequentPage) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Reporte de Instituciones', margin, yPosition);
    yPosition += 12;
  } else {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Reporte de Instituciones (continuación)', margin, yPosition);
    yPosition += 8;
  }
  
  // Información del reporte
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  
  const reportInfo = [
    `Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`,
    `Total de instituciones: ${data.institutions.length}`
  ];
  
  // Añadir información de filtros si existen
  if (data.options.dateRange?.from || data.options.dateRange?.to) {
    let dateRangeText = 'Período: ';
    if (data.options.dateRange.from && data.options.dateRange.to) {
      dateRangeText += `${format(data.options.dateRange.from, 'dd/MM/yyyy', { locale: es })} - ${format(data.options.dateRange.to, 'dd/MM/yyyy', { locale: es })}`;
    } else if (data.options.dateRange.from) {
      dateRangeText += `Desde ${format(data.options.dateRange.from, 'dd/MM/yyyy', { locale: es })}`;
    } else if (data.options.dateRange.to) {
      dateRangeText += `Hasta ${format(data.options.dateRange.to, 'dd/MM/yyyy', { locale: es })}`;
    }
    reportInfo.push(dateRangeText);
  }
  
  if (data.options.includeStats) {
    reportInfo.push('Incluye estadísticas de cursos, estudiantes y profesores');
  }
  
  reportInfo.forEach(info => {
    pdf.text(info, margin, yPosition);
    yPosition += 5;
  });
  
  yPosition += 5; // Espacio adicional
  return yPosition;
}

/**
 * Configura las columnas del PDF basado en las opciones
 */
function configurePDFColumns(options: InstitutionExportOptions, orientation: string, pageWidth: number, margin: number) {
  const availableWidth = pageWidth - (margin * 2);
  
  const headers = ['Nombre', 'Dirección', 'Teléfono', 'Email', 'Fecha Creación'];
  let columnWidths: number[];
  
  if (options.includeStats) {
    headers.push('Cursos', 'Estudiantes', 'Profesores');
    // Distribución para landscape con estadísticas
    columnWidths = orientation === 'landscape' 
      ? [50, 45, 25, 40, 25, 18, 18, 18] 
      : [35, 30, 20, 30, 20, 12, 12, 12]; // Portrait más compacto
  } else {
    // Distribución sin estadísticas
    columnWidths = orientation === 'landscape'
      ? [60, 55, 35, 50, 30]
      : [40, 35, 25, 35, 25];
  }
  
  // Ajustar anchos proporcionalmente si exceden el ancho disponible
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  if (totalWidth > availableWidth) {
    const scaleFactor = availableWidth / totalWidth;
    columnWidths = columnWidths.map(width => width * scaleFactor);
  }
  
  return { headers, columnWidths };
}

/**
 * Dibuja los encabezados de la tabla
 */
function drawPDFTableHeaders(pdf: jsPDF, headers: string[], columnWidths: number[], yPosition: number, margin: number): number {
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  
  let xPosition = margin;
  headers.forEach((header, index) => {
    pdf.text(header, xPosition, yPosition);
    xPosition += columnWidths[index];
  });
  
  yPosition += 8;
  
  // Línea separadora
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  pdf.line(margin, yPosition - 2, margin + totalWidth, yPosition - 2);
  
  return yPosition;
}

/**
 * Dibuja una fila de datos de institución
 */
function drawPDFTableRow(
  pdf: jsPDF, 
  institution: Institution, 
  stats: InstitutionStats | undefined, 
  options: InstitutionExportOptions,
  columnWidths: number[], 
  yPosition: number, 
  margin: number
): number {
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  
  let xPosition = margin;
  
  // Preparar datos de la fila
  const rowData = [
    truncateText(institution.name, 25),
    truncateText(institution.address || 'N/A', 20),
    truncateText(institution.phone || 'N/A', 15),
    truncateText(institution.email || 'N/A', 20),
    format(new Date(institution.created_at), 'dd/MM/yyyy', { locale: es }),
  ];
  
  if (options.includeStats) {
    if (stats) {
      rowData.push(
        stats.courses_count.toString(),
        stats.students_count.toString(),
        stats.professors_count.toString()
      );
    } else {
      rowData.push('0', '0', '0');
    }
  }
  
  // Dibujar cada celda
  rowData.forEach((text, index) => {
    pdf.text(text, xPosition, yPosition);
    xPosition += columnWidths[index];
  });
  
  return yPosition + 5;
}

/**
 * Añade el pie de página
 */
function addPDFFooter(pdf: jsPDF, currentPage: number, totalPages: number, pageWidth: number, pageHeight: number): void {
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  
  // Número de página
  pdf.text(
    `Página ${currentPage} de ${totalPages}`,
    pageWidth - 40,
    pageHeight - 10
  );
  
  // Información adicional en la primera página
  if (currentPage === 1) {
    pdf.text(
      'Generado por Sistema de Gestión Escolar',
      15,
      pageHeight - 10
    );
  }
}

/**
 * Crea un error de exportación PDF tipado
 */
function createPDFError(code: PDFExportError['code'], message: string, details?: any): PDFExportError & Error {
  const error = new Error(message) as PDFExportError & Error;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Genera el contenido CSV para exportación a Excel
 */
function generateCSVContent(data: ExportData): string {
  try {
    const { institutions, stats, options } = data;
    
    // Validar datos de entrada
    if (!institutions || !Array.isArray(institutions) || institutions.length === 0) {
      throw new Error('No hay datos de instituciones para generar CSV');
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
          escapeCSV(institution.name || `Institución ${index + 1}`),
          escapeCSV(institution.address || ''),
          escapeCSV(institution.phone || ''),
          escapeCSV(institution.email || ''),
          institution.created_at ? format(new Date(institution.created_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A',
          institution.updated_at ? format(new Date(institution.updated_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'
        ];
        
        if (options.includeStats) {
          if (institutionStats) {
            row.push(
              (institutionStats.courses_count || 0).toString(),
              (institutionStats.students_count || 0).toString(),
              (institutionStats.professors_count || 0).toString()
            );
          } else {
            row.push('0', '0', '0');
          }
        }
        
        return row;
      } catch (rowError) {
        console.warn(`Error procesando institución ${index} para CSV:`, rowError);
        // Retornar fila con datos básicos en caso de error
        const fallbackRow = [
          escapeCSV(institution.name || `Institución ${index + 1}`),
          'Error al procesar',
          '',
          '',
          'N/A',
          'N/A'
        ];
        
        if (options.includeStats) {
          fallbackRow.push('0', '0', '0');
        }
        
        return fallbackRow;
      }
    });
    
    // Añadir información de metadatos al inicio
    const metaRows = [
      ['# Reporte de Instituciones'],
      [`# Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`],
      [`# Total de instituciones: ${institutions.length}`]
    ];
    
    // Añadir información de filtros si existen
    if (options.dateRange?.from || options.dateRange?.to) {
      let dateRangeText = '# Rango de fechas: ';
      try {
        if (options.dateRange.from && options.dateRange.to) {
          dateRangeText += `${format(options.dateRange.from, 'dd/MM/yyyy', { locale: es })} - ${format(options.dateRange.to, 'dd/MM/yyyy', { locale: es })}`;
        } else if (options.dateRange.from) {
          dateRangeText += `Desde ${format(options.dateRange.from, 'dd/MM/yyyy', { locale: es })}`;
        } else if (options.dateRange.to) {
          dateRangeText += `Hasta ${format(options.dateRange.to, 'dd/MM/yyyy', { locale: es })}`;
        }
      } catch (dateError) {
        console.warn('Error formateando fechas para CSV:', dateError);
        dateRangeText += 'Error en formato de fecha';
      }
      metaRows.push([dateRangeText]);
    }
    
    if (options.includeStats) {
      metaRows.push(['# Incluye estadísticas de cursos, estudiantes y profesores']);
    }
    
    metaRows.push(['']); // Fila vacía para separación
    
    // Combinar metadatos, encabezados y filas
    const allRows = [...metaRows, headers, ...rows];
    
    // Convertir a CSV
    const csvContent = allRows.map(row => row.join(',')).join('\n');
    
    // Validar que el contenido no esté vacío
    if (!csvContent || csvContent.trim().length === 0) {
      throw new Error('El contenido CSV generado está vacío');
    }
    
    return csvContent;
    
  } catch (error) {
    console.error('Error generando contenido CSV:', error);
    // Retornar CSV mínimo en caso de error
    return [
      '# Error al generar reporte',
      '# Se produjo un error al procesar la información',
      '',
      'Nombre,Error',
      'Error al procesar datos,Contacte al administrador'
    ].join('\n');
  }
}

/**
 * Escapa caracteres especiales para CSV
 */
function escapeCSV(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Escapar comillas dobles duplicándolas
  let escapedText = text.replace(/"/g, '""');
  
  // Si contiene caracteres especiales, envolver en comillas
  if (escapedText.includes(',') || escapedText.includes('"') || escapedText.includes('\n') || escapedText.includes('\r')) {
    return `"${escapedText}"`;
  }
  
  return escapedText;
}

/**
 * Trunca texto para que quepa en las columnas del PDF
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Genera el nombre del archivo basado en las opciones
 */
function generateFileName(format: 'excel' | 'pdf', options: InstitutionExportOptions): string {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm', { locale: es });
  const extension = format === 'excel' ? 'csv' : 'pdf';
  
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
  
  return `${fileName}.${extension}`;
}

/**
 * Función principal para manejar la exportación
 */
export async function exportInstitutions(
  institutions: Institution[],
  options: InstitutionExportOptions,
  stats?: Record<string, InstitutionStats>,
  excelConfig?: ExcelExportConfig,
  pdfConfig?: PDFExportConfig
): Promise<void> {
  // Validar opciones antes de proceder
  const validationErrors = validateExportOptions(options);
  if (validationErrors.length > 0) {
    throw createExportError('DATA_ERROR', `Opciones de exportación inválidas: ${validationErrors.join(', ')}`);
  }

  const exportData: ExportData = {
    institutions,
    stats,
    options,
  };
  
  try {
    if (options.format === 'excel') {
      await exportToExcel(exportData, excelConfig);
    } else if (options.format === 'pdf') {
      await exportToPDF(exportData, pdfConfig);
    } else {
      throw createExportError('DATA_ERROR', `Formato de exportación no soportado: ${options.format}`);
    }
  } catch (error) {
    // Log del error para debugging
    console.error('Error en exportInstitutions:', error);
    
    // Re-lanzar errores de exportación personalizados
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    
    // Crear error genérico para errores inesperados
    throw createExportError('GENERATION_ERROR', 'Error inesperado durante la exportación', error);
  }
}

/**
 * Crea un error de exportación genérico
 */
function createExportError(code: ExportError['code'], message: string, details?: any): ExportError & Error {
  const error = new Error(message) as ExportError & Error;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Valida las opciones de exportación
 */
export function validateExportOptions(options: InstitutionExportOptions): string[] {
  const errors: string[] = [];
  
  if (!options.format) {
    errors.push('El formato de exportación es requerido');
  }
  
  if (!['excel', 'pdf'].includes(options.format)) {
    errors.push('Formato de exportación no válido');
  }
  
  if (options.dateRange?.from && options.dateRange?.to) {
    if (options.dateRange.from > options.dateRange.to) {
      errors.push('La fecha de inicio no puede ser posterior a la fecha de fin');
    }
  }
  
  if (options.dateRange?.from && options.dateRange.from > new Date()) {
    errors.push('La fecha de inicio no puede ser futura');
  }
  
  if (options.dateRange?.to && options.dateRange.to > new Date()) {
    errors.push('La fecha de fin no puede ser futura');
  }
  
  return errors;
}

/**
 * Obtiene un resumen de lo que se va a exportar
 */
export function getExportSummary(
  institutions: Institution[],
  options: InstitutionExportOptions
): {
  totalInstitutions: number;
  format: string;
  includeStats: boolean;
  dateRange?: string;
  estimatedSize: string;
} {
  const summary = {
    totalInstitutions: institutions.length,
    format: options.format === 'excel' ? 'Excel (.csv)' : 'PDF (.pdf)',
    includeStats: options.includeStats,
    estimatedSize: estimateFileSize(institutions.length, options),
  };
  
  if (options.dateRange?.from || options.dateRange?.to) {
    let dateRangeText = '';
    if (options.dateRange.from && options.dateRange.to) {
      dateRangeText = `${format(options.dateRange.from, 'dd/MM/yyyy', { locale: es })} - ${format(options.dateRange.to, 'dd/MM/yyyy', { locale: es })}`;
    } else if (options.dateRange.from) {
      dateRangeText = `Desde ${format(options.dateRange.from, 'dd/MM/yyyy', { locale: es })}`;
    } else if (options.dateRange.to) {
      dateRangeText = `Hasta ${format(options.dateRange.to, 'dd/MM/yyyy', { locale: es })}`;
    }
    
    return { ...summary, dateRange: dateRangeText };
  }
  
  return summary;
}

/**
 * Estima el tamaño del archivo basado en la cantidad de datos
 */
function estimateFileSize(institutionCount: number, options: InstitutionExportOptions): string {
  // Estimación aproximada basada en el contenido
  let baseSize = institutionCount * 200; // ~200 bytes por institución base
  
  if (options.includeStats) {
    baseSize += institutionCount * 50; // +50 bytes por estadísticas
  }
  
  if (options.format === 'pdf') {
    baseSize *= 2; // PDFs son generalmente más grandes
  }
  
  // Convertir a unidades legibles
  if (baseSize < 1024) {
    return `${baseSize} B`;
  } else if (baseSize < 1024 * 1024) {
    return `${Math.round(baseSize / 1024)} KB`;
  } else {
    return `${Math.round(baseSize / (1024 * 1024))} MB`;
  }
}