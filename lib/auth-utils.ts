import { currentUser } from "@clerk/nextjs/server"
import { supabase } from "./supabase"

/**
 * Obtiene o crea un usuario en Supabase basado en Clerk
 */
export async function getOrCreateUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  // Buscar usuario existente
  const { data: existingUser } = await supabase.from("users").select("*").eq("clerk_id", clerkUser.id).single()

  if (existingUser) {
    return existingUser
  }

  // Crear nuevo usuario
  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      clerk_id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || "",
      first_name: clerkUser.firstName,
      last_name: clerkUser.lastName,
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
