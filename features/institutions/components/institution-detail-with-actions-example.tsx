'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { InstitutionDetail } from './institution-detail';
import { InstitutionDeleteDialog } from './institution-delete-dialog';
import { useInstitutions } from '../hooks/use-institutions';
import { useInstitutionStats } from '../hooks/use-institution-stats';
import { Institution } from '../types';

interface InstitutionDetailWithActionsExampleProps {
  institution: Institution;
}

/**
 * Example component showing how to integrate InstitutionDetail with InstitutionDeleteDialog
 * and handle edit/delete actions
 */
export function InstitutionDetailWithActionsExample({
  institution,
}: InstitutionDetailWithActionsExampleProps) {
  const router = useRouter();
  const { deleteInstitution, loading: deleteLoading, error: deleteError } = useInstitutions();
  const { stats, loading: statsLoading, error: statsError } = useInstitutionStats();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Handle edit action
  const handleEdit = () => {
    router.push(`/dashboard/instituciones/${institution.id}/editar`);
  };

  // Handle delete action
  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async (institutionId: string, options?: any) => {
    try {
      await deleteInstitution(institutionId);
      
      toast.success('Institución eliminada exitosamente', {
        description: `La institución "${institution.name}" ha sido eliminada.`,
      });
      
      // Close dialog and redirect
      setShowDeleteDialog(false);
      router.push('/dashboard/instituciones');
      
    } catch (error) {
      // Error is already handled by the hook and shown in the dialog
      console.error('Error deleting institution:', error);
    }
  };

  return (
    <div className="space-y-6">
      <InstitutionDetail
        institution={institution}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <InstitutionDeleteDialog
        institution={institution}
        stats={stats}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        error={deleteError}
      />

      {/* Debug Information */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Estado de la Integración:</h3>
        <div className="space-y-1 text-sm">
          <p><strong>Institución:</strong> {institution.name}</p>
          <p><strong>Estadísticas cargando:</strong> {statsLoading ? 'Sí' : 'No'}</p>
          <p><strong>Error en estadísticas:</strong> {statsError || 'Ninguno'}</p>
          <p><strong>Eliminación en progreso:</strong> {deleteLoading ? 'Sí' : 'No'}</p>
          <p><strong>Error en eliminación:</strong> {deleteError || 'Ninguno'}</p>
          <p><strong>Diálogo de eliminación abierto:</strong> {showDeleteDialog ? 'Sí' : 'No'}</p>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Funcionalidades Implementadas:</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li><strong>Vista detallada:</strong> Información completa de la institución con estadísticas</li>
          <li><strong>Estadísticas en tiempo real:</strong> Cursos, estudiantes y profesores actualizados</li>
          <li><strong>Actividad reciente:</strong> Timeline de eventos importantes</li>
          <li><strong>Acciones de edición:</strong> Botón para navegar a la página de edición</li>
          <li><strong>Eliminación segura:</strong> Diálogo de confirmación con advertencias</li>
          <li><strong>Validación de eliminación:</strong> Requiere escribir el nombre de la institución</li>
          <li><strong>Opciones avanzadas:</strong> Eliminación suave y transferencia de datos</li>
          <li><strong>Estados de carga:</strong> Indicadores visuales durante operaciones</li>
          <li><strong>Manejo de errores:</strong> Mensajes claros y opciones de recuperación</li>
          <li><strong>Navegación automática:</strong> Redirección después de eliminar</li>
        </ul>
      </div>
    </div>
  );
}