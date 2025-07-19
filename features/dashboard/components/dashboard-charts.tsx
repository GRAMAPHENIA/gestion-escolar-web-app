"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, BookOpen } from "lucide-react"
import { supabase } from "@/lib/supabase-updated"

interface CourseStats {
  course_id: string
  course_name: string
  institution_name: string
  student_count: number
  average_grade: number | null
  total_grades: number
}

export function DashboardCharts() {
  const [courseStats, setCourseStats] = useState<CourseStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourseStats()
  }, [])

  const loadCourseStats = async () => {
    try {
      const { data, error } = await supabase.rpc("get_course_statistics")

      if (error) throw error

      setCourseStats(data || [])
    } catch (error) {
      console.error("Error loading course stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    if (grade >= 7) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (grade >= 4) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Estadísticas por Curso
        </CardTitle>
        <CardDescription>Rendimiento académico y estadísticas de cada curso</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courseStats.length > 0 ? (
            courseStats.map((course) => (
              <div key={course.course_id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{course.course_name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{course.institution_name}</p>
                  </div>
                  {course.average_grade && (
                    <Badge className={getGradeColor(course.average_grade)}>
                      Promedio: {course.average_grade.toFixed(1)}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {course.student_count} {course.student_count === 1 ? "alumno" : "alumnos"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {course.total_grades} {course.total_grades === 1 ? "nota" : "notas"}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso visual del promedio */}
                {course.average_grade && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          course.average_grade >= 7
                            ? "bg-green-500"
                            : course.average_grade >= 4
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${(course.average_grade / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay estadísticas disponibles</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
