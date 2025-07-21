import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase-updated';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener información del usuario desde Supabase
    const { data: userData, error } = await supabase
      .from('users')
      .select('role, permissions')
      .eq('clerk_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      // Si no existe el usuario en Supabase, asumir permisos básicos
      return NextResponse.json({
        success: true,
        canManage: false,
        canView: true,
        canExport: false,
        role: 'user',
        permissions: [],
      });
    }

    // Determinar permisos basados en el rol
    const role = userData?.role || 'user';
    const permissions = userData?.permissions || [];

    const canManage = ['admin', 'director'].includes(role) || permissions.includes('manage_institutions');
    const canView = true; // Todos los usuarios autenticados pueden ver
    const canExport = ['admin', 'director', 'teacher'].includes(role) || permissions.includes('export_data');
    const canDelete = ['admin'].includes(role) || permissions.includes('delete_institutions');

    return NextResponse.json({
      success: true,
      canManage,
      canView,
      canExport,
      canDelete,
      role,
      permissions,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: user.firstName + ' ' + user.lastName,
      },
    });

  } catch (error) {
    console.error('Error in permissions API:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}