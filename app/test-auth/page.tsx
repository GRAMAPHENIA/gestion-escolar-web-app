import { currentUser } from "@clerk/nextjs/server"
import { UserInfo } from "@/components/auth/user-info"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"

/**
 * Página para probar la configuración de autenticación
 */
export default async function TestAuthPage() {
  const user = await currentUser()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Test de Autenticación</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Página para verificar que la configuración de Clerk funciona correctamente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estado de autenticación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {user ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Estado de Autenticación
              </CardTitle>
              <CardDescription>{user ? "Usuario autenticado correctamente" : "Usuario no autenticado"}</CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">ID:</span> {user.id}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {user.primaryEmailAddress?.emailAddress}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Nombre:</span> {user.firstName} {user.lastName}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No hay usuario autenticado. Esto no debería pasar si llegaste aquí.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Información detallada del usuario */}
          <UserInfo />
        </div>

        {/* Variables de entorno */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Configuración de Variables de Entorno</CardTitle>
            <CardDescription>Estado de las variables de entorno de Clerk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</span>
              </div>
              <div className="flex items-center gap-2">
                {process.env.CLERK_SECRET_KEY ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">CLERK_SECRET_KEY</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
