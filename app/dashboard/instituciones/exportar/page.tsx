'use client';

import React from 'react';
import { InstitutionExportExample } from '@/features/institutions/components/institution-export-example';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

/**
 * Página de ejemplo para demostrar la funcionalidad de exportación de instituciones
 */
export default function ExportarInstitucionesPage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exportar Instituciones</h1>
        <p className="text-muted-foreground">
          Exporta datos de instituciones en diferentes formatos.
        </p>
      </div>
      
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Opciones de Exportación</CardTitle>
          <CardDescription>
            Selecciona el formato y las opciones para exportar los datos de instituciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstitutionExportExample />
        </CardContent>
      </Card>
    </div>
  );
}