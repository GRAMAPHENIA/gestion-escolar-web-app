"use client"

import { SignIn } from "@clerk/nextjs"
import { GraduationCap } from "lucide-react"
import { useTheme } from "next-themes"
import { getClerkConfig } from "@/lib/clerk-config"

export function LoginPage() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Header con logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gestión Escolar</h1>
          <p className="text-gray-600 dark:text-gray-400">Accede a tu sistema de gestión educativa</p>
        </div>

        {/* Componente de login de Clerk con configuración personalizada */}
        <div className="flex justify-center">
          <SignIn
            appearance={getClerkConfig(isDark).appearance}
            redirectUrl="/dashboard"
            signUpUrl="/registro"
            routing="path"
            path="/"
          />
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>¿Necesitas ayuda? Contacta al administrador del sistema</p>
        </div>
      </div>
    </div>
  )
}
