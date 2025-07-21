import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { InstitutionStats, InstitutionActivity } from '@/features/institutions/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    const institutionId = params.id;

    if (!institutionId) {
      return NextResponse.json(
        { success: false, message: 'ID de institución requerido' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient();

    // First, verify the institution exists
    const { data: institution, error: institutionError } = await supabase
      .from('institutions')
      .select('id, name')
      .eq('id', institutionId)
      .single();

    if (institutionError || !institution) {
      return NextResponse.json(
        { success: false, message: 'Institución no encontrada' },
        { status: 404 }
      );
    }

    // Get courses count and related statistics
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .eq('institution_id', institutionId);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return NextResponse.json(
        { success: false, message: 'Error al obtener estadísticas de cursos' },
        { status: 500 }
      );
    }

    const coursesCount = coursesData?.length || 0;

    // Get students count (students enrolled in courses of this institution)
    let studentsCount = 0;
    if (coursesCount > 0) {
      const courseIds = coursesData.map(course => course.id);
      
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .in('course_id', courseIds);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      } else {
        studentsCount = studentsData?.length || 0;
      }
    }

    // Get professors count (professors assigned to this institution)
    const { data: professorsData, error: professorsError } = await supabase
      .from('professors')
      .select('id')
      .eq('institution_id', institutionId);

    if (professorsError) {
      console.error('Error fetching professors:', professorsError);
    }

    const professorsCount = professorsData?.length || 0;

    // Get recent activity (mock data for now - in a real app this would come from an activity log table)
    const recentActivity: InstitutionActivity[] = [
      {
        id: '1',
        type: 'course_created',
        description: 'Se creó un nuevo curso de Matemáticas',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        metadata: { course_name: 'Matemáticas' }
      },
      {
        id: '2',
        type: 'student_enrolled',
        description: 'Se inscribió un nuevo estudiante',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        metadata: {}
      },
      {
        id: '3',
        type: 'professor_assigned',
        description: 'Se asignó un profesor al departamento de Ciencias',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        metadata: { department: 'Ciencias' }
      },
      {
        id: '4',
        type: 'institution_updated',
        description: 'Se actualizó la información de contacto',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        metadata: {}
      }
    ];

    // Build stats object
    const stats: InstitutionStats = {
      courses_count: coursesCount,
      students_count: studentsCount,
      professors_count: professorsCount,
      recent_activity: recentActivity.slice(0, 5), // Limit to 5 most recent activities
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Error in institution stats API:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}