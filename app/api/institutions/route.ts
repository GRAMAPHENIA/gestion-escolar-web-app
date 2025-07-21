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
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar permisos (solo admin y director pueden crear instituciones)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['admin', 'director'].includes(userData.role)) {
      return NextResponse.json({ error: 'Sin permisos para crear instituciones' }, { status: 403 })
    }

    const body = await request.json()
    const { name, address, phone, email } = body

    // Validación básica
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'El nombre es requerido y debe tener al menos 2 caracteres' }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'El nombre no puede exceder 100 caracteres' }, { status: 400 })
    }

    if (address && address.length > 200) {
      return NextResponse.json({ error: 'La dirección no puede exceder 200 caracteres' }, { status: 400 })
    }

    if (phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(phone)) {
      return NextResponse.json({ error: 'Formato de teléfono inválido' }, { status: 400 })
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 })
    }

    // Verificar que no exista una institución con el mismo nombre
    const { data: existingInstitution } = await supabase
      .from('institutions')
      .select('id')
      .ilike('name', name.trim())
      .single()

    if (existingInstitution) {
      return NextResponse.json({ error: 'Ya existe una institución con ese nombre' }, { status: 409 })
    }

    // Crear la institución
    const { data: newInstitution, error } = await supabase
      .from('institutions')
      .insert({
        name: name.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating institution:', error)
      return NextResponse.json({ error: 'Error al crear la institución' }, { status: 500 })
    }

    return NextResponse.json(newInstitution, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}