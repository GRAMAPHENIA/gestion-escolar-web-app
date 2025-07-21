import { useState, useCallback, useEffect, useRef } from 'react';
import { InstitutionStats, InstitutionActivity, ApiResponse, ApiError } from '../types';

interface UseInstitutionStatsState {
  stats: InstitutionStats | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

interface UseInstitutionStatsReturn extends UseInstitutionStatsState {
  fetchStats: (institutionId: string, forceRefresh?: boolean) => Promise<void>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
  isStale: boolean;
}

interface StatsCache {
  [institutionId: string]: {
    data: InstitutionStats;
    timestamp: Date;
  };
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Global cache for stats across all hook instances
const statsCache: StatsCache = {};

export function useInstitutionStats(): UseInstitutionStatsReturn {
  const [state, setState] = useState<UseInstitutionStatsState>({
    stats: null,
    loading: false,
    error: null,
    lastFetched: null,
  });

  const currentInstitutionIdRef = useRef<string | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const isCacheValid = useCallback((institutionId: string): boolean => {
    const cached = statsCache[institutionId];
    if (!cached) return false;
    
    const now = new Date();
    const timeDiff = now.getTime() - cached.timestamp.getTime();
    return timeDiff < CACHE_DURATION;
  }, []);

  const fetchStats = useCallback(async (
    institutionId: string, 
    forceRefresh: boolean = false
  ): Promise<void> => {
    try {
      currentInstitutionIdRef.current = institutionId;
      
      // Check cache first if not forcing refresh
      if (!forceRefresh && isCacheValid(institutionId)) {
        const cached = statsCache[institutionId];
        setState(prev => ({
          ...prev,
          stats: cached.data,
          loading: false,
          error: null,
          lastFetched: cached.timestamp,
        }));
        return;
      }

      setLoading(true);
      setError(null);

      const response = await fetch(`/api/institutions/${institutionId}/stats`);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Error al obtener estadísticas');
      }

      const result: ApiResponse<InstitutionStats> = await response.json();
      const stats = result.data;
      
      // Update cache
      const now = new Date();
      statsCache[institutionId] = {
        data: stats,
        timestamp: now,
      };

      // Only update state if this is still the current institution
      if (currentInstitutionIdRef.current === institutionId) {
        setState(prev => ({
          ...prev,
          stats,
          loading: false,
          lastFetched: now,
        }));
      }
    } catch (error) {
      // Only update error state if this is still the current institution
      if (currentInstitutionIdRef.current === institutionId) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setError(errorMessage);
        setLoading(false);
      }
    }
  }, [isCacheValid, setLoading, setError]);

  const refreshStats = useCallback(async (): Promise<void> => {
    if (currentInstitutionIdRef.current) {
      await fetchStats(currentInstitutionIdRef.current, true);
    }
  }, [fetchStats]);

  // Check if current stats are stale
  const isStale = state.lastFetched ? 
    (new Date().getTime() - state.lastFetched.getTime()) > CACHE_DURATION : 
    true;

  return {
    ...state,
    fetchStats,
    refreshStats,
    clearError,
    isStale,
  };
}

// Hook for managing multiple institutions stats (for dashboard overview)
export function useMultipleInstitutionStats(institutionIds: string[]) {
  const [statsMap, setStatsMap] = useState<Record<string, InstitutionStats>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMultipleStats = useCallback(async (
    ids: string[], 
    forceRefresh: boolean = false
  ): Promise<void> => {
    if (ids.length === 0) {
      setStatsMap({});
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Filter out cached stats if not forcing refresh
      const idsToFetch = forceRefresh ? ids : ids.filter(id => !statsCache[id] || 
        (new Date().getTime() - statsCache[id].timestamp.getTime()) > CACHE_DURATION
      );

      // Use cached data for valid entries
      const cachedStats: Record<string, InstitutionStats> = {};
      ids.forEach(id => {
        if (statsCache[id] && (forceRefresh || 
          (new Date().getTime() - statsCache[id].timestamp.getTime()) < CACHE_DURATION)) {
          cachedStats[id] = statsCache[id].data;
        }
      });

      if (idsToFetch.length === 0) {
        setStatsMap(cachedStats);
        setLoading(false);
        return;
      }

      // Fetch missing stats
      const response = await fetch('/api/institutions/stats/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ institutionIds: idsToFetch }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Error al obtener estadísticas');
      }

      const result: ApiResponse<Record<string, InstitutionStats>> = await response.json();
      const fetchedStats = result.data;

      // Update cache
      const now = new Date();
      Object.entries(fetchedStats).forEach(([id, stats]) => {
        statsCache[id] = {
          data: stats,
          timestamp: now,
        };
      });

      // Combine cached and fetched stats
      setStatsMap({ ...cachedStats, ...fetchedStats });
      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMultipleStats(institutionIds);
  }, [institutionIds, fetchMultipleStats]);

  const refreshStats = useCallback(() => {
    return fetchMultipleStats(institutionIds, true);
  }, [institutionIds, fetchMultipleStats]);

  return {
    statsMap,
    loading,
    error,
    refreshStats,
    clearError: () => setError(null),
  };
}

// Hook for real-time stats updates (using polling)
export function useInstitutionStatsRealtime(
  institutionId: string, 
  pollingInterval: number = 30000 // 30 seconds default
) {
  const { stats, loading, error, fetchStats, clearError } = useInstitutionStats();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return; // Already polling

    setIsPolling(true);
    
    // Initial fetch
    fetchStats(institutionId);
    
    // Set up polling
    intervalRef.current = setInterval(() => {
      fetchStats(institutionId, true); // Force refresh on polling
    }, pollingInterval);
  }, [institutionId, pollingInterval, fetchStats]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Restart polling when institutionId changes
  useEffect(() => {
    if (isPolling) {
      stopPolling();
      startPolling();
    }
  }, [institutionId, isPolling, startPolling, stopPolling]);

  return {
    stats,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    clearError,
  };
}

// Utility function to clear all stats cache (useful for logout or data refresh)
export function clearInstitutionStatsCache(): void {
  Object.keys(statsCache).forEach(key => {
    delete statsCache[key];
  });
}