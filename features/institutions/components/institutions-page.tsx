"use client";

import { useState, useEffect } from "react";
import { Plus, School, Loader2 } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  InstitutionSearch, 
  InstitutionFilters, 
  InstitutionList,
  InstitutionExportCompact 
} from "@/features/institutions/components";
import { FirstAdminWelcome } from "./first-admin-welcome";
import { useInstitutionSearch } from "@/features/institutions/hooks/use-institution-search";
import { exportInstitutions } from "@/features/institutions/utils/institution-export";
import { Institution, InstitutionExportOptions, InstitutionListResponse } from "@/features/institutions/types";

export function InstitutionsPage() {
  const { user } = useUser();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const {
    filters,
    debouncedSearch,
    isSearching,
    page,
    setSearch,
    setDateRange,
    setSorting,
    clearFilters,
    setPage,
    hasActiveFilters,
    getActiveFiltersCount,
  } = useInstitutionSearch();

  useEffect(() => {
    if (user) {
      checkPermissions();
    }
  }, [user]);

  // Cargar instituciones cuando cambien los filtros o la página
  useEffect(() => {
    if (user) {
      loadInstitutions();
    }
  }, [user, debouncedSearch, filters.dateRange, filters.sortBy, filters.sortOrder, page]);

  const checkPermissions = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/auth/permissions');
      if (response.ok) {
        const data = await response.json();
        setCanManage(data.canManage || false);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      // Por defecto, asumir que puede gestionar si es admin
      setCanManage(true);
    }
  };

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir parámetros de consulta
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      if (filters.dateRange.from) {
        params.append('dateFrom', filters.dateRange.from.toISOString());
      }

      if (filters.dateRange.to) {
        params.append('dateTo', filters.dateRange.to.toISOString());
      }

      const response = await fetch(`/api/institutions?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las instituciones');
      }

      const result: InstitutionListResponse = await response.json();
      
      setInstitutions(result.institutions);
      setTotalCount(result.total);
      setCurrentPage(result.page);
      setHasMore(result.hasMore);

    } catch (error) {
      console.error('Error loading institutions:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    if (newFilters.dateRange !== filters.dateRange) {
      setDateRange(newFilters.dateRange);
    }
    if (newFilters.sortBy !== filters.sortBy || newFilters.sortOrder !== filters.sortOrder) {
      setSorting(newFilters.sortBy, newFilters.sortOrder);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
  };

  const handleExport = async (options: InstitutionExportOptions) => {
    try {
      // Obtener datos para exportación
      const response = await fetch('/api/institutions/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options }),
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos para exportación');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error en la exportación');
      }

      // Ejecutar la exportación
      await exportInstitutions(
        result.data.institutions, 
        options, 
        result.data.stats
      );
      
      toast.success(`Archivo ${options.format.toUpperCase()} descargado exitosamente`);
      
    } catch (error) {
      console.error('Error en exportación:', error);
      toast.error('Error al generar el archivo de exportación');
      throw error;
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Instituciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona todas las instituciones educativas del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Exportación compacta */}
          <InstitutionExportCompact
            currentFilters={filters}
            totalInstitutions={totalCount}
            onExport={handleExport}
          />
          
          {canManage && (
            <Button asChild>
              <Link href="/dashboard/instituciones/nueva">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Institución
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="space-y-4">
        <InstitutionSearch
          value={filters.search}
          onChange={setSearch}
          onSearch={handleSearch}
          isSearching={isSearching}
          placeholder="Buscar instituciones por nombre..."
        />
        
        <InstitutionFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={clearFilters}
          activeFiltersCount={getActiveFiltersCount()}
        />
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadInstitutions}
              className="ml-2"
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Cargando instituciones...
            </p>
          </div>
        </div>
      )}

      {/* Lista de Instituciones */}
      {!loading && !error && (
        <InstitutionList
          institutions={institutions}
          loading={loading}
          totalCount={totalCount}
          currentPage={currentPage}
          hasMore={hasMore}
          onPageChange={handlePageChange}
          emptyStateAction={
            canManage ? (
              <Button asChild>
                <Link href="/dashboard/instituciones/nueva">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Institución
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Estado vacío personalizado para búsquedas */}
      {!loading && !error && institutions.length === 0 && hasActiveFilters && (
        <div className="text-center py-12">
          <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron instituciones
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Intenta ajustar los filtros de búsqueda o crear una nueva institución.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
            {canManage && (
              <Button asChild>
                <Link href="/dashboard/instituciones/nueva">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Institución
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
