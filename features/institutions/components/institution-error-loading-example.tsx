'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInstitutionLoadingState } from '../hooks/use-loading-state';
import { useErrorHandler } from '../hooks/use-error-handler';
import InstitutionErrorBoundary from './institution-error-boundary';
import { 
  InstitutionListSkeleton,
  InstitutionLoadError,
  SaveInstitutionButton,
  InstitutionLoadingOverlay,
} from './index';

/**
 * Ejemplo de integración completa de error handling y loading states
 * Este componente demuestra cómo usar todos los componentes juntos
 */
export function InstitutionErrorLoadingExample() {
  const loadingState = useInstitutionLoadingState();
  const { error, handleError, clearError } = useErrorHandler();
  const [institutions, setInstitutions] = React.useState<any[]>([]);
  const [showError, setShowError] = React.useState(false);

  // Simular carga de datos
  const handleFetchInstitutions = async () => {
    try {
      await loadingState.withFetching(async () => {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular datos
        setInstitutions([
          { id: '1', name: 'Instituto Ejemplo 1' },
          { id: '2', name: 'Instituto Ejemplo 2' },
        ]);
      });
    } catch (err) {
      handleError(err, 'Error al cargar instituciones');
    }
  };

  // Simular error
  const handleSimulateError = () => {
    handleError(new Error('Este es un error simulado'), 'Operación de prueba');
    setShowError(true);
  };

  // Simular operación de guardado
  const handleSaveInstitution = async () => {
    try {
      await loadingState.withCreating(async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Simular éxito
      });
    } catch (err) {
      handleError(err, 'Error al guardar institución');
    }
  };

  return (
    <InstitutionErrorBoundary>
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Ejemplo de Error Handling y Loading States</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleFetchInstitutions}
                disabled={loadingState.isFetching}
              >
                {loadingState.isFetching ? 'Cargando...' : 'Cargar Instituciones'}
              </Button>
              
              <SaveInstitutionButton
                loading={loadingState.isCreating}
                onClick={handleSaveInstitution}
              />
              
              <Button 
                onClick={handleSimulateError}
                variant="destructive"
              >
                Simular Error
              </Button>
              
              <Button 
                onClick={() => {
                  clearError();
                  setShowError(false);
                }}
                variant="outline"
              >
                Limpiar Error
              </Button>
            </div>

            {/* Mostrar error si existe */}
            {showError && error && (
              <InstitutionLoadError
                message={error.message}
                onRetry={() => {
                  clearError();
                  setShowError(false);
                  handleFetchInstitutions();
                }}
              />
            )}

            {/* Estados de carga */}
            <div className="space-y-2 text-sm">
              <div>Estado de carga:</div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Fetching: {loadingState.isFetching ? '✅' : '❌'}</li>
                <li>Creating: {loadingState.isCreating ? '✅' : '❌'}</li>
                <li>Any Loading: {loadingState.hasAnyLoading ? '✅' : '❌'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contenido principal con overlay de carga */}
        <InstitutionLoadingOverlay 
          loading={loadingState.isFetching}
          message="Cargando instituciones..."
        >
          <Card>
            <CardHeader>
              <CardTitle>Lista de Instituciones</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingState.isFetching ? (
                <InstitutionListSkeleton count={3} />
              ) : institutions.length > 0 ? (
                <div className="space-y-2">
                  {institutions.map(institution => (
                    <div 
                      key={institution.id}
                      className="p-3 border rounded-lg"
                    >
                      {institution.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay instituciones cargadas. Haz clic en "Cargar Instituciones" para comenzar.
                </div>
              )}
            </CardContent>
          </Card>
        </InstitutionLoadingOverlay>

        {/* Información de debugging */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div>Loading State: {JSON.stringify(loadingState.loading, null, 2)}</div>
              {error && (
                <div>Error: {JSON.stringify({
                  message: error.message,
                  code: error.code,
                  timestamp: error.timestamp.toISOString(),
                }, null, 2)}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </InstitutionErrorBoundary>
  );
}

/**
 * Ejemplo de error boundary personalizado
 */
export function CustomErrorFallback({ 
  error, 
  resetError, 
  goHome 
}: { 
  error: Error; 
  resetError: () => void; 
  goHome: () => void; 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-destructive">
            ¡Oops! Algo salió mal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ha ocurrido un error inesperado en la aplicación. 
            Este es un ejemplo de error boundary personalizado.
          </p>
          
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-mono">{error.message}</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={resetError} className="flex-1">
              Intentar de nuevo
            </Button>
            <Button onClick={goHome} variant="outline" className="flex-1">
              Ir al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Ejemplo de uso del error boundary con fallback personalizado
 */
export function InstitutionWithCustomErrorBoundary() {
  return (
    <InstitutionErrorBoundary fallback={CustomErrorFallback}>
      <InstitutionErrorLoadingExample />
    </InstitutionErrorBoundary>
  );
}