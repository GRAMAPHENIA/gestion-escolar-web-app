import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
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

    // Crear cliente de Supabase
    const supabase = createClient();

    // Obtener la institución
    const { data: institution, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('id', institutionId)
      .single();

    if (error) {
      console.error('Error fetching institution:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Institución no encontrada' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: 'Error al obtener la institución' },
        { status: 500 }
      );
    }

    return NextResponse.json(institution);

  } catch (error) {
    console.error('Error in institution detail API:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
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

    // Parsear el cuerpo de la solicitud
    const body = await request.json();
    const { name, address, phone, email } = body;

    // Validación básica
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'El nombre es requerido y debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { success: false, message: 'El nombre no puede exceder 100 caracteres' },
        { status: 400 }
      );
    }

    if (address && address.length > 200) {
      return NextResponse.json(
        { success: false, message: 'La dirección no puede exceder 200 caracteres' },
        { status: 400 }
      );
    }

    if (phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'Formato de teléfono inválido' },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Crear cliente de Supabase
    const supabase = createClient();

    // Verificar que la institución existe
    const { data: existingInstitution, error: checkError } = await supabase
      .from('institutions')
      .select('id')
      .eq('id', institutionId)
      .single();

    if (checkError || !existingInstitution) {
      return NextResponse.json(
        { success: false, message: 'Institución no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que no exista otra institución con el mismo nombre
    const { data: duplicateInstitution } = await supabase
      .from('institutions')
      .select('id')
      .ilike('name', name.trim())
      .neq('id', institutionId)
      .single();

    if (duplicateInstitution) {
      return NextResponse.json(
        { success: false, message: 'Ya existe otra institución con ese nombre' },
        { status: 409 }
      );
    }

    // Actualizar la institución
    const { data: updatedInstitution, error: updateError } = await supabase
      .from('institutions')
      .update({
        name: name.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', institutionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating institution:', updateError);
      return NextResponse.json(
        { success: false, message: 'Error al actualizar la institución' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedInstitution);

  } catch (error) {
    console.error('Error in institution update API:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
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

    // Crear cliente de Supabase
    const supabase = createClient();

    // Verificar que la institución existe
    const { data: existingInstitution, error: checkError } = await supabase
      .from('institutions')
      .select('id, name')
      .eq('id', institutionId)
      .single();

    if (checkError || !existingInstitution) {
      return NextResponse.json(
        { success: false, message: 'Institución no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si hay datos relacionados
    const { data: relatedCourses } = await supabase
      .from('courses')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    const { data: relatedProfessors } = await supabase
      .from('professors')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1);

    if (relatedCourses && relatedCourses.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No se puede eliminar la institución porque tiene cursos asociados' 
        },
        { status: 409 }
      );
    }

    if (relatedProfessors && relatedProfessors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No se puede eliminar la institución porque tiene profesores asociados' 
        },
        { status: 409 }
      );
    }

    // Eliminar la institución
    const { error: deleteError } = await supabase
      .from('institutions')
      .delete()
      .eq('id', institutionId);

    if (deleteError) {
      console.error('Error deleting institution:', deleteError);
      return NextResponse.json(
        { success: false, message: 'Error al eliminar la institución' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Institución eliminada exitosamente',
    });

  } catch (error) {
    console.error('Error in institution delete API:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}