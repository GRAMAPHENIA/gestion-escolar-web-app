import { useState, useEffect, useCallback } from 'react';
import { Institution, ApiResponse, ApiError } from '../types';

interface UseInstitutionState {
  institution: Institution | null;
  loading: boolean;
  error: string | null;
}

interface UseInstitutionReturn extends UseInstitutionState {
  fetchInstitution: (id: string) => Promise<void>;
  refreshInstitution: () => Promise<void>;
  clearError: () => void;
}

export function useInstitution(institutionId?: string): UseInstitutionReturn {
  const [state, setState] = useState<UseInstitutionState>({
    institution: null,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const fetchInstitution = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/institutions/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Institución no encontrada');
        }
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Error al obtener la institución');
      }

      const result: ApiResponse<Institution> = await response.json();
      
      setState(prev => ({
        ...prev,
        institution: result.data,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      setState(prev => ({ ...prev, institution: null, loading: false }));
    }
  }, [setLoading, setError]);

  const refreshInstitution = useCallback(async () => {
    if (institutionId) {
      await fetchInstitution(institutionId);
    }
  }, [institutionId, fetchInstitution]);

  // Auto-fetch when institutionId changes
  useEffect(() => {
    if (institutionId) {
      fetchInstitution(institutionId);
    }
  }, [institutionId, fetchInstitution]);

  return {
    ...state,
    fetchInstitution,
    refreshInstitution,
    clearError,
  };
}