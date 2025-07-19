"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@clerk/nextjs"

interface InstitutionFormProps {
  institution?: {
    id: string
    name: string
    address: string | null
    phone: string | null
    email: string | null
    type: string | null
  }
  onCancel?: () => void
}

export function InstitutionForm({ institution, onCancel }: InstitutionFormProps) {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: institution?.name || "",
    address: institution?.address || "",
    phone: institution?.phone || "",
    email: institution?.email || "",
    type: institution?.type || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      // Obtener el usuario de Supabase
      const { data: supabaseUser } = await supabase.from("users").select("id").eq("clerk_id", user.id).single()

      if (!supabaseUser) {
        throw new Error("Usuario no encontrado en Supabase")
      }

      if (institution) {
        // Actualizar institución existente
        const { error } = await supabase
          .from("institutions")
          .update({
            name: formData.name,
            address: formData.address || null,
            phone: formData.phone || null,
            email: formData.email || null,
            type: formData.type || null,
          })
          .eq("id", institution.id)

        if (error) throw error
      } else {
        // Crear nueva institución
        const { error } = await supabase.from("institutions").insert({
          name: formData.name,
          address: formData.address || null,
          phone: formData.phone || null,
          email: formData.email || null,
          type: formData.type || null,
          created_by: supabaseUser.id,
        })

        if (error) throw error
      }

      router.push("/instituciones")
      router.refresh()
    } catch (error) {
      console.error("Error saving institution:", error)
      alert("Error al guardar la institución")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{institution ? "Editar Institución" : "Nueva Institución"}</CardTitle>
        <CardDescription>
          {institution ? "Modifica los datos de la institución" : "Completa los datos para crear una nueva institución"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Institución *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Colegio San Martín"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Institución</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primario">Primario</SelectItem>
                <SelectItem value="secundario">Secundario</SelectItem>
                <SelectItem value="terciario">Terciario</SelectItem>
                <SelectItem value="universitario">Universitario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Dirección completa de la institución"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej: +54 11 4567-8900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contacto@institucion.edu.ar"
              />
            </div>
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
                  {institution ? "Actualizar" : "Crear"} Institución
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
