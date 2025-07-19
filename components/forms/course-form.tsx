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

interface CourseFormProps {
  course?: {
    id: string
    name: string
    description: string | null
    year: number | null
    institution_id: string
  }
  onCancel?: () => void
}

interface Institution {
  id: string
  name: string
}

export function CourseForm({ course, onCancel }: CourseFormProps) {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [formData, setFormData] = useState({
    name: course?.name || "",
    description: course?.description || "",
    year: course?.year?.toString() || "",
    institution_id: course?.institution_id || "",
  })

  useEffect(() => {
    loadInstitutions()
  }, [])

  const loadInstitutions = async () => {
    const { data } = await supabase.from("institutions").select("id, name").order("name")
    setInstitutions(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const courseData = {
        name: formData.name,
        description: formData.description || null,
        year: formData.year ? Number.parseInt(formData.year) : null,
        institution_id: formData.institution_id,
      }

      if (course) {
        // Actualizar curso existente
        const { error } = await supabase.from("courses").update(courseData).eq("id", course.id)

        if (error) throw error
      } else {
        // Crear nuevo curso
        const { error } = await supabase.from("courses").insert(courseData)

        if (error) throw error
      }

      router.push("/cursos")
      router.refresh()
    } catch (error) {
      console.error("Error saving course:", error)
      alert("Error al guardar el curso")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{course ? "Editar Curso" : "Nuevo Curso"}</CardTitle>
        <CardDescription>
          {course ? "Modifica los datos del curso" : "Completa los datos para crear un nuevo curso"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Curso *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: 1° Año A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">Institución *</Label>
            <Select
              value={formData.institution_id}
              onValueChange={(value) => setFormData({ ...formData, institution_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una institución" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((institution) => (
                  <SelectItem key={institution.id} value={institution.id}>
                    {institution.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Año Lectivo</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="Ej: 2024"
              min="2020"
              max="2030"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción opcional del curso"
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading || !formData.institution_id} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {course ? "Actualizar" : "Crear"} Curso
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
