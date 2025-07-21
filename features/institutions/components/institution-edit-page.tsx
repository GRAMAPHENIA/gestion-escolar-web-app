'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InstitutionForm } from '@/components/forms/institution-form';
import { Institution } from '../types';

interface InstitutionEditPageProps {
  institutionId: string;
}

export function InstitutionEditPage({ institutionId }: InstitutionEditPageProps) {
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    loadInstitution();
    checkPermissions();
  }, [institutionId]);

  const loadInstitution = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/institutions/${institutionId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Institución no encontrada');
        }
        throw new Error('Error al cargar la institución');
      }

      const institutionData = await response.json();
      setInstitution(institutionData);

    } catch (error) {
      console.error('Error loading institution:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const response = await fetch('/api/auth/permissions');
      if (response.ok) {
        const data = await response.json();
        setCanManage(data.canManage || false);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const handleSuccess = (updatedInstitution: Institution) => {
    toast.success('Institución actualizada exitosamente');
    router.push(`/dashboard/instituciones/${updatedInstitution.id}`);
    router.refresh();
  };

  const handleCancel = () => {
    router.push(`/dashboard/instituciones/${institutionId}`);
  };

  // Verificar permisos
  if (!loading && !canManage) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Sin permisos</p>
            <p className="text-sm">No tienes permisos para editar instituciones.</p>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              Volver
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Cargando datos de la institución...
          </p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Error al cargar la institución</p>
            <p className="text-sm">{error}</p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={loadInstitution}>
                Reintentar
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                Volver
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Estado sin institución
  if (!institution) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Institución no encontrada</p>
            <p className="text-sm">No se pudo encontrar la institución solicitada.</p>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              Volver
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información de la institución actual */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <p className="font-medium">Editando: {institution.name}</p>
            <p className="text-sm text-muted-foreground">
              Los cambios se guardarán inmediatamente al enviar el formulario.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Formulario de edición */}
      <InstitutionForm
        institution={institution}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}