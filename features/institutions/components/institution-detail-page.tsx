'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InstitutionDetail, InstitutionDetailSkeleton } from './institution-detail';
import { InstitutionDeleteDialog, useInstitutionDeleteDialog } from './institution-delete-dialog';
import { Institution } from '../types';
import { useInstitutionStats } from '../hooks/use-institution-stats';

interface InstitutionDetailPageProps {
  institutionId: string;
}

export function InstitutionDetailPage({ institutionId }: InstitutionDetailPageProps) {
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);

  const { stats } = useInstitutionStats();
  const deleteDialog = useInstitutionDeleteDialog();

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

  const handleEdit = () => {
    router.push(`/dashboard/instituciones/${institutionId}/editar`);
  };

  const handleDelete = () => {
    if (institution) {
      deleteDialog.openDialog(institution);
    }
  };

  const performDelete = async (institutionId: string) => {
    try {
      const response = await fetch(`/api/institutions/${institutionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la institución');
      }

      toast.success('Institución eliminada exitosamente');
      router.push('/dashboard/instituciones');
      router.refresh();

    } catch (error) {
      console.error('Error deleting institution:', error);
      throw error; // Re-throw para que el diálogo maneje el error
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Instituciones
          </Button>
        </div>
        
        <InstitutionDetailSkeleton />
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/instituciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Instituciones
            </Link>
          </Button>
        </div>

        {/* Error Alert */}
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
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/instituciones">
                    Volver a la lista
                  </Link>
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Estado sin institución
  if (!institution) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/instituciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Instituciones
            </Link>
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se encontró la institución solicitada.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/instituciones">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Instituciones
          </Link>
        </Button>

        {/* Acciones rápidas */}
        {canManage && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        )}
      </div>

      {/* Componente de detalle */}
      <InstitutionDetail
        institution={institution}
        onEdit={canManage ? handleEdit : undefined}
        onDelete={canManage ? handleDelete : undefined}
      />

      {/* Diálogo de eliminación */}
      <InstitutionDeleteDialog
        institution={deleteDialog.selectedInstitution || institution}
        stats={stats}
        open={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => deleteDialog.handleDelete(performDelete)}
        loading={deleteDialog.loading}
      />
    </div>
  );
}