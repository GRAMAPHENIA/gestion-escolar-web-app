'use client';

import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar,
  Filter,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { InstitutionExportOptions, InstitutionFilters } from '../types';
import { cn } from '@/lib/utils';

interface InstitutionExportProps {
  currentFilters?: Partial<InstitutionFilters>;
  totalInstitutions?: number;
  onExport: (options: InstitutionExportOptions) => Promise<void>;
  className?: string;
}

export function InstitutionExport({
  currentFilters,
  totalInstitutions = 0,
  onExport,
  className,
}: InstitutionExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<InstitutionExportOptions>({
    format: 'excel',
    includeStats: true,
    filters: currentFilters,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      setExportStatus('idle');
      setExportError(null);

      // Simular progreso de exportación
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onExport(exportOptions);

      clearInterval(progressInterval);
      setExportProgress(100);
      setExportStatus('success');
      
      // Cerrar el diálogo después de un breve delay
      setTimeout(() => {
        setIsOpen(false);
        resetExportState();
      }, 2000);

    } catch (error) {
      setExportStatus('error');
      setExportError(error instanceof Error ? error.message : 'Error desconocido durante la exportación');
    } finally {
      setIsExporting(false);
    }
  };

  const resetExportState = () => {
    setExportProgress(0);
    setExportStatus('idle');
    setExportError(null);
  };

  const handleDateRangeChange = (field: 'from' | 'to', date: Date | undefined) => {
    setExportOptions(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: date || undefined,
      },
    }));
  };

  const getEstimatedCount = () => {
    // Si hay filtros aplicados, usar el total actual, sino usar el total general
    return currentFilters && Object.keys(currentFilters).length > 0 
      ? totalInstitutions 
      : totalInstitutions;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Instituciones
          </DialogTitle>
        </DialogHeader>

        {!isExporting && exportStatus === 'idle' && (
          <div className="space-y-6">
            {/* Formato de Exportación */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Formato de Exportación</Label>
              <RadioGroup
                value={exportOptions.format}
                onValueChange={(value: 'excel' | 'pdf') => 
                  setExportOptions(prev => ({ ...prev, format: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    Excel (.xlsx)
                    <Badge variant="secondary">Recomendado</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4 text-red-600" />
                    PDF (.pdf)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Opciones de Contenido */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Contenido a Incluir</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeStats"
                    checked={exportOptions.includeStats}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, includeStats: !!checked }))
                    }
                  />
                  <Label htmlFor="includeStats" className="cursor-pointer">
                    Incluir estadísticas (cursos, estudiantes, profesores)
                  </Label>
                </div>
              </div>
            </div>

            {/* Rango de Fechas */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Filtro por Fecha de Creación (Opcional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Desde</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !exportOptions.dateRange?.from && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {exportOptions.dateRange?.from ? (
                          format(exportOptions.dateRange.from, 'dd/MM/yyyy', { locale: es })
                        ) : (
                          "Seleccionar fecha"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={exportOptions.dateRange?.from}
                        onSelect={(date) => handleDateRangeChange('from', date)}
                        disabled={(date) =>
                          date > new Date() || 
                          (exportOptions.dateRange?.to && date > exportOptions.dateRange.to)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Hasta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !exportOptions.dateRange?.to && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {exportOptions.dateRange?.to ? (
                          format(exportOptions.dateRange.to, 'dd/MM/yyyy', { locale: es })
                        ) : (
                          "Seleccionar fecha"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={exportOptions.dateRange?.to}
                        onSelect={(date) => handleDateRangeChange('to', date)}
                        disabled={(date) =>
                          date > new Date() || 
                          (exportOptions.dateRange?.from && date < exportOptions.dateRange.from)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Resumen de Exportación */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Resumen de Exportación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Formato:</span>
                  <span className="font-medium">
                    {exportOptions.format === 'excel' ? 'Excel (.xlsx)' : 'PDF (.pdf)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Instituciones estimadas:</span>
                  <span className="font-medium">{getEstimatedCount()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Incluir estadísticas:</span>
                  <span className="font-medium">
                    {exportOptions.includeStats ? 'Sí' : 'No'}
                  </span>
                </div>
                {exportOptions.dateRange?.from && (
                  <div className="flex justify-between">
                    <span>Rango de fechas:</span>
                    <span className="font-medium">
                      {format(exportOptions.dateRange.from, 'dd/MM/yyyy', { locale: es })}
                      {exportOptions.dateRange.to && 
                        ` - ${format(exportOptions.dateRange.to, 'dd/MM/yyyy', { locale: es })}`
                      }
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleExport} disabled={getEstimatedCount() === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exportar {getEstimatedCount()} instituciones
              </Button>
            </div>
          </div>
        )}

        {/* Estado de Exportación */}
        {isExporting && (
          <div className="space-y-4 py-8">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <h3 className="font-medium">Exportando instituciones...</h3>
              <p className="text-sm text-muted-foreground">
                Esto puede tomar unos momentos dependiendo de la cantidad de datos.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          </div>
        )}

        {/* Estado de Éxito */}
        {exportStatus === 'success' && (
          <div className="space-y-4 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="font-medium text-green-700 dark:text-green-400">
                ¡Exportación Completada!
              </h3>
              <p className="text-sm text-muted-foreground">
                El archivo se ha descargado automáticamente.
              </p>
            </div>
          </div>
        )}

        {/* Estado de Error */}
        {exportStatus === 'error' && (
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Error durante la exportación</p>
                  <p className="text-sm">{exportError}</p>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cerrar
              </Button>
              <Button onClick={handleExport}>
                Reintentar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Versión compacta para barras de herramientas
export function InstitutionExportCompact({
  currentFilters,
  totalInstitutions = 0,
  onExport,
  className,
}: InstitutionExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleQuickExport = async (format: 'excel' | 'pdf') => {
    try {
      setIsExporting(true);
      
      const options: InstitutionExportOptions = {
        format,
        includeStats: true,
        filters: currentFilters,
      };

      await onExport(options);
    } catch (error) {
      console.error('Error en exportación rápida:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickExport('excel')}
        disabled={isExporting || totalInstitutions === 0}
        className="gap-1"
      >
        {isExporting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-3 w-3" />
        )}
        Excel
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickExport('pdf')}
        disabled={isExporting || totalInstitutions === 0}
        className="gap-1"
      >
        {isExporting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <FileText className="h-3 w-3" />
        )}
        PDF
      </Button>
    </div>
  );
}