'use client';

import React, { useState } from 'react';
import { InstitutionDetail } from './institution-detail';
import { InstitutionDeleteDialog, useInstitutionDeleteDialog } from './institution-delete-dialog';
import { Institution } from '../types';
import { useInstitutionStats } from '../hooks/use-institution-stats';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * Example component showing how to use InstitutionDetail and InstitutionDeleteDialog together
 * This demonstrates the integration between detail view and delete functionality
 */
export function InstitutionDetailExample() {
  // Mock institution data
  const [institution] = useState<Institution>({
    id: '1',
    name: 'Universidad Nacional de Ejemplo',
    address: 'Av. Principal 123, Ciudad Ejemplo',
    phone: '+1 234 567 8900',
    email: 'contacto@universidad-ejemplo.edu',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-07-15T14:20:00Z',
  });

  const { stats } = useInstitutionStats();
  const deleteDialog = useInstitutionDeleteDialog();

  const handleEdit = () => {
    toast.info('Función de edición - redirigir a página de edición');
    console.log('Edit institution:', institution.id);
  };

  const handleDelete = () => {
    deleteDialog.openDialog(institution);
  };

  const performDelete = async (institutionId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random success/failure for demo
    if (Math.random() > 0.3) {
      toast.success('Institución eliminada exitosamente');
      console.log('Institution deleted:', institutionId);
    } else {
      throw new Error('Error simulado: No se pudo eliminar la institución');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Ejemplo de Vista Detallada</h1>
        <p className="text-muted-foreground">
          Este ejemplo muestra cómo usar los componentes InstitutionDetail e InstitutionDeleteDialog juntos.
        </p>
      </div>

      {/* Institution Detail Component */}
      <InstitutionDetail
        institution={institution}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Delete Dialog */}
      <InstitutionDeleteDialog
        institution={deleteDialog.selectedInstitution || institution}
        stats={stats}
        open={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => deleteDialog.handleDelete(performDelete)}
        loading={deleteDialog.loading}
      />

      {/* Demo Controls */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-4">Controles de Demo:</h3>
        <div className="flex gap-2">
          <Button onClick={handleEdit} variant="outline">
            Probar Edición
          </Button>
          <Button onClick={handleDelete} variant="destructive">
            Probar Eliminación
          </Button>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Características Implementadas:</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li><strong>Vista detallada completa:</strong> Información básica, estadísticas y actividad reciente</li>
          <li><strong>Estadísticas en tiempo real:</strong> Cursos, estudiantes y profesores con carga automática</li>
          <li><strong>Botón de actualización:</strong> Refresca las estadísticas manualmente</li>
          <li><strong>Menú de acciones:</strong> Opciones de editar y eliminar</li>
          <li><strong>Diálogo de eliminación inteligente:</strong> Evalúa el riesgo basado en datos asociados</li>
          <li><strong>Confirmación requerida:</strong> Para eliminaciones peligrosas</li>
          <li><strong>Estados de carga:</strong> Indicadores visuales durante operaciones</li>
          <li><strong>Manejo de errores:</strong> Mensajes claros y opciones de recuperación</li>
          <li><strong>Diseño responsive:</strong> Funciona en móvil y desktop</li>
          <li><strong>Accesibilidad:</strong> Navegación por teclado y screen readers</li>
        </ul>
      </div>

      {/* Integration Notes */}
      <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
        <h3 className="font-semibold mb-2">Integración con el Sistema:</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Los componentes están listos para integrarse en las páginas del dashboard</li>
          <li>Las API routes están implementadas para obtener estadísticas</li>
          <li>Los hooks manejan el estado y cache automáticamente</li>
          <li>El diseño es consistente con el tema existente</li>
          <li>Los componentes son reutilizables y configurables</li>
        </ul>
      </div>
    </div>
  );
}