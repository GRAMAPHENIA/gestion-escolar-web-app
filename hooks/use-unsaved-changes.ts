import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean;
  message?: string;
}

export function useUnsavedChanges({ 
  hasUnsavedChanges, 
  message = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.' 
}: UseUnsavedChangesOptions) {
  const router = useRouter();

  // Prevenir cierre de ventana/pestaña
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message]);

  // Función para confirmar navegación
  const confirmNavigation = useCallback((callback: () => void) => {
    if (hasUnsavedChanges) {
      if (window.confirm(message)) {
        callback();
      }
    } else {
      callback();
    }
  }, [hasUnsavedChanges, message]);

  return { confirmNavigation };
}