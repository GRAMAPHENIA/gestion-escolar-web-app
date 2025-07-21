'use client';

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  BookOpen, 
  GraduationCap,
  Edit,
  Trash2,
  ExternalLink,
  Activity,
  TrendingUp,
  Clock,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Institution, InstitutionStats, InstitutionActivity } from '../types';
import { useInstitutionStats } from '../hooks/use-institution-stats';
import { cn } from '@/lib/utils';

interface InstitutionDetailProps {
  institution: Institution;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function InstitutionDetail({
  institution,
  onEdit,
  onDelete,
  className,
}: InstitutionDetailProps) {
  const { stats, loading: statsLoading, error: statsError, fetchStats, refreshStats } = useInstitutionStats();

  useEffect(() => {
    fetchStats(institution.id);
  }, [institution.id, fetchStats]);

  const handleRefreshStats = () => {
    refreshStats();
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{institution.name}</h1>
          </div>
          <p className="text-muted-foreground">
            Creada el {format(new Date(institution.created_at), 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshStats}
            disabled={statsLoading}
          >
            <RefreshCw className={cn("h-4 w-4", statsLoading && "animate-spin")} />
            <span className="sr-only">Actualizar estadísticas</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Más opciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar institución
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar institución
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Dirección</p>
                  <p className="text-sm text-muted-foreground">
                    {institution.address || 'No especificada'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">
                    {institution.phone || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {institution.email || 'No especificado'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Última actualización</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(institution.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Cursos"
          value={stats?.courses_count}
          icon={BookOpen}
          loading={statsLoading}
          error={statsError}
        />
        <StatCard
          title="Estudiantes"
          value={stats?.students_count}
          icon={Users}
          loading={statsLoading}
          error={statsError}
        />
        <StatCard
          title="Profesores"
          value={stats?.professors_count}
          icon={GraduationCap}
          loading={statsLoading}
          error={statsError}
        />
      </div>

      {/* Recent Activity */}
      {stats?.recent_activity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recent_activity.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_activity.map((activity, index) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay actividad reciente</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {statsError && (
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar las estadísticas: {statsError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Statistics Card Component
interface StatCardProps {
  title: string;
  value?: number;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  error: string | null;
}

function StatCard({ title, value, icon: Icon, loading, error }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-12" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-sm text-destructive">Error</p>
            </div>
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value ?? 0}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

// Activity Item Component
interface ActivityItemProps {
  activity: InstitutionActivity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityIcon = (type: InstitutionActivity['type']) => {
    switch (type) {
      case 'course_created':
        return BookOpen;
      case 'student_enrolled':
        return Users;
      case 'professor_assigned':
        return GraduationCap;
      case 'institution_updated':
        return Edit;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: InstitutionActivity['type']) => {
    switch (type) {
      case 'course_created':
        return 'text-blue-500';
      case 'student_enrolled':
        return 'text-green-500';
      case 'professor_assigned':
        return 'text-purple-500';
      case 'institution_updated':
        return 'text-orange-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const Icon = getActivityIcon(activity.type);
  const iconColor = getActivityColor(activity.type);

  return (
    <div className="flex items-start gap-3">
      <div className={cn("mt-1", iconColor)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm">{activity.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
        </div>
      </div>
    </div>
  );
}

// Skeleton component for loading state
export function InstitutionDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* Basic Info Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-4 w-4 mt-1" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-4 w-4 mt-1" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-4 w-4 mt-1" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}