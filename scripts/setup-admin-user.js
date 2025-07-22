/**
 * Script para configurar el usuario administrador inicial
 * 
 * Este script debe ejecutarse una sola vez después de desplegar la aplicación
 * para configurar el primer usuario administrador.
 * 
 * Uso:
 * node scripts/setup-admin-user.js CLERK_USER_ID
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdminUser() {
  try {
    // Obtener el ID de Clerk del argumento de línea de comandos
    const clerkUserId = process.argv[2];
    
    if (!clerkUserId) {
      console.error('Error: Debes proporcionar un ID de usuario de Clerk');
      console.error('Uso: node scripts/setup-admin-user.js CLERK_USER_ID');
      process.exit(1);
    }

    console.log(`Configurando usuario administrador con Clerk ID: ${clerkUserId}`);

    // Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, role')
      .eq('clerk_id', clerkUserId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error al verificar usuario existente:', checkError);
      process.exit(1);
    }

    if (existingUser) {
      // Actualizar usuario existente
      const { data, error } = await supabase
        .from('users')
        .update({
          role: 'admin',
          permissions: ['manage_institutions', 'export_data', 'delete_institutions'],
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', clerkUserId)
        .select();

      if (error) {
        console.error('Error al actualizar usuario:', error);
        process.exit(1);
      }

      console.log('✅ Usuario administrador actualizado exitosamente:', data);
    } else {
      // Crear nuevo usuario
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_id: clerkUserId,
          role: 'admin',
          permissions: ['manage_institutions', 'export_data', 'delete_institutions'],
        })
        .select();

      if (error) {
        console.error('Error al crear usuario:', error);
        process.exit(1);
      }

      console.log('✅ Usuario administrador creado exitosamente:', data);
    }

  } catch (error) {
    console.error('Error inesperado:', error);
    process.exit(1);
  }
}

setupAdminUser();