'use client';

import { useState, useCallback, useRef } from 'react';

export interface LoadingState {
  [key: string]: boolean;
}

export interface UseLoadingStateReturn {
  loading: LoadingState;
  isLoading: (key?: string) => boolean;
  setLoading: (key: string, value: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  withLoading: <T>(key: string, asyncFn: () => Promise<T>) => Promise<T>;
  resetLoading: () => void;
  hasAnyLoading: boolean;
}

/**
 * Hook para manejar múltiples estados de carga de manera centralizada
 * Útil para componentes que tienen varias operaciones asíncronas
 */
export function useLoadingState(initialState: LoadingState = {}): UseLoadingStateReturn {
  const [loading, setLoadingState] = useState<LoadingState>(initialState);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const isLoading = useCallback((key?: string) => {
    if (!key) return Object.values(loading).some(Boolean);
    return loading[key] || false;
  }, [loading]);

  const setLoading = useCallback((key: string, value: boolean) => {
    // Limpiar timeout existente si existe
    const existingTimeout = timeoutsRef.current.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutsRef.current.delete(key);
    }

    setLoadingState(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const withLoading = useCallback(async <T>(
    key: string, 
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    try {
      startLoading(key);
      const result = await asyncFn();
      return result;
    } finally {
      // Agregar un pequeño delay para evitar flashing
      const timeout = setTimeout(() => {
        stopLoading(key);
        timeoutsRef.current.delete(key);
      }, 100);
      
      timeoutsRef.current.set(key, timeout);
    }
  }, [startLoading, stopLoading]);

  const resetLoading = useCallback(() => {
    // Limpiar todos los timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
    
    setLoadingState({});
  }, []);

  const hasAnyLoading = Object.values(loading).some(Boolean);

  return {
    loading,
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading,
    resetLoading,
    hasAnyLoading,
  };
}

/**
 * Hook especializado para operaciones CRUD de instituciones
 */
export function useInstitutionLoadingState() {
  const loadingState = useLoadingState();

  return {
    ...loadingState,
    // Métodos específicos para instituciones
    isCreating: loadingState.isLoading('create'),
    isUpdating: loadingState.isLoading('update'),
    isDeleting: loadingState.isLoading('delete'),
    isFetching: loadingState.isLoading('fetch'),
    isExporting: loadingState.isLoading('export'),
    isSearching: loadingState.isLoading('search'),
    
    // Métodos de conveniencia
    startCreating: () => loadingState.startLoading('create'),
    startUpdating: () => loadingState.startLoading('update'),
    startDeleting: () => loadingState.startLoading('delete'),
    startFetching: () => loadingState.startLoading('fetch'),
    startExporting: () => loadingState.startLoading('export'),
    startSearching: () => loadingState.startLoading('search'),
    
    stopCreating: () => loadingState.stopLoading('create'),
    stopUpdating: () => loadingState.stopLoading('update'),
    stopDeleting: () => loadingState.stopLoading('delete'),
    stopFetching: () => loadingState.stopLoading('fetch'),
    stopExporting: () => loadingState.stopLoading('export'),
    stopSearching: () => loadingState.stopLoading('search'),
    
    // Métodos con loading automático
    withCreating: <T>(fn: () => Promise<T>) => loadingState.withLoading('create', fn),
    withUpdating: <T>(fn: () => Promise<T>) => loadingState.withLoading('update', fn),
    withDeleting: <T>(fn: () => Promise<T>) => loadingState.withLoading('delete', fn),
    withFetching: <T>(fn: () => Promise<T>) => loadingState.withLoading('fetch', fn),
    withExporting: <T>(fn: () => Promise<T>) => loadingState.withLoading('export', fn),
    withSearching: <T>(fn: () => Promise<T>) => loadingState.withLoading('search', fn),
  };
}

/**
 * Hook para manejar carga progresiva de listas grandes
 */
export function useProgressiveLoading<T>({
  pageSize = 20,
  initialData = [],
}: {
  pageSize?: number;
  initialData?: T[];
} = {}) {
  const [data, setData] = useState<T[]>(initialData);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loadingState = useLoadingState();

  const loadMore = useCallback(async (
    fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>
  ) => {
    if (loadingState.isLoading('loadMore') || !hasMore) return;

    try {
      const result = await loadingState.withLoading('loadMore', () => 
        fetchFn(page, pageSize)
      );

      setData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more data:', error);
      throw error;
    }
  }, [page, pageSize, hasMore, loadingState]);

  const reset = useCallback((newData: T[] = []) => {
    setData(newData);
    setPage(1);
    setHasMore(true);
    loadingState.resetLoading();
  }, [loadingState]);

  return {
    data,
    hasMore,
    isLoadingMore: loadingState.isLoading('loadMore'),
    loadMore,
    reset,
    page,
  };
}

/**
 * Hook para debounce de operaciones de carga
 */
export function useDebouncedLoading(delay: number = 300) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const loadingState = useLoadingState();

  const debouncedWithLoading = useCallback(async <T>(
    key: string,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return new Promise((resolve, reject) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await loadingState.withLoading(key, asyncFn);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }, [delay, loadingState]);

  return {
    ...loadingState,
    debouncedWithLoading,
  };
}