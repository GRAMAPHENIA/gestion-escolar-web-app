"use client"

import type React from "react"

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Componente para proteger rutas que requieren autenticación
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/")
    }
  }, [isLoaded, isSignedIn, router])

  // Mostrar loading mientras se carga la autenticación
  if (!isLoaded) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Verificando autenticación...</p>
          </div>
        </div>
      )
    )
  }

  // Si no está autenticado, no mostrar nada (se redirige)
  if (!isSignedIn) {
    return null
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>
}
