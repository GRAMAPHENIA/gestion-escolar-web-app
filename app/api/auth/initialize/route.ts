import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Crear cliente de Supabase
    const supabase = createClient();

    // Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', user.id)
      .single();

    if (existingUser) {
      // Usuario ya existe, devolver sus datos
      return NextResponse.json({
        success: true,
        user: existingUser,
        message: 'Usuario ya registrado',
      });
    }

    // Determinar rol inicial
    // El primer usuario será admin, los demás serán users por defecto
    const { data: userCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    const isFirstUser = (userCount || 0) === 0;
    const initialRole = isFirstUser ? 'admin' : 'user';
    const initialPermissions = isFirstUser 
      ? ['manage_institutions', 'export_data', 'delete_institutions']
      : ['view_institutions'];

    // Crear nuevo usuario
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        clerk_id: user.id,
        role: initialRole,
        permissions: initialPermissions,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { success: false, message: 'Error al crear usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      message: isFirstUser 
        ? 'Usuario administrador creado exitosamente' 
        : 'Usuario registrado exitosamente',
      isFirstUser,
    });

  } catch (error) {
    console.error('Error in user initialization:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}