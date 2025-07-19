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

interface SubjectFormProps {
  subject?: {
    id: string
    name: string
    course_id: string
  }
  courseId?: string
  onCancel?: () => void
  onSuccess?: () => void
}

interface Course {
  id: string
  name: string
  institution: {
    name: string
  }
}

export function SubjectForm({ subject, courseId, onCancel, onSuccess }: SubjectFormProps) {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [formData, setFormData] = useState({
    name: subject?.name || "",
    course_id: subject?.course_id || courseId || "",
  })

  useEffect(() => {
    if (!courseId) {
      loadCourses()
    }
  }, [courseId])

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
      const subjectData = {
        name: formData.name,
        course_id: formData.course_id,
      }

      if (subject) {
        // Actualizar materia existente
        const { error } = await supabase.from("subjects").update(subjectData).eq("id", subject.id)

        if (error) throw error
      } else {
        // Crear nueva materia
        const { error } = await supabase.from("subjects").insert(subjectData)

        if (error) throw error
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/materias")
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving subject:", error)
      alert("Error al guardar la materia")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{subject ? "Editar Materia" : "Nueva Materia"}</CardTitle>
        <CardDescription>
          {subject ? "Modifica los datos de la materia" : "Completa los datos para crear una nueva materia"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Materia *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Matemáticas, Lengua, Historia"
              required
            />
          </div>

          {!courseId && (
            <div className="space-y-2">
              <Label htmlFor="course">Curso *</Label>
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
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading || !formData.course_id} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {subject ? "Actualizar" : "Crear"} Materia
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
