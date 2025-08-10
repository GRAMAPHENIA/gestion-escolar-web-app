import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase-updated'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Calcular offset para paginación
    const offset = (page - 1) * limit

    // Construir query base
    let query = supabase
      .from('institutions')
      .select(`
        *,
        courses:courses(count),
        students:courses(students(count)),
        professors:users!users_institution_id_fkey(count)
      `, { count: 'exact' })

    // Aplicar filtro de búsqueda
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Aplicar filtro de fechas
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // Aplicar ordenamiento
    const validSortFields = ['name', 'created_at']
    const validSortOrders = ['asc', 'desc']
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    }

    // Aplicar paginación
    query = query.range(offset, offset + limit - 1)

    const { data: institutions, error, count } = await query

    if (error) {
      console.error('Error fetching institutions:', error)
      return NextResponse.json({ error: 'Error al obtener instituciones' }, { status: 500 })
    }

    // Procesar datos para incluir conteos
    const processedInstitutions = institutions?.map(institution => ({
      ...institution,
      courses_count: institution.courses?.[0]?.count || 0,
      students_count: institution.students?.reduce((total: number, course: any) => 
        total + (course.students?.[0]?.count || 0), 0) || 0,
      professors_count: institution.professors?.[0]?.count || 0
    })) || []

    return NextResponse.json({
      institutions: processedInstitutions,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ 
        error: 'No autorizado',
        code: 'UNAUTHORIZED',
        details: 'Debe iniciar sesión para crear instituciones'
      }, { status: 401 })
    }

    // Verificar permisos (solo admin y director pueden crear instituciones)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['admin', 'director'].includes(userData.role)) {
      return NextResponse.json({ 
        error: 'Sin permisos para crear instituciones',
        code: 'FORBIDDEN',
        details: 'Solo administradores y directores pueden crear instituciones'
      }, { status: 403 })
    }

    // Parsear y validar el cuerpo de la solicitud
    let body;
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Datos de solicitud inválidos',
        code: 'INVALID_JSON',
        details: 'El cuerpo de la solicitud debe ser JSON válido'
      }, { status: 400 })
    }

    // Validación con Zod
    const { institutionSchema, validationMessages } = await import('@/features/institutions/utils/institution-validation')
    const validation = institutionSchema.safeParse(body)

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.issues.forEach(issue => {
        const field = issue.path[0] as string
        fieldErrors[field] = issue.message
      })

      return NextResponse.json({ 
        error: 'Datos de validación inválidos',
        code: 'VALIDATION_ERROR',
        details: 'Por favor, corrija los errores en el formulario',
        fieldErrors
      }, { status: 400 })
    }

    const { name, address, phone, email } = validation.data

    // Verificar que no exista una institución con el mismo nombre (case-insensitive)
    const { data: existingInstitution } = await supabase
      .from('institutions')
      .select('id, name')
      .ilike('name', name)
      .single()

    if (existingInstitution) {
      return NextResponse.json({ 
        error: 'Ya existe una institución con ese nombre',
        code: 'DUPLICATE_NAME',
        details: `La institución "${existingInstitution.name}" ya existe en el sistema`,
        fieldErrors: {
          name: 'Ya existe una institución con este nombre'
        }
      }, { status: 409 })
    }

    // Validaciones adicionales de negocio
    if (email) {
      // Verificar que el email no esté siendo usado por otra institución
      const { data: existingEmail } = await supabase
        .from('institutions')
        .select('id, name')
        .eq('email', email)
        .single()

      if (existingEmail) {
        return NextResponse.json({ 
          error: 'El email ya está siendo usado por otra institución',
          code: 'DUPLICATE_EMAIL',
          details: `El email ${email} ya está registrado para "${existingEmail.name}"`,
          fieldErrors: {
            email: 'Este email ya está siendo usado por otra institución'
          }
        }, { status: 409 })
      }
    }

    // Crear la institución
    const { data: newInstitution, error } = await supabase
      .from('institutions')
      .insert({
        name,
        address: address || null,
        phone: phone || null,
        email: email || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating institution:', error)
      
      // Manejar errores específicos de la base de datos
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ 
          error: 'Ya existe una institución con estos datos',
          code: 'DUPLICATE_CONSTRAINT',
          details: 'Los datos proporcionados ya existen en el sistema'
        }, { status: 409 })
      }

      return NextResponse.json({ 
        error: 'Error al crear la institución',
        code: 'DATABASE_ERROR',
        details: 'Ocurrió un error al guardar los datos. Por favor, inténtelo de nuevo'
      }, { status: 500 })
    }

    // Log de auditoría
    console.log(`Institution created: ${newInstitution.id} by user: ${user.id}`)

    return NextResponse.json({
      success: true,
      data: newInstitution,
      message: 'Institución creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in POST /api/institutions:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
      details: 'Ocurrió un error inesperado. Por favor, contacte al soporte técnico'
    }, { status: 500 })
  }
}