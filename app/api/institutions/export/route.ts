import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { InstitutionExportOptions, Institution, InstitutionStats } from '@/features/institutions/types';
import { validateExportOptions } from '@/features/institutions/utils/institution-export';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Parsear el cuerpo de la solicitud
    const body = await request.json();
    const exportOptions: InstitutionExportOptions = body.options;

    // Validar opciones de exportación
    const validationErrors = validateExportOptions(exportOptions);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Opciones de exportación inválidas',
          errors: validationErrors 
        },
        { status: 400 }
      );
    }

    // Crear cliente de Supabase
    const supabase = createClient();

    // Construir query base
    let query = supabase
      .from('institutions')
      .select('*');

    // Aplicar filtros de fecha si existen
    if (exportOptions.dateRange?.from) {
      query = query.gte('created_at', exportOptions.dateRange.from.toISOString());
    }
    
    if (exportOptions.dateRange?.to) {
      // Agregar un día completo para incluir el día seleccionado
      const toDate = new Date(exportOptions.dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      query = query.lte('created_at', toDate.toISOString());
    }

    // Aplicar filtros adicionales si existen
    if (exportOptions.filters?.search) {
      query = query.ilike('name', `%${exportOptions.filters.search}%`);
    }

    // Ordenar resultados
    const sortBy = exportOptions.filters?.sortBy || 'created_at';
    const sortOrder = exportOptions.filters?.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Ejecutar query
    const { data: institutions, error } = await query;

    if (error) {
      console.error('Error al obtener instituciones para exportación:', error);
      return NextResponse.json(
        { success: false, message: 'Error al obtener datos de instituciones' },
        { status: 500 }
      );
    }

    if (!institutions || institutions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No se encontraron instituciones para exportar' },
        { status: 404 }
      );
    }

    // Obtener estadísticas si se requieren
    let stats: Record<string, InstitutionStats> = {};
    
    if (exportOptions.includeStats) {
      try {
        const institutionIds = institutions.map(inst => inst.id);
        
        // Obtener estadísticas para cada institución
        for (const institutionId of institutionIds) {
          // Obtener cursos
          const { data: coursesData } = await supabase
            .from('courses')
            .select('id')
            .eq('institution_id', institutionId);

          const coursesCount = coursesData?.length || 0;

          // Obtener estudiantes
          let studentsCount = 0;
          if (coursesCount > 0 && coursesData) {
            const courseIds = coursesData.map(course => course.id);
            const { data: studentsData } = await supabase
              .from('students')
              .select('id')
              .in('course_id', courseIds);
            
            studentsCount = studentsData?.length || 0;
          }

          // Obtener profesores
          const { data: professorsData } = await supabase
            .from('professors')
            .select('id')
            .eq('institution_id', institutionId);

          const professorsCount = professorsData?.length || 0;

          stats[institutionId] = {
            courses_count: coursesCount,
            students_count: studentsCount,
            professors_count: professorsCount,
            recent_activity: [], // No incluir actividad en exportaciones
          };
        }
      } catch (statsError) {
        console.error('Error al obtener estadísticas:', statsError);
        // Continuar sin estadísticas en caso de error
        stats = {};
      }
    }

    // Preparar datos para la respuesta
    const exportData = {
      institutions: institutions as Institution[],
      stats: Object.keys(stats).length > 0 ? stats : undefined,
      options: exportOptions,
      metadata: {
        exportedAt: new Date().toISOString(),
        totalCount: institutions.length,
        exportedBy: userId,
      },
    };

    return NextResponse.json({
      success: true,
      data: exportData,
      message: `${institutions.length} instituciones preparadas para exportación`,
    });

  } catch (error) {
    console.error('Error en API de exportación de instituciones:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para obtener un resumen de exportación sin ejecutarla
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Crear cliente de Supabase
    const supabase = createClient();

    // Construir query para contar
    let query = supabase
      .from('institutions')
      .select('id', { count: 'exact', head: true });

    // Aplicar filtros
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      query = query.lte('created_at', toDate.toISOString());
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Ejecutar query
    const { count, error } = await query;

    if (error) {
      console.error('Error al contar instituciones:', error);
      return NextResponse.json(
        { success: false, message: 'Error al obtener resumen de exportación' },
        { status: 500 }
      );
    }

    // Estimar tamaño del archivo
    const estimatedSize = estimateFileSize(count || 0, includeStats);

    return NextResponse.json({
      success: true,
      data: {
        totalInstitutions: count || 0,
        includeStats,
        estimatedSize,
        filters: {
          search: search || null,
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
        },
      },
    });

  } catch (error) {
    console.error('Error en resumen de exportación:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para estimar tamaño de archivo
function estimateFileSize(institutionCount: number, includeStats: boolean): string {
  let baseSize = institutionCount * 200; // ~200 bytes por institución base
  
  if (includeStats) {
    baseSize += institutionCount * 50; // +50 bytes por estadísticas
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