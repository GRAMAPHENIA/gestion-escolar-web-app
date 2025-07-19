"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, X } from "lucide-react"
import { supabase } from "@/lib/supabase-updated"
import { useUser } from "@clerk/nextjs"

interface GradeFormProps {
  grade?: {
    id: string
    student_id: string
    subject_id: string
    grade: number | null
    observation: string | null
    date: string
  }
  studentId?: string
  subjectId?: string
  onCancel?: () => void
  onSuccess?: () => void
}

interface Student {
  id: string
  full_name: string
  course: {
    name: string
  }
}

interface Subject {
  id: string
  name: string
  course: {
    name: string
  }
}

export function GradeForm({ grade, studentId, subjectId, onCancel, onSuccess }: GradeFormProps) {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [formData, setFormData] = useState({
    student_id: grade?.student_id || studentId || "",
    subject_id: grade?.subject_id || subjectId || "",
    grade: grade?.grade?.toString() || "",
    observation: grade?.observation || "",
    date: grade?.date || new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (!studentId) loadStudents()
    if (!subjectId) loadSubjects()
  }, [studentId, subjectId])

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

  const loadSubjects = async () => {
    const { data } = await supabase
      .from("subjects")
      .select(
        `
        id,
        name,
        courses!inner(name)
      `,
      )
      .order("name")

    setSubjects(
      data?.map((subject) => ({
        id: subject.id,
        name: subject.name,
        course: { name: subject.courses.name },
      })) || [],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const gradeData = {
        student_id: formData.student_id,
        subject_id: formData.subject_id,
        grade: formData.grade ? Number.parseFloat(formData.grade) : null,
        observation: formData.observation || null,
        date: formData.date,
        professor_id: user.id, // El profesor que carga la nota
      }

      if (grade) {
        // Actualizar nota existente
        const { error } = await supabase.from("grades").update(gradeData).eq("id", grade.id)

        if (error) throw error
      } else {
        // Crear nueva nota
        const { error } = await supabase.from("grades").insert(gradeData)

        if (error) throw error
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/notas")
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving grade:", error)
      alert("Error al guardar la nota")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{grade ? "Editar Nota" : "Nueva Nota"}</CardTitle>
        <CardDescription>
          {grade ? "Modifica la calificación del alumno" : "Registra una nueva calificación"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!studentId && (
            <div className="space-y-2">
              <Label htmlFor="student">Alumno *</Label>
              <Select
                value={formData.student_id}
                onValueChange={(value) => setFormData({ ...formData, student_id: value })}
              >
                <SelectTrigger>
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
            </div>
          )}

          {!subjectId && (
            <div className="space-y-2">
              <Label htmlFor="subject">Materia *</Label>
              <Select
                value={formData.subject_id}
                onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} - {subject.course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Calificación</Label>
              <Input
                id="grade"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="Ej: 8.5"
              />
              <p className="text-xs text-gray-500">Escala de 0 a 10</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observaciones</Label>
            <Textarea
              id="observation"
              value={formData.observation}
              onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              placeholder="Observaciones sobre la evaluación (opcional)"
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading || !formData.student_id || !formData.subject_id} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {grade ? "Actualizar" : "Registrar"} Nota
                </>
              )}
            </Button>

            <Button type="button" variant="outline" onClick={onCancel || (() => router.back())}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
