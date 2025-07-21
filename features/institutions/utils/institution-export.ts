import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Institution, InstitutionExportOptions, InstitutionStats } from '../types';

// Tipos para los datos de exportación
export interface ExportData {
  institutions: Institution[];
  stats?: Record<string, InstitutionStats>;
  options: InstitutionExportOptions;
}

/**
 * Genera y descarga un archivo Excel con los datos de instituciones
 */
export async function exportToExcel(data: ExportData): Promise<void> {
  try {
    // Crear el contenido CSV (Excel puede abrir archivos CSV)
    const csvContent = generateCSVContent(data);
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', generateFileName('excel', data.options));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    throw new Error('Error al generar el archivo Excel');
  }
}

/**
 * Genera y descarga un archivo PDF con los datos de instituciones
 */
export async function exportToPDF(data: ExportData): Promise<void> {
  try {
    const pdf = new jsPDF();
    
    // Configuración inicial
    pdf.setFont('helvetica');
    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;
    
    // Título del documento
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Reporte de Instituciones', margin, yPosition);
    yPosition += 15;
    
    // Información del reporte
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Total de instituciones: ${data.institutions.length}`, margin, yPosition);
    yPosition += 15;
    
    // Encabezados de tabla
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    
    const headers = ['Nombre', 'Dirección', 'Teléfono', 'Email', 'Fecha Creación'];
    if (data.options.includeStats) {
      headers.push('Cursos', 'Estudiantes', 'Profesores');
    }
    
    // Dibujar encabezados
    let xPosition = margin;
    const columnWidths = data.options.includeStats 
      ? [40, 35, 25, 35, 25, 15, 15, 15] 
      : [50, 45, 30, 40, 25];
    
    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += columnWidths[index];
    });
    
    yPosition += 10;
    
    // Línea separadora
    pdf.line(margin, yPosition - 3, margin + 180, yPosition - 3);
    
    // Datos de instituciones
    pdf.setFont('helvetica', 'normal');
    
    for (const institution of data.institutions) {
      // Verificar si necesitamos una nueva página
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      
      xPosition = margin;
      const stats = data.stats?.[institution.id];
      
      // Truncar texto largo para que quepa en las columnas
      const rowData = [
        truncateText(institution.name, 25),
        truncateText(institution.address || 'N/A', 20),
        truncateText(institution.phone || 'N/A', 15),
        truncateText(institution.email || 'N/A', 20),
        format(new Date(institution.created_at), 'dd/MM/yyyy', { locale: es }),
      ];
      
      if (data.options.includeStats && stats) {
        rowData.push(
          stats.courses_count.toString(),
          stats.students_count.toString(),
          stats.professors_count.toString()
        );
      }
      
      rowData.forEach((text, index) => {
        pdf.text(text, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      
      yPosition += lineHeight;
    }
    
    // Pie de página
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pdf.internal.pageSize.width - 40,
        pdf.internal.pageSize.height - 10
      );
    }
    
    // Descargar el PDF
    pdf.save(generateFileName('pdf', data.options));
    
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    throw new Error('Error al generar el archivo PDF');
  }
}

/**
 * Genera el contenido CSV para exportación a Excel
 */
function generateCSVContent(data: ExportData): string {
  const { institutions, stats, options } = data;
  
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
  
  // Crear filas de datos
  const rows = institutions.map(institution => {
    const institutionStats = stats?.[institution.id];
    
    const row = [
      escapeCSV(institution.name),
      escapeCSV(institution.address || ''),
      escapeCSV(institution.phone || ''),
      escapeCSV(institution.email || ''),
      format(new Date(institution.created_at), 'dd/MM/yyyy HH:mm', { locale: es }),
      format(new Date(institution.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })
    ];
    
    if (options.includeStats && institutionStats) {
      row.push(
        institutionStats.courses_count.toString(),
        institutionStats.students_count.toString(),
        institutionStats.professors_count.toString()
      );
    } else if (options.includeStats) {
      row.push('0', '0', '0');
    }
    
    return row;
  });
  
  // Combinar encabezados y filas
  const allRows = [headers, ...rows];
  
  // Convertir a CSV
  return allRows.map(row => row.join(',')).join('\n');
}

/**
 * Escapa caracteres especiales para CSV
 */
function escapeCSV(text: string): string {
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
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
  stats?: Record<string, InstitutionStats>
): Promise<void> {
  const exportData: ExportData = {
    institutions,
    stats,
    options,
  };
  
  if (options.format === 'excel') {
    await exportToExcel(exportData);
  } else if (options.format === 'pdf') {
    await exportToPDF(exportData);
  } else {
    throw new Error('Formato de exportación no soportado');
  }
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