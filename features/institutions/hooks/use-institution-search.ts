import { useState, useCallback, useEffect, useMemo } from 'react';
import { InstitutionFilters } from '../types';

interface UseInstitutionSearchState {
  filters: InstitutionFilters;
  debouncedSearch: string;
  isSearching: boolean;
  page: number;
}

interface UseInstitutionSearchReturn extends UseInstitutionSearchState {
  setSearch: (search: string) => void;
  setDateRange: (dateRange: { from: Date | null; to: Date | null }) => void;
  setSorting: (sortBy: InstitutionFilters['sortBy'], sortOrder: InstitutionFilters['sortOrder']) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  nextPage: () => void;
  resetPage: () => void;
  hasActiveFilters: boolean;
  getActiveFiltersCount: () => number;
}

const DEFAULT_FILTERS: InstitutionFilters = {
  search: '',
  dateRange: { from: null, to: null },
  sortBy: 'created_at',
  sortOrder: 'desc',
};

const DEBOUNCE_DELAY = 300; // 300ms debounce delay

export function useInstitutionSearch(): UseInstitutionSearchReturn {
  const [state, setState] = useState<UseInstitutionSearchState>({
    filters: DEFAULT_FILTERS,
    debouncedSearch: '',
    isSearching: false,
    page: 1,
  });

  // Debounce search functionality
  useEffect(() => {
    if (state.filters.search === state.debouncedSearch) {
      setState(prev => ({ ...prev, isSearching: false }));
      return;
    }

    setState(prev => ({ ...prev, isSearching: true }));

    const timeoutId = setTimeout(() => {
      setState(prev => ({
        ...prev,
        debouncedSearch: prev.filters.search,
        isSearching: false,
        page: 1, // Reset page when search changes
      }));
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [state.filters.search, state.debouncedSearch]);

  const setSearch = useCallback((search: string) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, search },
    }));
  }, []);

  const setDateRange = useCallback((dateRange: { from: Date | null; to: Date | null }) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, dateRange },
      page: 1, // Reset page when filters change
    }));
  }, []);

  const setSorting = useCallback((
    sortBy: InstitutionFilters['sortBy'], 
    sortOrder: InstitutionFilters['sortOrder']
  ) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, sortBy, sortOrder },
      page: 1, // Reset page when sorting changes
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: DEFAULT_FILTERS,
      debouncedSearch: '',
      page: 1,
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    setState(prev => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const resetPage = useCallback(() => {
    setState(prev => ({ ...prev, page: 1 }));
  }, []);

  // Computed values
  const hasActiveFilters = useMemo(() => {
    const { search, dateRange, sortBy, sortOrder } = state.filters;
    
    return (
      search.trim() !== '' ||
      dateRange.from !== null ||
      dateRange.to !== null ||
      sortBy !== DEFAULT_FILTERS.sortBy ||
      sortOrder !== DEFAULT_FILTERS.sortOrder
    );
  }, [state.filters]);

  const getActiveFiltersCount = useCallback(() => {
    const { search, dateRange, sortBy, sortOrder } = state.filters;
    let count = 0;
    
    if (search.trim() !== '') count++;
    if (dateRange.from !== null || dateRange.to !== null) count++;
    if (sortBy !== DEFAULT_FILTERS.sortBy || sortOrder !== DEFAULT_FILTERS.sortOrder) count++;
    
    return count;
  }, [state.filters]);

  return {
    ...state,
    setSearch,
    setDateRange,
    setSorting,
    clearFilters,
    setPage,
    nextPage,
    resetPage,
    hasActiveFilters,
    getActiveFiltersCount,
  };
}

// Additional utility hook for search suggestions
export function useInstitutionSearchSuggestions(searchTerm: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/institutions/suggestions?q=${encodeURIComponent(searchTerm)}`);
        
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, DEBOUNCE_DELAY);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return { suggestions, loading };
}

// Hook for managing search history
export function useInstitutionSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load search history from localStorage on mount
    const savedHistory = localStorage.getItem('institution-search-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setSearchHistory(parsed.slice(0, 10)); // Keep only last 10 searches
        }
      } catch (error) {
        console.error('Error parsing search history:', error);
      }
    }
  }, []);

  const addToHistory = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setSearchHistory(prev => {
      const filtered = prev.filter(term => term !== searchTerm);
      const newHistory = [searchTerm, ...filtered].slice(0, 10);
      
      // Save to localStorage
      localStorage.setItem('institution-search-history', JSON.stringify(newHistory));
      
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('institution-search-history');
  }, []);

  const removeFromHistory = useCallback((searchTerm: string) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(term => term !== searchTerm);
      localStorage.setItem('institution-search-history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}