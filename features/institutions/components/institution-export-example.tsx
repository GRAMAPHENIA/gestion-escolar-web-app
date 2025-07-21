'use client';

import React, { useState } from 'react';
import { InstitutionExport, InstitutionExportCompact } from './institution-export';
import { InstitutionExportOptions, Institution, InstitutionFilters } from '../types';
import { exportInstitutions } from '../utils/institution-export';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/**
 * Ejemplo de uso del componente de exportación de instituciones
 * Demuestra cómo integrar la funcionalidad de exportación con datos reales
 */
export function InstitutionExportExample() {
  // Datos de ejemplo
  const [mockInstitutions] = useState<Institution[]>([
    {
      id: '1',
      name: 'Universidad Nacional de Ejemplo',
      address: 'Av. Principal 123, Ciudad Ejemplo',
      phone: '+1 234 567 8900',
      email: 'contacto@universidad-ejemplo.edu',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-07-15T14:20:00Z',
    },
    {
      id: '2',
      name: 'Instituto Tecnológico Superior',
      address: 'Calle Secundaria 456, Ciudad Ejemplo',
      phone: '+1 234 567 8901',
      email: 'info@instituto-tecnologico.edu',
      created_at: '2024-02-20T09:15:00Z',
      updated_at: '2024-07-10T16:45:00Z',
    },
    {
      id: '3',
      name: 'Colegio San José',
      address: null,
      phone: null,
      email: 'administracion@colegio-sanjose.edu',
      created_at: '2024-03-10T11:00:00Z',
      updated_at: '2024-06-25T13:30:00Z',
    },
  ]);

  const [currentFilters] = useState<Partial<InstitutionFilters>>({
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Función para manejar la exportación
  const handleExport = async (options: InstitutionExportOptions) => {
    try {
      // Simular llamada a la API para obtener datos
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

      // Usar datos reales de la API o datos de ejemplo
      const institutionsToExport = result.data?.institutions || mockInstitutions;
      const statsToExport = result.data?.stats;

      // Ejecutar la exportación
      await exportInstitutions(institutionsToExport, options, statsToExport);
      
      toast.success(`Archivo ${options.format.toUpperCase()} descargado exitosamente`);
      
    } catch (error) {
      console.error('Error en exportación:', error);
      
      // En caso de error con la API, usar datos de ejemplo
      try {
        await exportInstitutions(mockInstitutions, options);
        toast.success(`Archivo ${options.format.toUpperCase()} descargado (datos de ejemplo)`);
      } catch (fallbackError) {
        toast.error('Error al generar el archivo de exportación');
        throw fallbackError;
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Ejemplo de Exportación de Instituciones</h1>
        <p className="text-muted-foreground">
          Este ejemplo demuestra cómo usar los componentes de exportación con datos reales.
        </p>
      </div>

      {/* Datos de Ejemplo */}
      <Card>
        <CardHeader>
          <CardTitle>Datos de Ejemplo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Total de instituciones:</span>
              <Badge variant="secondary">{mockInstitutions.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Filtros activos:</span>
              <Badge variant="outline">
                {Object.keys(currentFilters).length} filtros
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componente de Exportación Completo */}
      <Card>
        <CardHeader>
          <CardTitle>Exportación Completa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Componente completo con todas las opciones de configuración.
            </p>
            <InstitutionExport
              currentFilters={currentFilters}
              totalInstitutions={mockInstitutions.length}
              onExport={handleExport}
            />
          </div>
        </CardContent>
      </Card>

      {/* Componente de Exportación Compacto */}
      <Card>
        <CardHeader>
          <CardTitle>Exportación Compacta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Versión compacta para barras de herramientas con exportación rápida.
            </p>
            <InstitutionExportCompact
              currentFilters={currentFilters}
              totalInstitutions={mockInstitutions.length}
              onExport={handleExport}
            />
          </div>
        </CardContent>
      </Card>

      {/* Características Implementadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Características del Componente</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Selección de formato (Excel/PDF)</li>
              <li>Opción de incluir estadísticas</li>
              <li>Filtro por rango de fechas</li>
              <li>Resumen de exportación</li>
              <li>Indicador de progreso</li>
              <li>Manejo de errores</li>
              <li>Estados de carga</li>
              <li>Validación de opciones</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Funciones de Utilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Generación de archivos Excel (CSV)</li>
              <li>Generación de archivos PDF</li>
              <li>Validación de opciones</li>
              <li>Estimación de tamaño de archivo</li>
              <li>Formateo de datos</li>
              <li>Escape de caracteres especiales</li>
              <li>Nombres de archivo inteligentes</li>
              <li>Manejo de errores robusto</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Instrucciones de Uso */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Para usar en tu aplicación:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside ml-4">
              <li>Importa el componente InstitutionExport o InstitutionExportCompact</li>
              <li>Proporciona los filtros actuales y el total de instituciones</li>
              <li>Implementa la función onExport que maneje la lógica de exportación</li>
              <li>La función debe llamar a la API /api/institutions/export</li>
              <li>Usa las utilidades exportInstitutions para generar los archivos</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Integración con la API:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside ml-4">
              <li>POST /api/institutions/export - Obtiene datos y ejecuta exportación</li>
              <li>GET /api/institutions/export - Obtiene resumen sin exportar</li>
              <li>Maneja filtros, fechas y opciones automáticamente</li>
              <li>Incluye estadísticas si se solicita</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}