'use client';

import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface ErrorDetails {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

export interface UseErrorHandlerReturn {
  error: ErrorDetails | null;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => void;
  isError: boolean;
}

/**
 * Hook personalizado para manejar errores en el módulo de instituciones
 * Proporciona funcionalidades de logging, notificaciones y estado de error
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<ErrorDetails | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown, context?: string) => {
    let errorDetails: ErrorDetails;

    // Procesar diferentes tipos de errores
    if (error instanceof Error) {
      errorDetails = {
        message: error.message,
        code: (error as any).code,
        details: (error as any).details,
        timestamp: new Date(),
      };
    } else if (typeof error === 'string') {
      errorDetails = {
        message: error,
        timestamp: new Date(),
      };
    } else if (error && typeof error === 'object') {
      const errorObj = error as any;
      errorDetails = {
        message: errorObj.message || 'Error desconocido',
        code: errorObj.code,
        details: errorObj.details || errorObj,
        timestamp: new Date(),
      };
    } else {
      errorDetails = {
        message: 'Ha ocurrido un error inesperado',
        timestamp: new Date(),
      };
    }

    // Agregar contexto si se proporciona
    if (context) {
      errorDetails.message = `${context}: ${errorDetails.message}`;
    }

    // Establecer el estado del error
    setError(errorDetails);

    // Log del error para debugging
    console.error('Error en instituciones:', {
      ...errorDetails,
      context,
      originalError: error,
    });

    // Mostrar notificación toast
    toast({
      title: 'Error',
      description: getUserFriendlyMessage(errorDetails),
      variant: 'destructive',
    });

    // Aquí se podría integrar con servicios de logging externos
    // reportErrorToService(errorDetails, context);
  }, []);

  return {
    error,
    clearError,
    handleError,
    isError: error !== null,
  };
}

/**
 * Convierte errores técnicos en mensajes amigables para el usuario
 */
function getUserFriendlyMessage(error: ErrorDetails): string {
  const { message, code } = error;

  // Mapear códigos de error comunes a mensajes amigables
  const errorMessages: Record<string, string> = {
    'NETWORK_ERROR': 'Error de conexión. Por favor, verifica tu conexión a internet.',
    'UNAUTHORIZED': 'No tienes permisos para realizar esta acción.',
    'FORBIDDEN': 'Acceso denegado. Contacta al administrador.',
    'NOT_FOUND': 'La institución solicitada no fue encontrada.',
    'VALIDATION_ERROR': 'Los datos ingresados no son válidos.',
    'DUPLICATE_NAME': 'Ya existe una institución con este nombre.',
    'DATABASE_ERROR': 'Error en la base de datos. Intenta nuevamente.',
    'SERVER_ERROR': 'Error del servidor. Nuestro equipo ha sido notificado.',
  };

  if (code && errorMessages[code]) {
    return errorMessages[code];
  }

  // Detectar errores comunes por el mensaje
  if (message.toLowerCase().includes('network')) {
    return 'Error de conexión. Por favor, verifica tu conexión a internet.';
  }

  if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('401')) {
    return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
  }

  if (message.toLowerCase().includes('forbidden') || message.toLowerCase().includes('403')) {
    return 'No tienes permisos para realizar esta acción.';
  }

  if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('404')) {
    return 'El recurso solicitado no fue encontrado.';
  }

  if (message.toLowerCase().includes('validation')) {
    return 'Los datos ingresados no son válidos. Por favor, revisa la información.';
  }

  // Si no se puede mapear, usar el mensaje original pero más amigable
  if (message.length > 100) {
    return 'Ha ocurrido un error. Por favor, intenta nuevamente o contacta al soporte.';
  }

  return message;
}

/**
 * Función para reportar errores a servicios externos (placeholder)
 */
function reportErrorToService(error: ErrorDetails, context?: string) {
  // Aquí se integraría con servicios como Sentry, LogRocket, etc.
  // Ejemplo:
  // Sentry.captureException(new Error(error.message), {
  //   tags: { module: 'institutions', context },
  //   extra: error.details,
  // });
}