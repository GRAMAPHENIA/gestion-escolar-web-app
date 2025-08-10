'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner, InlineLoader } from './institution-loading';
import { cn } from '@/lib/utils';

interface InstitutionProgressiveLoaderProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  autoLoad?: boolean;
  threshold?: number;
}

/**
 * Componente para carga progresiva de instituciones con scroll infinito opcional
 */
export function InstitutionProgressiveLoader({
  loading,
  hasMore,
  onLoadMore,
  error,
  onRetry,
  className,
  autoLoad = false,
  threshold = 200,
}: InstitutionProgressiveLoaderProps) {
  const observerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  // Intersection Observer para scroll infinito
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (
      entry.isIntersecting && 
      hasMore && 
      !loading && 
      !error &&
      !hasTriggeredRef.current
    ) {
      hasTriggeredRef.current = true;
      onLoadMore();
      
      // Reset después de un delay para permitir múltiples cargas
      setTimeout(() => {
        hasTriggeredRef.current = false;
      }, 1000);
    }
  }, [hasMore, loading, error, onLoadMore]);

  useEffect(() => {
    if (!autoLoad || !observerRef.current) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    });

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [autoLoad, threshold, handleIntersection]);

  // No mostrar nada si no hay más datos y no está cargando
  if (!hasMore && !loading && !error) {
    return null;
  }

  return (
    <div 
      ref={observerRef}
      className={cn('flex justify-center py-6', className)}
    >
      {error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-destructive">{error}</p>
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                >
                  Reintentar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LoadingSpinner size="sm" />
          <span>Cargando más instituciones...</span>
        </div>
      ) : hasMore && !autoLoad ? (
        <Button
          onClick={onLoadMore}
          variant="outline"
          size="sm"
          className="min-w-[200px]"
        >
          Cargar más instituciones
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Componente para mostrar el progreso de carga de datasets grandes
 */
export function InstitutionDatasetProgress({
  loaded,
  total,
  loading,
  className,
}: {
  loaded: number;
  total: number;
  loading: boolean;
  className?: string;
}) {
  const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          {loading ? 'Cargando instituciones...' : 'Instituciones cargadas'}
        </span>
        <span className="font-medium">
          {loaded} de {total} ({percentage}%)
        </span>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {loading && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <LoadingSpinner size="sm" />
          <span>Procesando datos...</span>
        </div>
      )}
    </div>
  );
}

/**
 * Componente para carga por lotes con control manual
 */
export function InstitutionBatchLoader({
  batchSize = 50,
  totalBatches,
  currentBatch,
  loading,
  onLoadBatch,
  onLoadAll,
  className,
}: {
  batchSize?: number;
  totalBatches: number;
  currentBatch: number;
  loading: boolean;
  onLoadBatch: (batch: number) => void;
  onLoadAll: () => void;
  className?: string;
}) {
  const hasMoreBatches = currentBatch < totalBatches;
  const loadedItems = currentBatch * batchSize;
  const totalItems = totalBatches * batchSize;

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h4 className="font-medium">Carga de Instituciones</h4>
            <p className="text-sm text-muted-foreground">
              Lote {currentBatch} de {totalBatches} 
              ({loadedItems} de {totalItems} instituciones)
            </p>
          </div>

          <InstitutionDatasetProgress
            loaded={loadedItems}
            total={totalItems}
            loading={loading}
          />

          <div className="flex gap-2 justify-center">
            {hasMoreBatches && (
              <Button
                onClick={() => onLoadBatch(currentBatch + 1)}
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <InlineLoader loading text="Cargando..." />
                ) : (
                  `Cargar siguiente lote (${batchSize} instituciones)`
                )}
              </Button>
            )}
            
            {hasMoreBatches && (
              <Button
                onClick={onLoadAll}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                Cargar todo
              </Button>
            )}
          </div>

          {!hasMoreBatches && (
            <div className="text-center text-sm text-muted-foreground">
              ✅ Todas las instituciones han sido cargadas
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Componente para mostrar estadísticas de carga en tiempo real
 */
export function InstitutionLoadingStats({
  startTime,
  itemsLoaded,
  totalItems,
  loading,
  className,
}: {
  startTime: Date;
  itemsLoaded: number;
  totalItems: number;
  loading: boolean;
  className?: string;
}) {
  const [elapsedTime, setElapsedTime] = React.useState(0);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime.getTime());
    }, 100);

    return () => clearInterval(interval);
  }, [loading, startTime]);

  const itemsPerSecond = elapsedTime > 0 ? (itemsLoaded / (elapsedTime / 1000)) : 0;
  const estimatedTimeLeft = itemsPerSecond > 0 ? 
    ((totalItems - itemsLoaded) / itemsPerSecond) : 0;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4 text-sm', className)}>
      <div className="text-center">
        <div className="font-medium">{formatTime(elapsedTime)}</div>
        <div className="text-muted-foreground">Tiempo transcurrido</div>
      </div>
      
      <div className="text-center">
        <div className="font-medium">{Math.round(itemsPerSecond)}/s</div>
        <div className="text-muted-foreground">Velocidad</div>
      </div>
      
      <div className="text-center">
        <div className="font-medium">{itemsLoaded}</div>
        <div className="text-muted-foreground">Cargadas</div>
      </div>
      
      <div className="text-center">
        <div className="font-medium">
          {loading && estimatedTimeLeft > 0 ? formatTime(estimatedTimeLeft * 1000) : '-'}
        </div>
        <div className="text-muted-foreground">Tiempo restante</div>
      </div>
    </div>
  );
}