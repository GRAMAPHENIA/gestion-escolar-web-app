import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

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

    // Crear cliente de Supabase
    const supabase = createClient();

    // Verificar si existen usuarios en el sistema
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error checking users:', error);
      return NextResponse.json(
        { success: false, message: 'Error al verificar usuarios' },
        { status: 500 }
      );
    }

    const isFirstUser = !users || users.length === 0;

    return NextResponse.json({
      success: true,
      isFirstUser,
      totalUsers: users?.length || 0,
    });

  } catch (error) {
    console.error('Error in check-first-user API:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}