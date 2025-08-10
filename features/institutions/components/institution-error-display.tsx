'use client';

import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorDetails } from '../hooks/use-error-handler';

interface InstitutionErrorDisplayProps {
  error: ErrorDetails;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'alert' | 'card' | 'inline';
  showDetails?: boolean;
  className?: string;
}

/**
 * Componente para mostrar errores específicos del módulo de instituciones
 * Proporciona diferentes variantes de visualización y acciones de recuperación
 */
export function InstitutionErrorDisplay({
  error,
  onRetry,
  onDismiss,
  variant = 'alert',
  showDetails = false,
  className = '',
}: InstitutionErrorDisplayProps) {
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderActions = () => (
    <div className="flex gap-2 mt-3">
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="h-8"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Reintentar
        </Button>
      )}
      {onDismiss && (
        <Button
          onClick={onDismiss}
          variant="ghost"
          size="sm"
          className="h-8"
        >
          <X className="mr-1 h-3 w-3" />
          Cerrar
        </Button>
      )}
    </div>
  );

  const renderErrorDetails = () => {
    if (!showDetails) return null;

    return (
      <div className="mt-3 p-3 bg-muted rounded-md">
        <div className="text-xs text-muted-foreground space-y-1">
          <div>
            <span className="font-medium">Código:</span> {error.code || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Timestamp:</span> {formatTimestamp(error.timestamp)}
          </div>
          {error.details && (
            <div>
              <span className="font-medium">Detalles:</span>
              <pre className="mt-1 text-xs bg-background p-2 rounded overflow-auto max-h-20">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (variant === 'alert') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error en Gestión de Instituciones</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message}
          {renderErrorDetails()}
          {renderActions()}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={`border-destructive ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-medium text-destructive">
                Error en Gestión de Instituciones
              </h4>
              <p className="text-sm text-muted-foreground">
                {error.message}
              </p>
              {renderErrorDetails()}
              {renderActions()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Variant: inline
  return (
    <div className={`flex items-center gap-2 text-sm text-destructive ${className}`}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{error.message}</span>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
      {onDismiss && (
        <Button
          onClick={onDismiss}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

/**
 * Componente simplificado para errores de formularios
 */
export function InstitutionFormError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <InstitutionErrorDisplay
      error={{
        message,
        timestamp: new Date(),
      }}
      onRetry={onRetry}
      variant="inline"
    />
  );
}

/**
 * Componente para errores de carga de datos
 */
export function InstitutionLoadError({
  message = 'Error al cargar las instituciones',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <InstitutionErrorDisplay
      error={{
        message,
        timestamp: new Date(),
      }}
      onRetry={onRetry}
      variant="card"
      className="max-w-md mx-auto"
    />
  );
}