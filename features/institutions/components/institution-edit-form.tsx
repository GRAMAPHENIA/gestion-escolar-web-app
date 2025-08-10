"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Save, X, AlertCircle, Building2 } from "lucide-react";
import { useInstitution } from "../hooks/use-institution";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { Institution, InstitutionFormData } from "../types";

interface InstitutionEditFormProps {
  institutionId: string;
}

export function InstitutionEditForm({ institutionId }: InstitutionEditFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const { institution, loading: fetchLoading, error: fetchError } = useInstitution(institutionId);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [formData, setFormData] = useState<InstitutionFormData>({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  // Detectar cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { confirmNavigation } = useUnsavedChanges({ 
    hasUnsavedChanges,
    message: "¿Estás seguro de que quieres salir? Los cambios no guardados se perderán."
  });

  // Actualizar formData cuando se carga la institución
  useEffect(() => {
    if (institution) {
      const newFormData = {
        name: institution.name,
        address: institution.address || "",
        phone: institution.phone || "",
        email: institution.email || "",
      };
      setFormData(newFormData);
      setHasUnsavedChanges(false);
    }
  }, [institution]);

  // Detectar cambios en el formulario
  useEffect(() => {
    if (institution) {
      const hasChanges = 
        formData.name !== institution.name ||
        formData.address !== (institution.address || "") ||
        formData.phone !== (institution.phone || "") ||
        formData.email !== (institution.email || "");
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, institution]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    } else if (formData.name.length > 100) {
      newErrors.name = "El nombre no puede exceder 100 caracteres";
    }

    // Validar dirección
    if (formData.address && formData.address.length > 200) {
      newErrors.address = "La dirección no puede exceder 200 caracteres";
    }

    // Validar teléfono
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Formato de teléfono inválido";
    }

    // Validar email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Debes estar autenticado para realizar esta acción");
      return;
    }

    if (!institution) {
      toast.error("No se pudo cargar la información de la institución");
      return;
    }

    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/institutions/${institution.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la institución');
      }

      const updatedInstitution = await response.json();
      
      toast.success('Institución actualizada exitosamente');
      setHasUnsavedChanges(false);
      
      // Redirigir a la vista de detalle
      router.push(`/dashboard/instituciones/${institution.id}`);
      router.refresh();

    } catch (error) {
      console.error('Error updating institution:', error);
      toast.error(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof InstitutionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    } else {
      router.push(`/dashboard/instituciones/${institutionId}`);
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    router.push(`/dashboard/instituciones/${institutionId}`);
  };

  // Estados de carga y error
  if (fetchLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Cargando institución...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (fetchError) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error al cargar la institución
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {fetchError}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/instituciones')}
            >
              Volver a Instituciones
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!institution) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Institución no encontrada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No se pudo encontrar la institución solicitada.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/instituciones')}
            >
              Volver a Instituciones
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Editar Institución
          </CardTitle>
          <CardDescription>
            Modifica los datos de "{institution.name}"
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre de la Institución <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Universidad Nacional de Buenos Aires"
                disabled={loading}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Dirección completa de la institución"
                rows={3}
                disabled={loading}
                className={errors.address ? 'border-destructive' : ''}
              />
              {errors.address && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.address}
                </p>
              )}
            </div>

            {/* Teléfono y Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Ej: +54 11 4567-8900"
                  disabled={loading}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contacto@institucion.edu.ar"
                  disabled={loading}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Información adicional */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Los campos marcados con <span className="text-destructive">*</span> son obligatorios.
                {hasUnsavedChanges && (
                  <span className="block mt-1 font-medium text-amber-600 dark:text-amber-400">
                    Tienes cambios sin guardar.
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={loading || !hasUnsavedChanges}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para cancelar */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar. Si continúas, estos cambios se perderán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-destructive hover:bg-destructive/90">
              Descartar cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}