'use client';

import React from 'react';
import { InstitutionSearch } from './institution-search';
import { InstitutionFilters } from './institution-filters';
import { useInstitutionSearch } from '../hooks/use-institution-search';

/**
 * Example component showing how to use InstitutionSearch and InstitutionFilters together
 * This demonstrates the integration between search and filtering functionality
 */
export function InstitutionSearchAndFiltersExample() {
  const {
    filters,
    debouncedSearch,
    isSearching,
    setSearch,
    setDateRange,
    setSorting,
    clearFilters,
    hasActiveFilters,
    getActiveFiltersCount,
  } = useInstitutionSearch();

  const handleFiltersChange = (newFilters: typeof filters) => {
    // Update individual filter properties
    if (newFilters.dateRange !== filters.dateRange) {
      setDateRange(newFilters.dateRange);
    }
    if (newFilters.sortBy !== filters.sortBy || newFilters.sortOrder !== filters.sortOrder) {
      setSorting(newFilters.sortBy, newFilters.sortOrder);
    }
  };

  const handleSearch = (searchTerm: string) => {
    // This could trigger an API call or other search logic
    console.log('Searching for:', searchTerm);
    console.log('With filters:', filters);
    console.log('Debounced search term:', debouncedSearch);
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Búsqueda y Filtros de Instituciones</h2>
      
      {/* Search Component */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Búsqueda</label>
        <InstitutionSearch
          value={filters.search}
          onChange={setSearch}
          onSearch={handleSearch}
          isSearching={isSearching}
          placeholder="Buscar instituciones por nombre..."
        />
      </div>

      {/* Filters Component */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Filtros</label>
        <InstitutionFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={clearFilters}
          activeFiltersCount={getActiveFiltersCount()}
        />
      </div>

      {/* Debug Information */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Estado Actual:</h3>
        <div className="space-y-1 text-sm">
          <p><strong>Búsqueda:</strong> "{filters.search}"</p>
          <p><strong>Búsqueda con debounce:</strong> "{debouncedSearch}"</p>
          <p><strong>Buscando:</strong> {isSearching ? 'Sí' : 'No'}</p>
          <p><strong>Fecha desde:</strong> {filters.dateRange.from?.toLocaleDateString() || 'No seleccionada'}</p>
          <p><strong>Fecha hasta:</strong> {filters.dateRange.to?.toLocaleDateString() || 'No seleccionada'}</p>
          <p><strong>Ordenar por:</strong> {filters.sortBy}</p>
          <p><strong>Orden:</strong> {filters.sortOrder}</p>
          <p><strong>Filtros activos:</strong> {hasActiveFilters ? 'Sí' : 'No'} ({getActiveFiltersCount()})</p>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="font-semibold mb-2">Instrucciones de Uso:</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Escribe en el campo de búsqueda para filtrar instituciones</li>
          <li>La búsqueda tiene un retraso de 300ms para evitar demasiadas consultas</li>
          <li>Presiona Enter para ejecutar la búsqueda inmediatamente</li>
          <li>Usa el botón de filtros para configurar fechas y ordenamiento</li>
          <li>Los filtros activos se muestran como chips que puedes eliminar individualmente</li>
          <li>Usa "Limpiar filtros" para resetear todo a los valores por defecto</li>
        </ul>
      </div>
    </div>
  );
}