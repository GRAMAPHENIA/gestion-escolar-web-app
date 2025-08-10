/**
 * Export all institution hooks for easy importing
 */

export { useInstitutions } from './use-institutions';
export type { UseInstitutionsReturn } from './use-institutions';

export { useInstitution } from './use-institution';

export { 
  useInstitutionSearch, 
  useInstitutionSearchSuggestions, 
  useInstitutionSearchHistory 
} from './use-institution-search';

export { 
  useInstitutionStats, 
  useMultipleInstitutionStats, 
  useInstitutionStatsRealtime,
  clearInstitutionStatsCache 
} from './use-institution-stats';

export { useErrorHandler } from './use-error-handler';
export type { ErrorDetails, UseErrorHandlerReturn } from './use-error-handler';

export { 
  useLoadingState, 
  useInstitutionLoadingState, 
  useProgressiveLoading, 
  useDebouncedLoading 
} from './use-loading-state';
export type { 
  LoadingState, 
  UseLoadingStateReturn 
} from './use-loading-state';