import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

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

    // Crear cliente de Supabase
    const supabase = createClient();

    // Obtener información del usuario desde Supabase
    let { data: userData, error } = await supabase
      .from('users')
      .select('role, permissions')
      .eq('clerk_id', user.id)
      .single();

    // Si el usuario no existe, inicializarlo automáticamente
    if (error && error.code === 'PGRST116') {
      try {
        // Verificar si es el primer usuario (será admin)
        const { data: userCount } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true });

        const isFirstUser = (userCount || 0) === 0;
        const initialRole = isFirstUser ? 'admin' : 'user';
        const initialPermissions = isFirstUser 
          ? ['manage_institutions', 'export_data', 'delete_institutions', 'admin_system']
          : ['manage_institutions', 'view_institutions'];

        // Crear el usuario automáticamente
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            clerk_id: user.id,
            role: initialRole,
            permissions: initialPermissions,
          })
          .select('role, permissions')
          .single();

        if (!createError) {
          userData = newUser;
        } else {
          console.error('Error creating user automatically:', createError);
          // Fallback a permisos básicos
          userData = { role: 'user', permissions: ['view_institutions'] };
        }
      } catch (initError) {
        console.error('Error in auto-initialization:', initError);
        // Fallback a permisos básicos
        userData = { role: 'user', permissions: ['view_institutions'] };
      }
    } else if (error) {
      console.error('Error fetching user data:', error);
      // Fallback a permisos básicos
      userData = { role: 'user', permissions: ['view_institutions'] };
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