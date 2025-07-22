'use server';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-updated';
import { InstitutionExportOptions, Institution, InstitutionStats } from '@/features/institutions/types';
import { validateExportOptions } from '@/features/institutions/utils/institution-export';

/**
 * Endpoint para obtener datos de instituciones para exportación
 * POST /api/institutions/export
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener opciones de exportación del cuerpo de la solicitud
    const body = await request.json();
    const options: InstitutionExportOptions = body.options;

    // Validar opciones
    const validationErrors = validateExportOptions(options);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Opciones de exportación inválidas', errors: validationErrors },
        { status: 400 }
      );
    }

    // Usar cliente de Supabase importado

    // Construir consulta base
    let query = supabase.from('institutions').select('*');

    // Aplicar filtros si existen
    if (options.filters) {
      // Filtro de búsqueda
      if (options.filters.search) {
        query = query.ilike('name', `%${options.filters.search}%`);
      }

      // Filtro de rango de fechas
      if (options.dateRange?.from) {
        query = query.gte('created_at', options.dateRange.from.toISOString());
      }
      if (options.dateRange?.to) {
        // Ajustar la fecha final para incluir todo el día
        const endDate = new Date(options.dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      // Ordenamiento
      if (options.filters.sortBy && options.filters.sortOrder) {
        query = query.order(options.filters.sortBy, {
          ascending: options.filters.sortOrder === 'asc',
        });
      }
    } else {
      // Ordenamiento predeterminado
      query = query.order('created_at', { ascending: false });
    }

    // Ejecutar consulta
    const { data: institutions, error } = await query;

    if (error) {
      console.error('Error al obtener instituciones:', error);
      return NextResponse.json(
        { success: false, message: 'Error al obtener datos de instituciones' },
        { status: 500 }
      );
    }

    // Obtener estadísticas si se solicitan
    let stats: Record<string, InstitutionStats> | undefined;
    
    if (options.includeStats && institutions.length > 0) {
      const institutionIds = institutions.map((inst: Institution) => inst.id);
      
      // Consulta para obtener estadísticas de cursos
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('institution_id, count')
        .in('institution_id', institutionIds)
        .group('institution_id');
      
      if (coursesError) {
        console.error('Error al obtener estadísticas de cursos:', coursesError);
      }
      
      // Consulta para obtener estadísticas de estudiantes
      const { data: studentsData, error: studentsError } = await supabase
        .rpc('get_students_count_by_institution', { institution_ids: institutionIds });
      
      if (studentsError) {
        console.error('Error al obtener estadísticas de estudiantes:', studentsError);
      }
      
      // Consulta para obtener estadísticas de profesores
      const { data: professorsData, error: professorsError } = await supabase
        .from('professors')
        .select('institution_id, count')
        .in('institution_id', institutionIds)
        .group('institution_id');
      
      if (professorsError) {
        console.error('Error al obtener estadísticas de profesores:', professorsError);
      }
      
      // Combinar estadísticas
      stats = {};
      
      institutionIds.forEach(id => {
        const coursesCount = coursesData?.find(item => item.institution_id === id)?.count || 0;
        const studentsCount = studentsData?.find(item => item.institution_id === id)?.count || 0;
        const professorsCount = professorsData?.find(item => item.institution_id === id)?.count || 0;
        
        stats![id] = {
          courses_count: Number(coursesCount),
          students_count: Number(studentsCount),
          professors_count: Number(professorsCount),
          recent_activity: [] // No incluimos actividad reciente en la exportación
        };
      });
    }

    // Devolver datos para exportación
    return NextResponse.json({
      success: true,
      data: {
        institutions,
        stats,
        totalCount: institutions.length
      }
    });
    
  } catch (error) {
    console.error('Error en exportación de instituciones:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud de exportación' },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para obtener resumen de exportación sin descargar
 * GET /api/institutions/export
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') as 'excel' | 'pdf' || 'excel';
    const includeStats = searchParams.get('includeStats') === 'true';
    
    // Usar cliente de Supabase importado
    
    // Obtener conteo total de instituciones
    const { count, error } = await supabase
      .from('institutions')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error al obtener conteo de instituciones:', error);
      return NextResponse.json(
        { success: false, message: 'Error al obtener información de exportación' },
        { status: 500 }
      );
    }
    
    // Devolver resumen
    return NextResponse.json({
      success: true,
      data: {
        totalCount: count || 0,
        format,
        includeStats,
        estimatedSize: estimateFileSize(count || 0, { format, includeStats })
      }
    });
    
  } catch (error) {
    console.error('Error al obtener resumen de exportación:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

/**
 * Estima el tamaño del archivo basado en la cantidad de datos
 */
function estimateFileSize(institutionCount: number, options: { format: string, includeStats: boolean }): string {
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