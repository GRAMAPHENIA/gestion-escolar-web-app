import { currentUser } from "@clerk/nextjs/server"
import { supabase } from "./supabase-updated"

/**
 * Obtiene o crea un usuario en Supabase basado en Clerk
 */
export async function getOrCreateUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  // Buscar usuario existente
  const { data: existingUser } = await supabase.from("users").select("*").eq("id", clerkUser.id).single()

  if (existingUser) {
    return existingUser
  }

  // Crear nuevo usuario con el mismo ID de Clerk
  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      id: clerkUser.id, // Usar el mismo ID de Clerk
      full_name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
      email: clerkUser.primaryEmailAddress?.emailAddress || "",
      role: "profesor", // rol por defecto
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  return newUser
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function hasRole(role: "admin" | "director" | "profesor") {
  const user = await getOrCreateUser()
  return user?.role === role || user?.role === "admin" // admin tiene todos los permisos
}

/**
 * Verifica si el usuario puede gestionar instituciones
 */
export async function canManageInstitutions() {
  const user = await getOrCreateUser()
  return user?.role === "admin" || user?.role === "director"
}

/**
 * Obtiene la institución del usuario actual
 */
export async function getCurrentUserInstitution() {
  const user = await getOrCreateUser()
  if (!user?.institution_id) return null

  const { data: institution } = await supabase.from("institutions").select("*").eq("id", user.institution_id).single()

  return institution
}
