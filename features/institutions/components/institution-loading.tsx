'use client';

import React from 'react';
import { Loader2, Save, Trash2, Download, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Spinner básico para estados de carga
 */
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 
      className={cn('animate-spin', sizeClasses[size], className)} 
    />
  );
}

/**
 * Botón con estado de carga para guardar instituciones
 */
export function SaveInstitutionButton({
  loading = false,
  disabled = false,
  onClick,
  children = 'Guardar',
  variant = 'default',
  size = 'default',
  className,
}: {
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Guardando...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {children}
        </>
      )}
    </Button>
  );
}

/**
 * Botón con estado de carga para eliminar instituciones
 */
export function DeleteInstitutionButton({
  loading = false,
  disabled = false,
  onClick,
  children = 'Eliminar',
  size = 'default',
  className,
}: {
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant="destructive"
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Eliminando...
        </>
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4" />
          {children}
        </>
      )}
    </Button>
  );
}

/**
 * Botón con estado de carga para exportar datos
 */
export function ExportInstitutionsButton({
  loading = false,
  disabled = false,
  onClick,
  children = 'Exportar',
  size = 'default',
  className,
}: {
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant="outline"
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {children}
        </>
      )}
    </Button>
  );
}

/**
 * Botón con estado de carga para búsquedas
 */
export function SearchInstitutionsButton({
  loading = false,
  disabled = false,
  onClick,
  children = 'Buscar',
  size = 'default',
  className,
}: {
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant="outline"
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Buscando...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          {children}
        </>
      )}
    </Button>
  );
}

/**
 * Botón con estado de carga para crear instituciones
 */
export function CreateInstitutionButton({
  loading = false,
  disabled = false,
  onClick,
  children = 'Nueva Institución',
  size = 'default',
  className,
}: {
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creando...
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          {children}
        </>
      )}
    </Button>
  );
}

/**
 * Overlay de carga para cubrir contenido durante operaciones
 */
export function InstitutionLoadingOverlay({
  loading = false,
  message = 'Cargando...',
  children,
}: {
  loading?: boolean;
  message?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Indicador de carga para listas con paginación progresiva
 */
export function InstitutionProgressiveLoader({
  loading = false,
  hasMore = false,
  onLoadMore,
  className,
}: {
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}) {
  if (!hasMore && !loading) return null;

  return (
    <div className={cn('flex justify-center py-6', className)}>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoadingSpinner size="sm" />
          Cargando más instituciones...
        </div>
      ) : hasMore ? (
        <Button
          onClick={onLoadMore}
          variant="outline"
          size="sm"
        >
          Cargar más instituciones
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Estado de carga para estadísticas
 */
export function InstitutionStatsLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-center h-24 border rounded-lg bg-muted/50"
        >
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-xs text-muted-foreground">
              Cargando estadísticas...
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Indicador de carga inline para elementos pequeños
 */
export function InlineLoader({
  loading = false,
  size = 'sm',
  text,
  className,
}: {
  loading?: boolean;
  size?: 'sm' | 'md';
  text?: string;
  className?: string;
}) {
  if (!loading) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LoadingSpinner size={size} />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  );
}

/**
 * Componente de carga para formularios
 */
export function FormLoadingState({
  loading = false,
  message = 'Procesando...',
}: {
  loading?: boolean;
  message?: string;
}) {
  if (!loading) return null;

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}