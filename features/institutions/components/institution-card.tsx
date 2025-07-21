"use client";

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  BookOpen, 
  GraduationCap,
  MoreVertical
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

import { Institution } from '../types';

interface InstitutionCardProps {
  institution: Institution;
  onView?: (institution: Institution) => void;
  onEdit?: (institution: Institution) => void;
  onDelete?: (institution: Institution) => void;
  className?: string;
  showActions?: boolean;
}

export function InstitutionCard({
  institution,
  onView,
  onEdit,
  onDelete,
  className,
  showActions = true,
}: InstitutionCardProps) {
  const handleView = () => onView?.(institution);
  const handleEdit = () => onEdit?.(institution);
  const handleDelete = () => onDelete?.(institution);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const hasContactInfo = institution.address || institution.phone || institution.email;
  const hasStats = institution.courses_count !== undefined || 
                   institution.students_count !== undefined || 
                   institution.professors_count !== undefined;

  return (
    <Card 
      className={`group relative transition-all duration-200 hover:shadow-md hover:shadow-primary/5 hover:border-primary/20 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
              {institution.name}
            </CardTitle>
            <CardDescription className="mt-1">
              Creada el {formatDate(institution.created_at)}
            </CardDescription>
          </div>
          
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onView && (
                  <DropdownMenuItem onClick={handleView}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalles
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {(onView || onEdit) && onDelete && <DropdownMenuSeparator />}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        {hasContactInfo && (
          <div className="space-y-2">
            {institution.address && (
              <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{institution.address}</span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              {institution.phone && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{institution.phone}</span>
                </div>
              )}
              
              {institution.email && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{institution.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        {hasStats && (
          <div className="grid grid-cols-3 gap-3 pt-2 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-1">
                <BookOpen className="h-4 w-4" />
                <span>Cursos</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {institution.courses_count ?? 0}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span>Alumnos</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {institution.students_count ?? 0}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-1">
                <GraduationCap className="h-4 w-4" />
                <span>Profesores</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {institution.professors_count ?? 0}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>

      {/* Quick Actions Footer - Only visible on hover for mobile */}
      {showActions && (
        <CardFooter className="pt-0 pb-4">
          <div className="flex space-x-2 w-full opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
            {onView && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleView}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
            )}
            
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEdit}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDelete}
                className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            )}
          </div>
        </CardFooter>
      )}

      {/* Click overlay for mobile - makes entire card clickable */}
      {onView && (
        <button
          onClick={handleView}
          className="absolute inset-0 z-0 md:hidden"
          aria-label={`Ver detalles de ${institution.name}`}
        />
      )}
    </Card>
  );
}

// Grid container component for responsive layout
interface InstitutionCardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function InstitutionCardGrid({ children, className }: InstitutionCardGridProps) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {children}
    </div>
  );
}