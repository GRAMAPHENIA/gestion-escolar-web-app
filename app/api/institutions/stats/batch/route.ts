import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { InstitutionStats } from '@/features/institutions/types';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { institutionIds } = body;

    if (!Array.isArray(institutionIds) || institutionIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Se requiere un array de IDs de instituciones' },
        { status: 400 }
      );
    }

    // Limit to prevent abuse
    if (institutionIds.length > 50) {
      return NextResponse.json(
        { success: false, message: 'Máximo 50 instituciones por solicitud' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient();

    // Verify institutions exist
    const { data: institutions, error: institutionsError } = await supabase
      .from('institutions')
      .select('id, name')
      .in('id', institutionIds);

    if (institutionsError) {
      console.error('Error fetching institutions:', institutionsError);
      return NextResponse.json(
        { success: false, message: 'Error al verificar instituciones' },
        { status: 500 }
      );
    }

    const validInstitutionIds = institutions?.map(inst => inst.id) || [];
    const statsMap: Record<string, InstitutionStats> = {};

    // Get stats for each valid institution
    for (const institutionId of validInstitutionIds) {
      try {
        // Get courses count
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('id')
          .eq('institution_id', institutionId);

        const coursesCount = coursesError ? 0 : (coursesData?.length || 0);

        // Get students count
        let studentsCount = 0;
        if (coursesCount > 0 && coursesData) {
          const courseIds = coursesData.map(course => course.id);
          
          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('id')
            .in('course_id', courseIds);

          studentsCount = studentsError ? 0 : (studentsData?.length || 0);
        }

        // Get professors count
        const { data: professorsData, error: professorsError } = await supabase
          .from('professors')
          .select('id')
          .eq('institution_id', institutionId);

        const professorsCount = professorsError ? 0 : (professorsData?.length || 0);

        // For batch requests, we don't include recent activity to keep response size manageable
        statsMap[institutionId] = {
          courses_count: coursesCount,
          students_count: studentsCount,
          professors_count: professorsCount,
          recent_activity: [], // Empty for batch requests
        };

      } catch (error) {
        console.error(`Error getting stats for institution ${institutionId}:`, error);
        // Set default stats for failed institutions
        statsMap[institutionId] = {
          courses_count: 0,
          students_count: 0,
          professors_count: 0,
          recent_activity: [],
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: statsMap,
    });

  } catch (error) {
    console.error('Error in batch institution stats API:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}