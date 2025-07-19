"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import { BarChart3, Download, Users } from "lucide-react"
import { supabase } from "@/lib/supabase-updated"

interface CoursePerformanceData {
  curso: string
  promedio: number
  alumnos: number
  notas: number
  institucion: string
}

interface CoursePerformanceChartProps {
  className?: string
}

export function CoursePerformanceChart({ className }: CoursePerformanceChartProps) {
  const [data, setData] = useState<CoursePerformanceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCoursePerformance()
  }, [])

  const loadCoursePerformance = async () => {
    try {
      // Query courses with their grades and student counts
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          id,
          name,
          institution_id,
          institutions!inner(name),
          students(id),
          subjects(
            id,
            grades(grade)
          )
        `)

      if (coursesError) throw coursesError

      const chartData: CoursePerformanceData[] = coursesData
        ?.map((course: any) => {
          // Calculate average grade for this course
          const allGrades = course.subjects?.flatMap((subject: any) => 
            subject.grades?.map((g: any) => g.grade).filter((g: any) => g !== null) || []
          ) || []
          
          const averageGrade = allGrades.length > 0 
            ? allGrades.reduce((sum: number, grade: number) => sum + grade, 0) / allGrades.length 
            : 0

          return {
            curso: course.name,
            promedio: Number(averageGrade.toFixed(2)),
            alumnos: course.students?.length || 0,
            notas: allGrades.length,
            institucion: course.institutions?.name || 'Sin institución',
          }
        })
        .filter((course: CoursePerformanceData) => course.notas > 0) // Only courses with grades
        .sort((a: CoursePerformanceData, b: CoursePerformanceData) => b.promedio - a.promedio) // Sort by average desc
        .slice(0, 8) || [] // Top 8 courses

      setData(chartData)
    } catch (error) {
      console.error("Error loading course performance:", error || "Unknown error")
      setData([]) // Set empty data on error
    } finally {
      setLoading(false)
    }
  }

  const getBarColor = (promedio: number) => {
    if (promedio >= 8) return "#10B981" // Verde
    if (promedio >= 7) return "#F59E0B" // Amarillo
    if (promedio >= 6) return "#F97316" // Naranja
    return "#EF4444" // Rojo
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{data.institucion}</p>
          <div className="space-y-1">
            <p className="text-blue-600 dark:text-blue-400">
              Promedio: <span className="font-semibold">{data.promedio.toFixed(2)}</span>
            </p>
            <p className="text-green-600 dark:text-green-400">
              Alumnos: <span className="font-semibold">{data.alumnos}</span>
            </p>
            <p className="text-purple-600 dark:text-purple-400">
              Calificaciones: <span className="font-semibold">{data.notas}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const exportChart = () => {
    console.log("Exportando gráfico de rendimiento por curso...")
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Rendimiento por Curso
            </CardTitle>
            <CardDescription>Comparativa de promedios entre diferentes cursos</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportChart}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Cargando datos...</div>
          </div>
        ) : data.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="curso"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} className="text-gray-600 dark:text-gray-400" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="promedio" name="Promedio" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.promedio)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-gray-500">
            <Users className="h-12 w-12 mb-4 opacity-50" />
            <p>No hay datos suficientes para mostrar el rendimiento</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
