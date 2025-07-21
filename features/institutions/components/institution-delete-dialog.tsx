'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2, AlertCircle, BookOpen, Users, GraduationCap } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Institution, InstitutionStats } from '../types';
import { cn } from '@/lib/utils';

interface InstitutionDeleteDialogProps {
  institution: Institution;
  stats?: InstitutionStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

export function InstitutionDeleteDialog({
  institution,
  stats,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  className,
}: InstitutionDeleteDialogProps) {
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setConfirmationChecked(false);
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    try {
      setError(null);
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la institución';
      setError(errorMessage);
    }
  };

  const hasAssociatedData = stats && (
    stats.courses_count > 0 || 
    stats.students_count > 0 || 
    stats.professors_count > 0
  );

  const getDangerLevel = (): 'low' | 'medium' | 'high' => {
    if (!stats) return 'low';
    
    const totalAssociated = stats.courses_count + stats.students_count + stats.professors_count;
    
    if (totalAssociated === 0) return 'low';
    if (totalAssociated <= 5) return 'medium';
    return 'high';
  };

  const dangerLevel = getDangerLevel();

  const getDangerLevelConfig = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          title: 'Eliminación Segura',
          description: 'Esta institución no tiene datos asociados y se puede eliminar de forma segura.',
        };
      case 'medium':
        return {
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-950',
          borderColor: 'border-orange-200 dark:border-orange-800',
          title: 'Precaución Requerida',
          description: 'Esta institución tiene algunos datos asociados que se perderán permanentemente.',
        };
      case 'high':
        return {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950',
          borderColor: 'border-red-200 dark:border-red-800',
          title: 'Eliminación Peligrosa',
          description: 'Esta institución tiene muchos datos asociados. La eliminación causará pérdida significativa de información.',
        };
    }
  };

  const dangerConfig = getDangerLevelConfig(dangerLevel);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn("max-w-md", className)}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Eliminar Institución
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar la institución "{institution.name}"?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Danger Level Alert */}
          <Alert className={cn(dangerConfig.bgColor, dangerConfig.borderColor)}>
            <AlertCircle className={cn("h-4 w-4", dangerConfig.color)} />
            <AlertDescription className={dangerConfig.color}>
              <div className="space-y-1">
                <p className="font-medium">{dangerConfig.title}</p>
                <p className="text-sm">{dangerConfig.description}</p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Associated Data Warning */}
          {hasAssociatedData && stats && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-destructive">
                Los siguientes datos se eliminarán permanentemente:
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                {stats.courses_count > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Cursos</span>
                    </div>
                    <Badge variant="destructive">{stats.courses_count}</Badge>
                  </div>
                )}
                
                {stats.students_count > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Estudiantes</span>
                    </div>
                    <Badge variant="destructive">{stats.students_count}</Badge>
                  </div>
                )}
                
                {stats.professors_count > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Profesores</span>
                    </div>
                    <Badge variant="destructive">{stats.professors_count}</Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Confirmation Checkbox */}
          {dangerLevel !== 'low' && (
            <div className="flex items-start space-x-2">
              <Checkbox
                id="confirm-deletion"
                checked={confirmationChecked}
                onCheckedChange={setConfirmationChecked}
                disabled={loading}
              />
              <label
                htmlFor="confirm-deletion"
                className="text-sm leading-5 cursor-pointer"
              >
                Entiendo que esta acción no se puede deshacer y que todos los datos asociados se perderán permanentemente.
              </label>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading || (dangerLevel !== 'low' && !confirmationChecked)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Institución
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Simplified version for quick deletions
interface InstitutionDeleteDialogSimpleProps {
  institution: Institution;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function InstitutionDeleteDialogSimple({
  institution,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: InstitutionDeleteDialogSimpleProps) {
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setError(null);
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la institución';
      setError(errorMessage);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Eliminar Institución
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar la institución "{institution.name}"? 
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook for managing delete dialog state
export function useInstitutionDeleteDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(false);

  const openDialog = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedInstitution(null);
    setLoading(false);
  };

  const handleDelete = async (deleteFunction: (id: string) => Promise<void>) => {
    if (!selectedInstitution) return;

    setLoading(true);
    try {
      await deleteFunction(selectedInstitution.id);
      closeDialog();
    } catch (error) {
      setLoading(false);
      throw error; // Re-throw to let the dialog handle the error display
    }
  };

  return {
    isOpen,
    selectedInstitution,
    loading,
    openDialog,
    closeDialog,
    handleDelete,
  };
}