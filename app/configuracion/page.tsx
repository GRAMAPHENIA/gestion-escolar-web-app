import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Settings, Database, Shield, Palette } from "lucide-react"

/**
 * Página de configuración del sistema
 */
export default function ConfiguracionPage() {
  // Verificar configuraciones
  const clerkConfigured = !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)

  const configurations = [
    {
      name: "Autenticación (Clerk)",
      status: clerkConfigured,
      description: "Sistema de autenticación configurado",
      icon: Shield,
    },
    {
      name: "Base de datos",
      status: false, // Se actualizará cuando se configure
      description: "Conexión a base de datos",
      icon: Database,
    },
    {
      name: "Tema personalizado",
      status: true,
      description: "Colores y estilos personalizados",
      icon: Palette,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración del Sistema</h1>
        <p className="text-gray-600 dark:text-gray-400">Estado actual de la configuración de la aplicación</p>
      </div>

      {/* Estado general */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Estado General
          </CardTitle>
          <CardDescription>Resumen del estado de configuración</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {configurations.map((config) => (
              <div key={config.name} className="flex items-center space-x-3 p-3 border rounded-lg">
                <config.icon className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{config.name}</span>
                    {config.status ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{config.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalles de Clerk */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Clerk</CardTitle>
          <CardDescription>Detalles de la configuración de autenticación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Clave pública configurada</span>
              <Badge variant={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "default" : "destructive"}>
                {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Sí" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Clave secreta configurada</span>
              <Badge variant={process.env.CLERK_SECRET_KEY ? "default" : "destructive"}>
                {process.env.CLERK_SECRET_KEY ? "Sí" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">URLs de redirección</span>
              <Badge variant="default">Configuradas</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximos pasos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Pasos</CardTitle>
          <CardDescription>Configuraciones pendientes para completar el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Configurar base de datos (Supabase/Neon)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Implementar roles de usuario</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Configurar webhooks de Clerk</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Implementar sistema de permisos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
