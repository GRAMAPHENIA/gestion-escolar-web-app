"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, FileText, Users, TrendingUp } from "lucide-react"
import { StudentGradesReport } from "@/features/grades/components/student-grades-report"

export function ReportsPage() {
  const reportTypes = [
    {
      title: "Reporte de Notas por Alumno",
      description: "Historial académico completo de un alumno específico",
      icon: Users,
      component: <StudentGradesReport />,
    },
    {
      title: "Estadísticas por Curso",
      description: "Promedios y rendimiento general por curso",
      icon: BarChart3,
      component: <div className="text-center py-12 text-gray-500">Próximamente disponible</div>,
    },
    {
      title: "Reporte de Asistencias",
      description: "Control de asistencias y ausentismo",
      icon: FileText,
      component: <div className="text-center py-12 text-gray-500">Próximamente disponible</div>,
    },
    {
      title: "Análisis de Rendimiento",
      description: "Tendencias y análisis comparativo",
      icon: TrendingUp,
      component: <div className="text-center py-12 text-gray-500">Próximamente disponible</div>,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes y Estadísticas</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Genera reportes detallados y analiza el rendimiento académico
        </p>
      </div>

      {/* Tabs de reportes */}
      <Tabs defaultValue="student-grades" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="student-grades" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Notas por Alumno</span>
          </TabsTrigger>
          <TabsTrigger value="course-stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Por Curso</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Asistencias</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Rendimiento</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="student-grades">
          <StudentGradesReport />
        </TabsContent>

        <TabsContent value="course-stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estadísticas por Curso
              </CardTitle>
              <CardDescription>Análisis de rendimiento y promedios por curso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Próximamente disponible</h3>
                <p>Esta funcionalidad estará disponible en la próxima actualización</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reporte de Asistencias
              </CardTitle>
              <CardDescription>Control y seguimiento de asistencias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Próximamente disponible</h3>
                <p>Esta funcionalidad estará disponible en la próxima actualización</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análisis de Rendimiento
              </CardTitle>
              <CardDescription>Tendencias y análisis comparativo del rendimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Próximamente disponible</h3>
                <p>Esta funcionalidad estará disponible en la próxima actualización</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
