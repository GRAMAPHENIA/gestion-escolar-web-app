'use client';

import React, { useState } from 'react';
import { CalendarIcon, Filter, X, SortAsc, SortDesc, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InstitutionFilters as IInstitutionFilters } from '../types';
import { cn } from '@/lib/utils';

interface InstitutionFiltersProps {
  filters: IInstitutionFilters;
  onFiltersChange: (filters: IInstitutionFilters) => void;
  onClearFilters: () => void;
  className?: string;
  disabled?: boolean;
  activeFiltersCount?: number;
}

export function InstitutionFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
  disabled = false,
  activeFiltersCount = 0,
}: InstitutionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle date range changes
  const handleDateRangeChange = (field: 'from' | 'to', date: Date | undefined) => {
    const newDateRange = {
      ...filters.dateRange,
      [field]: date || null,
    };
    
    onFiltersChange({
      ...filters,
      dateRange: newDateRange,
    });
  };

  // Handle sorting changes
  const handleSortingChange = (sortBy: IInstitutionFilters['sortBy']) => {
    // If clicking the same sort field, toggle order
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder: newSortOrder,
    });
  };

  // Clear individual filter
  const clearDateRange = () => {
    onFiltersChange({
      ...filters,
      dateRange: { from: null, to: null },
    });
  };

  const resetSorting = () => {
    onFiltersChange({
      ...filters,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  // Get active filter chips
  const getActiveFilterChips = () => {
    const chips = [];

    // Date range chip
    if (filters.dateRange.from || filters.dateRange.to) {
      let dateText = 'Fecha: ';
      if (filters.dateRange.from && filters.dateRange.to) {
        dateText += `${format(filters.dateRange.from, 'dd/MM/yyyy', { locale: es })} - ${format(filters.dateRange.to, 'dd/MM/yyyy', { locale: es })}`;
      } else if (filters.dateRange.from) {
        dateText += `Desde ${format(filters.dateRange.from, 'dd/MM/yyyy', { locale: es })}`;
      } else if (filters.dateRange.to) {
        dateText += `Hasta ${format(filters.dateRange.to, 'dd/MM/yyyy', { locale: es })}`;
      }
      
      chips.push({
        key: 'dateRange',
        label: dateText,
        onRemove: clearDateRange,
      });
    }

    // Sorting chip (only if not default)
    if (filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc') {
      const sortLabels = {
        name: 'Nombre',
        created_at: 'Fecha de creación',
        courses_count: 'Número de cursos',
      };
      
      chips.push({
        key: 'sorting',
        label: `Ordenar: ${sortLabels[filters.sortBy]} ${filters.sortOrder === 'asc' ? '↑' : '↓'}`,
        onRemove: resetSorting,
      });
    }

    return chips;
  };

  const activeChips = getActiveFilterChips();

  return (
    <div className={cn("space-y-3", className)}>
      {/* Filter Button and Active Filters Count */}
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 p-0" align="start">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearFilters}
                      className="h-auto p-1 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Limpiar todo
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Date Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de creación</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "justify-start text-left font-normal",
                            !filters.dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.from ? (
                            format(filters.dateRange.from, 'dd/MM/yyyy', { locale: es })
                          ) : (
                            "Desde"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.from || undefined}
                          onSelect={(date) => handleDateRangeChange('from', date)}
                          disabled={(date) =>
                            date > new Date() || 
                            (filters.dateRange.to && date > filters.dateRange.to)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "justify-start text-left font-normal",
                            !filters.dateRange.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateRange.to ? (
                            format(filters.dateRange.to, 'dd/MM/yyyy', { locale: es })
                          ) : (
                            "Hasta"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.to || undefined}
                          onSelect={(date) => handleDateRangeChange('to', date)}
                          disabled={(date) =>
                            date > new Date() || 
                            (filters.dateRange.from && date < filters.dateRange.from)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Separator />

                {/* Sorting Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ordenar por</label>
                  <div className="space-y-2">
                    {[
                      { value: 'name' as const, label: 'Nombre' },
                      { value: 'created_at' as const, label: 'Fecha de creación' },
                      { value: 'courses_count' as const, label: 'Número de cursos' },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={filters.sortBy === option.value ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => handleSortingChange(option.value)}
                      >
                        <span>{option.label}</span>
                        {filters.sortBy === option.value && (
                          filters.sortOrder === 'asc' ? 
                            <SortAsc className="h-4 w-4" /> : 
                            <SortDesc className="h-4 w-4" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>

        {/* Clear All Filters Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="gap-1 pr-1"
            >
              <span className="text-xs">{chip.label}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={chip.onRemove}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Eliminar filtro</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function InstitutionFiltersCompact({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
  disabled = false,
  activeFiltersCount = 0,
}: InstitutionFiltersProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-72 p-3" align="start">
          <div className="space-y-3">
            {/* Quick Sort Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordenar</label>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-') as [IInstitutionFilters['sortBy'], IInstitutionFilters['sortOrder']];
                  onFiltersChange({ ...filters, sortBy, sortOrder });
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Nombre A-Z</SelectItem>
                  <SelectItem value="name-desc">Nombre Z-A</SelectItem>
                  <SelectItem value="created_at-desc">Más recientes</SelectItem>
                  <SelectItem value="created_at-asc">Más antiguos</SelectItem>
                  <SelectItem value="courses_count-desc">Más cursos</SelectItem>
                  <SelectItem value="courses_count-asc">Menos cursos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeFiltersCount > 0 && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}