'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface InstitutionErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface InstitutionErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    resetError: () => void;
    goHome: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class InstitutionErrorBoundary extends React.Component<
  InstitutionErrorBoundaryProps,
  InstitutionErrorBoundaryState
> {
  constructor(props: InstitutionErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<InstitutionErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log del error para reportes
    console.error('Error en el módulo de instituciones:', error);
    console.error('Información del error:', errorInfo);

    // Llamar al callback de error si se proporciona
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Aquí se podría integrar con un servicio de logging como Sentry
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  goHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Si se proporciona un componente fallback personalizado, usarlo
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
            goHome={this.goHome}
          />
        );
      }

      // Componente fallback por defecto
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Error en Gestión de Instituciones</CardTitle>
              <CardDescription>
                Ha ocurrido un error inesperado en el módulo de instituciones. 
                Nuestro equipo ha sido notificado automáticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <p className="font-medium mb-1">Detalles técnicos:</p>
                <p className="font-mono text-xs break-all">
                  {this.state.error?.message || 'Error desconocido'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={this.resetError} 
                  variant="default" 
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Intentar de nuevo
                </Button>
                <Button 
                  onClick={this.goHome} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ir al Dashboard
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Información de desarrollo (solo visible en desarrollo)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default InstitutionErrorBoundary;