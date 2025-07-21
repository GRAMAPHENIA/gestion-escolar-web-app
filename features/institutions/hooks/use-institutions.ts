import { useState, useCallback, useRef } from 'react';
import { Institution, InstitutionFormData, InstitutionFilters, InstitutionListResponse, ApiResponse, ApiError } from '../types';

interface UseInstitutionsState {
  institutions: Institution[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  hasMore: boolean;
}

interface UseInstitutionsReturn extends UseInstitutionsState {
  fetchInstitutions: (filters?: Partial<InstitutionFilters>, page?: number) => Promise<void>;
  createInstitution: (data: InstitutionFormData) => Promise<Institution>;
  updateInstitution: (id: string, data: InstitutionFormData) => Promise<Institution>;
  deleteInstitution: (id: string) => Promise<void>;
  refreshInstitutions: () => Promise<void>;
  clearError: () => void;
}

const DEFAULT_FILTERS: InstitutionFilters = {
  search: '',
  dateRange: { from: null, to: null },
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export function useInstitutions(): UseInstitutionsReturn {
  const [state, setState] = useState<UseInstitutionsState>({
    institutions: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    hasMore: false,
  });

  const currentFiltersRef = useRef<Partial<InstitutionFilters>>({});

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const fetchInstitutions = useCallback(async (
    filters: Partial<InstitutionFilters> = {},
    page: number = 1
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Store current filters for refresh functionality
      currentFiltersRef.current = filters;

      const searchParams = new URLSearchParams();
      
      if (filters.search) searchParams.set('search', filters.search);
      if (filters.sortBy) searchParams.set('sortBy', filters.sortBy);
      if (filters.sortOrder) searchParams.set('sortOrder', filters.sortOrder);
      if (filters.dateRange?.from) searchParams.set('dateFrom', filters.dateRange.from.toISOString());
      if (filters.dateRange?.to) searchParams.set('dateTo', filters.dateRange.to.toISOString());
      
      searchParams.set('page', page.toString());
      searchParams.set('limit', '20');

      const response = await fetch(`/api/institutions?${searchParams.toString()}`);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Error al obtener instituciones');
      }

      const result: ApiResponse<InstitutionListResponse> = await response.json();
      
      setState(prev => ({
        ...prev,
        institutions: page === 1 ? result.data.institutions : [...prev.institutions, ...result.data.institutions],
        total: result.data.total,
        page: result.data.page,
        hasMore: result.data.hasMore,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      setLoading(false);
    }
  }, [setLoading, setError]);

  const createInstitution = useCallback(async (data: InstitutionFormData): Promise<Institution> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/institutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Error al crear institución');
      }

      const result: ApiResponse<Institution> = await response.json();
      const newInstitution = result.data;

      // Optimistic update: add the new institution to the beginning of the list
      setState(prev => ({
        ...prev,
        institutions: [newInstitution, ...prev.institutions],
        total: prev.total + 1,
        loading: false,
      }));

      return newInstitution;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, [setLoading, setError]);

  const updateInstitution = useCallback(async (id: string, data: InstitutionFormData): Promise<Institution> => {
    try {
      setLoading(true);
      setError(null);

      // Optimistic update: update the institution in the list immediately
      const optimisticInstitution: Institution = {
        id,
        ...data,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        created_at: '', // Will be updated with real data
        updated_at: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        institutions: prev.institutions.map(inst => 
          inst.id === id ? { ...inst, ...optimisticInstitution } : inst
        ),
      }));

      const response = await fetch(`/api/institutions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setState(prev => ({
          ...prev,
          institutions: prev.institutions.map(inst => 
            inst.id === id ? prev.institutions.find(i => i.id === id) || inst : inst
          ),
        }));
        
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Error al actualizar institución');
      }

      const result: ApiResponse<Institution> = await response.json();
      const updatedInstitution = result.data;

      // Update with real data from server
      setState(prev => ({
        ...prev,
        institutions: prev.institutions.map(inst => 
          inst.id === id ? updatedInstitution : inst
        ),
        loading: false,
      }));

      return updatedInstitution;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, [setLoading, setError]);

  const deleteInstitution = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Store the institution for potential rollback
      const institutionToDelete = state.institutions.find(inst => inst.id === id);
      
      // Optimistic update: remove the institution from the list immediately
      setState(prev => ({
        ...prev,
        institutions: prev.institutions.filter(inst => inst.id !== id),
        total: prev.total - 1,
      }));

      const response = await fetch(`/api/institutions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Revert optimistic update on error
        if (institutionToDelete) {
          setState(prev => ({
            ...prev,
            institutions: [...prev.institutions, institutionToDelete].sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ),
            total: prev.total + 1,
          }));
        }
        
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Error al eliminar institución');
      }

      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, [state.institutions, setLoading, setError]);

  const refreshInstitutions = useCallback(async () => {
    await fetchInstitutions(currentFiltersRef.current, 1);
  }, [fetchInstitutions]);

  return {
    ...state,
    fetchInstitutions,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    refreshInstitutions,
    clearError,
  };
}