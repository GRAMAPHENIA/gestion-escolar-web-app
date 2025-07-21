/**
 * Export all institution hooks for easy importing
 */

export { useInstitutions } from './use-institutions';
export type { UseInstitutionsReturn } from './use-institutions';

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