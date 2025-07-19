"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, X } from "lucide-react"
import { supabase } from "@/lib/supabase-updated"
import { useUser } from "@clerk/nextjs"

interface StudentFormProps {
  student?: {
    id: string
    full_name: string
    dni: string | null
    birth_date: string | null
    course_id: string | null
  }
  onCancel?: () => void
}

interface Course {
  id: string
  name: string
  institution: {
    name: string
  }
}

export function StudentForm({ student, onCancel }: StudentFormProps) {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [formData, setFormData] = useState({
    full_name: student?.full_name || "",
    dni: student?.dni || "",
    birth_date: student?.birth_date || "",
    course_id: student?.course_id || "",
  })

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select(
        `
        id,
        name,
        institutions!inner(name)
      `,
      )
      .order("name")

    setCourses(
      data?.map((course) => ({
        id: course.id,
        name: course.name,
        institution: { name: course.institutions.name },
      })) || [],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const studentData = {
        full_name: formData.full_name,
        dni: formData.dni || null,
        birth_date: formData.birth_date || null,
        course_id: formData.course_id || null,
      }

      if (student) {
        // Actualizar alumno existente
        const { error } = await supabase.from("students").update(studentData).eq("id", student.id)

        if (error) throw error
      } else {
        // Crear nuevo alumno
        const { error } = await supabase.from("students").insert(studentData)

        if (error) throw error
      }

      router.push("/alumnos")
      router.refresh()
    } catch (error) {
      console.error("Error saving student:", error)
      alert("Error al guardar el alumno")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{student ? "Editar Alumno" : "Nuevo Alumno"}</CardTitle>
        <CardDescription>
          {student ? "Modifica los datos del alumno" : "Completa los datos para registrar un nuevo alumno"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="Ej: 12345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Curso</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => setFormData({ ...formData, course_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} - {course.institution.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {student ? "Actualizar" : "Registrar"} Alumno
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
