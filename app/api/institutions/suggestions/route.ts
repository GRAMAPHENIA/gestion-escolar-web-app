import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get search query
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    // Create Supabase client
    const supabase = createClient();

    // Search for institutions with similar names
    const { data: institutions, error } = await supabase
      .from('institutions')
      .select('name')
      .ilike('name', `%${query.trim()}%`)
      .limit(5)
      .order('name');

    if (error) {
      console.error('Error fetching institution suggestions:', error);
      return NextResponse.json(
        { success: false, message: 'Error al obtener sugerencias' },
        { status: 500 }
      );
    }

    // Extract unique names for suggestions
    const suggestions = institutions
      ?.map(institution => institution.name)
      .filter((name, index, array) => array.indexOf(name) === index) // Remove duplicates
      || [];

    return NextResponse.json({
      success: true,
      suggestions,
    });

  } catch (error) {
    console.error('Error in institutions suggestions API:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}