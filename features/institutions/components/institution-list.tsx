"use client";

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Building2,
  Users,
  BookOpen,
  GraduationCap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

import { Institution, InstitutionFilters } from '../types';

type SortField = 'name' | 'created_at' | 'courses_count' | 'students_count' | 'professors_count';
type SortOrder = 'asc' | 'desc';

interface InstitutionListProps {
  institutions: Institution[];
  loading?: boolean;
  onView?: (institution: Institution) => void;
  onEdit?: (institution: Institution) => void;
  onDelete?: (institution: Institution) => void;
  onBulkDelete?: (institutionIds: string[]) => void;
  onSort?: (field: SortField, order: SortOrder) => void;
  sortField?: SortField;
  sortOrder?: SortOrder;
  className?: string;
}

interface SortableHeaderProps {
  field: SortField;
  children: React.ReactNode;
  currentField?: SortField;
  currentOrder?: SortOrder;
  onSort?: (field: SortField, order: SortOrder) => void;
  className?: string;
}

function SortableHeader({ 
  field, 
  children, 
  currentField, 
  currentOrder, 
  onSort,
  className 
}: SortableHeaderProps) {
  const isActive = currentField === field;
  const nextOrder: SortOrder = isActive && currentOrder === 'asc' ? 'desc' : 'asc';

  const handleClick = () => {
    onSort?.(field, nextOrder);
  };

  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
        onClick={handleClick}
      >
        <span>{children}</span>
        {isActive && (
          currentOrder === 'asc' ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )
        )}
      </Button>
    </TableHead>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No hay instituciones</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">
        No se encontraron instituciones. Crea la primera institución para comenzar.
      </p>
    </div>
  );
}

function LoadingRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-muted animate-pulse rounded w-48" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-muted animate-pulse rounded w-32" />
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <div className="h-6 w-12 bg-muted animate-pulse rounded" />
          <div className="h-6 w-12 bg-muted animate-pulse rounded" />
          <div className="h-6 w-16 bg-muted animate-pulse rounded" />
        </div>
      </TableCell>
      <TableCell>
        <div className="h-8 w-8 bg-muted animate-pulse rounded" />
      </TableCell>
    </TableRow>
  );
}

export function InstitutionList({
  institutions,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  onSort,
  sortField,
  sortOrder,
  className,
}: InstitutionListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(institutions.map(inst => inst.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0 && onBulkDelete) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const isAllSelected = institutions.length > 0 && selectedIds.size === institutions.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < institutions.length;

  // Show loading state
  if (loading && institutions.length === 0) {
    return (
      <div className={className}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox disabled />
              </TableHead>
              <SortableHeader field="name">Nombre</SortableHeader>
              <SortableHeader field="created_at">Fecha de Creación</SortableHeader>
              <TableHead>Estadísticas</TableHead>
              <TableHead className="w-12">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <LoadingRow key={index} />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Show empty state
  if (!loading && institutions.length === 0) {
    return (
      <div className={className}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-4">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} institución{selectedIds.size !== 1 ? 'es' : ''} seleccionada{selectedIds.size !== 1 ? 's' : ''}
          </span>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Cancelar
            </Button>
            {onBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar seleccionadas
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Seleccionar todas las instituciones"
                  {...(isIndeterminate && { 'data-state': 'indeterminate' })}
                />
              </TableHead>
              <SortableHeader 
                field="name" 
                currentField={sortField} 
                currentOrder={sortOrder} 
                onSort={onSort}
              >
                Nombre
              </SortableHeader>
              <SortableHeader 
                field="created_at" 
                currentField={sortField} 
                currentOrder={sortOrder} 
                onSort={onSort}
                className="hidden md:table-cell"
              >
                Fecha de Creación
              </SortableHeader>
              <TableHead className="hidden lg:table-cell">Estadísticas</TableHead>
              <TableHead className="w-12">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {institutions.map((institution) => (
              <TableRow 
                key={institution.id}
                className={selectedIds.has(institution.id) ? 'bg-muted/50' : ''}
              >
                {/* Selection Checkbox */}
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(institution.id)}
                    onCheckedChange={(checked) => 
                      handleSelectOne(institution.id, checked as boolean)
                    }
                    aria-label={`Seleccionar ${institution.name}`}
                  />
                </TableCell>

                {/* Institution Name and Details */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{institution.name}</div>
                    {institution.address && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {institution.address}
                      </div>
                    )}
                    {/* Mobile-only: Show date */}
                    <div className="text-sm text-muted-foreground md:hidden">
                      {formatDate(institution.created_at)}
                    </div>
                  </div>
                </TableCell>

                {/* Creation Date - Hidden on mobile */}
                <TableCell className="hidden md:table-cell">
                  <div className="text-sm">
                    {formatDate(institution.created_at)}
                  </div>
                </TableCell>

                {/* Statistics - Hidden on mobile and tablet */}
                <TableCell className="hidden lg:table-cell">
                  <div className="flex space-x-3">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary" className="text-xs">
                        {institution.courses_count ?? 0}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary" className="text-xs">
                        {institution.students_count ?? 0}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary" className="text-xs">
                        {institution.professors_count ?? 0}
                      </Badge>
                    </div>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(institution)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(institution)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {(onView || onEdit) && onDelete && <DropdownMenuSeparator />}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(institution)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Loading overlay for additional data */}
      {loading && institutions.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="text-sm text-muted-foreground">Cargando más instituciones...</div>
        </div>
      )}
    </div>
  );
}