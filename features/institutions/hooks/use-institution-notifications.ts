"use client";

import { useCallback } from 'react';
import { toast } from 'sonner';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useInstitutionNotifications() {
  const showNotification = useCallback((
    type: NotificationType,
    options: NotificationOptions
  ) => {
    const message = options.description 
      ? `${options.title}\n${options.description}`
      : options.title;

    switch (type) {
      case 'success':
        toast.success(message, {
          duration: options.duration || 5000,
          action: options.action ? {
            label: options.action.label,
            onClick: options.action.onClick,
          } : undefined,
        });
        break;
      case 'error':
        toast.error(message, {
          duration: options.duration || 8000,
          action: options.action ? {
            label: options.action.label,
            onClick: options.action.onClick,
          } : undefined,
        });
        break;
      case 'warning':
        toast.warning(message, {
          duration: options.duration || 6000,
        });
        break;
      case 'info':
        toast.info(message, {
          duration: options.duration || 5000,
        });
        break;
    }
  }, []);

  // Notificaciones específicas para instituciones
  const notifyInstitutionCreated = useCallback((institutionName: string) => {
    showNotification('success', {
      title: 'Institución creada exitosamente',
      description: `La institución "${institutionName}" ha sido registrada correctamente.`,
    });
  }, [showNotification]);

  const notifyInstitutionUpdated = useCallback((institutionName: string) => {
    showNotification('success', {
      title: 'Institución actualizada',
      description: `Los cambios en "${institutionName}" se han guardado correctamente.`,
    });
  }, [showNotification]);

  const notifyInstitutionDeleted = useCallback((institutionName: string) => {
    showNotification('success', {
      title: 'Institución eliminada',
      description: `La institución "${institutionName}" ha sido eliminada del sistema.`,
    });
  }, [showNotification]);

  const notifyInstitutionError = useCallback((
    action: string,
    error?: string,
    retry?: () => void
  ) => {
    showNotification('error', {
      title: `Error al ${action}`,
      description: error || 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.',
      duration: 8000,
      action: retry ? {
        label: 'Reintentar',
        onClick: retry,
      } : undefined,
    });
  }, [showNotification]);

  const notifyInstitutionWarning = useCallback((message: string, description?: string) => {
    showNotification('warning', {
      title: message,
      description,
      duration: 6000,
    });
  }, [showNotification]);

  const notifyInstitutionInfo = useCallback((message: string, description?: string) => {
    showNotification('info', {
      title: message,
      description,
    });
  }, [showNotification]);

  return {
    showNotification,
    notifyInstitutionCreated,
    notifyInstitutionUpdated,
    notifyInstitutionDeleted,
    notifyInstitutionError,
    notifyInstitutionWarning,
    notifyInstitutionInfo,
  };
}