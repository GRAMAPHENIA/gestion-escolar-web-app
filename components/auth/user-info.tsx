"use client"

import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Shield } from "lucide-react"

/**
 * Componente para mostrar información del usuario actual
 */
export function UserInfo() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información del Usuario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{user.primaryEmailAddress?.emailAddress}</span>
          {user.primaryEmailAddress?.verification?.status === "verified" && (
            <Badge variant="secondary" className="text-xs">
              Verificado
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Miembro desde {new Date(user.createdAt).toLocaleDateString("es-ES")}</span>
        </div>

        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            Última conexión: {new Date(user.lastSignInAt || user.createdAt).toLocaleDateString("es-ES")}
          </span>
        </div>

        {user.firstName && (
          <div>
            <span className="text-sm font-medium">Nombre completo: </span>
            <span className="text-sm">
              {user.firstName} {user.lastName}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
