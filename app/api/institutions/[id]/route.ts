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
      return NextResponse.json({
        success: false,
        error: 'No autorizado',
        code: 'UNAUTHORIZED',
        details: 'Debe iniciar sesión para actualizar instituciones'
      }, { status: 401 });
    }

    const institutionId = params.id;

    // Validar ID de institución
    const { validateInstitutionId } = await import('@/features/institutions/utils/institution-validation');
    const idValidation = validateInstitutionId(institutionId);
    
    if (!idValidation.success) {
      return NextResponse.json({
        success: false,
        error: 'ID de institución inválido',
        code: 'INVALID_ID',
        details: 'El ID proporcionado no tiene un formato válido'
      }, { status: 400 });
    }

    // Parsear y validar el cuerpo de la solicitud
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: 'Datos de solicitud inválidos',
        code: 'INVALID_JSON',
        details: 'El cuerpo de la solicitud debe ser JSON válido'
      }, { status: 400 });
    }

    // Validación con Zod
    const { institutionSchema } = await import('@/features/institutions/utils/institution-validation');
    const validation = institutionSchema.safeParse(body);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach(issue => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });

      return NextResponse.json({
        success: false,
        error: 'Datos de validación inválidos',
        code: 'VALIDATION_ERROR',
        details: 'Por favor, corrija los errores en el formulario',
        fieldErrors
      }, { status: 400 });
    }

    const { name, address, phone, email } = validation.data;

    // Crear cliente de Supabase
    const supabase = createClient();

    // Verificar que la institución existe y obtener datos actuales
    const { data: existingInstitution, error: checkError } = await supabase
      .from('institutions')
      .select('id, name, email')
      .eq('id', institutionId)
      .single();

    if (checkError || !existingInstitution) {
      return NextResponse.json({
        success: false,
        error: 'Institución no encontrada',
        code: 'NOT_FOUND',
        details: 'La institución que intenta actualizar no existe'
      }, { status: 404 });
    }

    // Verificar permisos del usuario
    const { data: userData } = await supabase
      .from('users')
      .select('role, institution_id')
      .eq('id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND',
        details: 'No se pudo verificar los permisos del usuario'
      }, { status: 403 });
    }

    // Solo admin y director pueden actualizar instituciones
    // Director solo puede actualizar su propia institución
    const canUpdate = userData.role === 'admin' || 
      (userData.role === 'director' && userData.institution_id === institutionId);

    if (!canUpdate) {
      return NextResponse.json({
        success: false,
        error: 'Sin permisos para actualizar esta institución',
        code: 'FORBIDDEN',
        details: 'No tiene permisos suficientes para realizar esta acción'
      }, { status: 403 });
    }

    // Verificar que no exista otra institución con el mismo nombre
    if (name !== existingInstitution.name) {
      const { data: duplicateInstitution } = await supabase
        .from('institutions')
        .select('id, name')
        .ilike('name', name)
        .neq('id', institutionId)
        .single();

      if (duplicateInstitution) {
        return NextResponse.json({
          success: false,
          error: 'Ya existe otra institución con ese nombre',
          code: 'DUPLICATE_NAME',
          details: `La institución "${duplicateInstitution.name}" ya existe en el sistema`,
          fieldErrors: {
            name: 'Ya existe otra institución con este nombre'
          }
        }, { status: 409 });
      }
    }

    // Verificar que el email no esté siendo usado por otra institución
    if (email && email !== existingInstitution.email) {
      const { data: duplicateEmail } = await supabase
        .from('institutions')
        .select('id, name')
        .eq('email', email)
        .neq('id', institutionId)
        .single();

      if (duplicateEmail) {
        return NextResponse.json({
          success: false,
          error: 'El email ya está siendo usado por otra institución',
          code: 'DUPLICATE_EMAIL',
          details: `El email ${email} ya está registrado para "${duplicateEmail.name}"`,
          fieldErrors: {
            email: 'Este email ya está siendo usado por otra institución'
          }
        }, { status: 409 });
      }
    }

    // Actualizar la institución
    const { data: updatedInstitution, error: updateError } = await supabase
      .from('institutions')
      .update({
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', institutionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating institution:', updateError);
      
      // Manejar errores específicos de la base de datos
      if (updateError.code === '23505') { // Unique constraint violation
        return NextResponse.json({
          success: false,
          error: 'Ya existe una institución con estos datos',
          code: 'DUPLICATE_CONSTRAINT',
          details: 'Los datos proporcionados ya existen en el sistema'
        }, { status: 409 });
      }

      return NextResponse.json({
        success: false,
        error: 'Error al actualizar la institución',
        code: 'DATABASE_ERROR',
        details: 'Ocurrió un error al guardar los cambios. Por favor, inténtelo de nuevo'
      }, { status: 500 });
    }

    // Log de auditoría
    console.log(`Institution updated: ${institutionId} by user: ${userId}`);

    return NextResponse.json({
      success: true,
      data: updatedInstitution,
      message: 'Institución actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error in institution update API:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
      details: 'Ocurrió un error inesperado. Por favor, contacte al soporte técnico'
    }, { status: 500 });
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