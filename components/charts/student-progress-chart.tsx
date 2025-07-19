"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { User, Download } from "lucide-react"
import { supabase } from "@/lib/supabase-updated"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface StudentProgress {
  fecha: string
  promedio: number
  nota: number
  materia: string
}

interface Student {
  id: string
  full_name: string
  course_name: string
}

interface StudentProgressChartProps {
  className?: string
}

export function StudentProgressChart({ className }: StudentProgressChartProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [data, setData] = useState<StudentProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    if (selectedStudent) {
      loadStudentProgress()
    }
  }, [selectedStudent])

  const loadStudents = async () => {
    try {
      const { data: studentsData, error } = await supabase
        .from("students")
        .select(`
          id,
          full_name,
          courses!inner(name)
        `)
        .order("full_name")

      if (error) throw error

      const formattedStudents: Student[] =
        studentsData?.map((student) => ({
          id: student.id,
          full_name: student.full_name,
          course_name: student.courses.name,
        })) || []

      setStudents(formattedStudents)

      if (formattedStudents.length > 0 && !selectedStudent) {
        setSelectedStudent(formattedStudents[0].id)
      }
    } catch (error) {
      console.error("Error loading students:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudentProgress = async () => {
    if (!selectedStudent) return

    try {
      const { data: gradesData, error } = await supabase
        .from("grades")
        .select(`
          grade,
          date,
          subjects!inner(name)
        `)
        .eq("student_id", selectedStudent)
        .not("grade", "is", null)
        .order("date")

      if (error) throw error

      // Calcular promedio acumulativo
      let runningSum = 0
      let count = 0

      const progressData: StudentProgress[] =
        gradesData?.map((grade, index) => {
          runningSum += grade.grade
          count++
          const promedio = runningSum / count

          return {
            fecha: format(new Date(grade.date), "dd/MM", { locale: es }),
            promedio: Number(promedio.toFixed(2)),
            nota: grade.grade,
            materia: grade.subjects.name,
          }
        }) || []

      setData(progressData)
    } catch (error) {
      console.error("Error loading student progress:", error)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">Fecha: {label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Materia: {data.materia}</p>
          <p className="text-blue-600 dark:text-blue-400">
            Nota: <span className="font-semibold">{data.nota}</span>
          </p>
          <p className="text-green-600 dark:text-green-400">
            Promedio: <span className="font-semibold">{data.promedio}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const exportChart = () => {
    console.log("Exportando progreso del estudiante...")
  }

  const selectedStudentData = students.find((s) => s.id === selectedStudent)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Progreso Individual
            </CardTitle>
            <CardDescription>
              {selectedStudentData
                ? `Evolución académica de ${selectedStudentData.full_name}`
                : "Selecciona un estudiante para ver su progreso"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Seleccionar estudiante" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name} - {student.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportChart}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
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
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} className="text-gray-600 dark:text-gray-400" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} className="text-gray-600 dark:text-gray-400" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="nota"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  name="Calificación"
                />
                <Line
                  type="monotone"
                  dataKey="promedio"
                  stroke="#F6A03B"
                  strokeWidth={3}
                  dot={{ fill: "#F6A03B", strokeWidth: 2, r: 5 }}
                  name="Promedio Acumulado"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : selectedStudent ? (
          <div className="h-80 flex flex-col items-center justify-center text-gray-500">
            <User className="h-12 w-12 mb-4 opacity-50" />
            <p>Este estudiante no tiene calificaciones registradas</p>
          </div>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-gray-500">
            <User className="h-12 w-12 mb-4 opacity-50" />
            <p>Selecciona un estudiante para ver su progreso</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
