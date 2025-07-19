"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, TrendingUp, TrendingDown, Minus, Download, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase-updated"

interface StudentGrade {
  subject: string
  grades: {
    id: string
    grade: number | null
    date: string
    observation: string | null
  }[]
  average: number | null
}

interface Student {
  id: string
  full_name: string
  course: {
    name: string
  }
}

export function StudentGradesReport() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([])
  const [loading, setLoading] = useState(false)
  const [overallAverage, setOverallAverage] = useState<number | null>(null)

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    if (selectedStudent) {
      loadStudentGrades()
    }
  }, [selectedStudent])

  const loadStudents = async () => {
    const { data } = await supabase
      .from("students")
      .select(
        `
        id,
        full_name,
        courses!inner(name)
      `,
      )
      .order("full_name")

    setStudents(
      data?.map((student) => ({
        id: student.id,
        full_name: student.full_name,
        course: { name: student.courses.name },
      })) || [],
    )
  }

  const loadStudentGrades = async () => {
    if (!selectedStudent) return

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("grades")
        .select(
          `
          id,
          grade,
          date,
          observation,
          subjects!inner(name)
        `,
        )
        .eq("student_id", selectedStudent)
        .order("date", { ascending: false })

      if (error) throw error

      // Agrupar notas por materia
      const gradesBySubject = data?.reduce(
        (acc, grade) => {
          const subjectName = grade.subjects.name
          if (!acc[subjectName]) {
            acc[subjectName] = []
          }
          acc[subjectName].push({
            id: grade.id,
            grade: grade.grade,
            date: grade.date,
            observation: grade.observation,
          })
          return acc
        },
        {} as Record<string, any[]>,
      )

      // Calcular promedios por materia
      const studentGradesData: StudentGrade[] = Object.entries(gradesBySubject || {}).map(([subject, grades]) => {
        const validGrades = grades.filter((g) => g.grade !== null).map((g) => g.grade)
        const average =
          validGrades.length > 0 ? validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length : null

        return {
          subject,
          grades,
          average,
        }
      })

      setStudentGrades(studentGradesData)

      // Calcular promedio general
      const allAverages = studentGradesData.filter((sg) => sg.average !== null).map((sg) => sg.average!)
      const generalAverage =
        allAverages.length > 0 ? allAverages.reduce((sum, avg) => sum + avg, 0) / allAverages.length : null

      setOverallAverage(generalAverage)
    } catch (error) {
      console.error("Error loading student grades:", error)
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

  const getAverageIcon = (average: number | null) => {
    if (average === null) return <Minus className="h-4 w-4" />
    if (average >= 7) return <TrendingUp className="h-4 w-4 text-green-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const selectedStudentData = students.find((s) => s.id === selectedStudent)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Reporte de Notas por Alumno
          </CardTitle>
          <CardDescription>Consulta el historial académico completo de un alumno</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecciona un alumno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} - {student.course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStudent && (
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              )}
            </div>

            {selectedStudentData && overallAverage !== null && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">{selectedStudentData.full_name}</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{selectedStudentData.course.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {getAverageIcon(overallAverage)}
                      <Badge className={getGradeColor(overallAverage)}>
                        Promedio General: {overallAverage.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {selectedStudent && !loading && studentGrades.length > 0 && (
        <div className="space-y-6">
          {studentGrades.map((subjectData) => (
            <Card key={subjectData.subject}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{subjectData.subject}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getAverageIcon(subjectData.average)}
                    <Badge className={getGradeColor(subjectData.average)}>
                      {subjectData.average ? `Promedio: ${subjectData.average.toFixed(2)}` : "Sin promedio"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Calificación</TableHead>
                      <TableHead>Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectData.grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>{new Date(grade.date).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(grade.grade)}>
                            {grade.grade !== null ? grade.grade.toFixed(1) : "Sin calificar"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          {grade.observation || <span className="text-gray-400 italic">Sin observaciones</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedStudent && !loading && studentGrades.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sin calificaciones</h3>
            <p className="text-gray-600 dark:text-gray-400">Este alumno aún no tiene calificaciones registradas</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
