'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Crown, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface FirstAdminSetupProps {
  onSetupComplete: () => void;
}

export function FirstAdminSetup({ onSetupComplete }: FirstAdminSetupProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkIfFirstUser();
    }
  }, [user]);

  const checkIfFirstUser = async () => {
    try {
      setChecking(true);
      
      // Verificar si ya existen usuarios en el sistema
      const response = await fetch('/api/auth/check-first-user');
      
      if (response.ok) {
        const data = await response.json();
        setIsFirstUser(data.isFirstUser);
      }
    } catch (error) {
      console.error('Error checking first user:', error);
      setError('Error al verificar el estado del sistema');
    } finally {
      setChecking(false);
    }
  };

  const setupFirstAdmin = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/setup-first-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          name: `${user.firstName} ${user.lastName}`.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al configurar el administrador');
      }

      toast.success('¡Configuración completada! Ahora eres administrador del sistema.');
      onSetupComplete();

    } catch (error) {
      console.error('Error setting up first admin:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Verificando configuración del sistema...
          </p>
        </div>
      </div>
    );
  }

  if (!isFirstUser) {
    return null; // No mostrar nada si no es el primer usuario
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
          <Crown className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">¡Bienvenido al Sistema!</CardTitle>
        <CardDescription>
          Parece que eres el primer usuario. Configúrate como administrador para comenzar.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Como administrador podrás:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Crear y gestionar instituciones</li>
            <li>Administrar usuarios y permisos</li>
            <li>Exportar datos del sistema</li>
            <li>Acceder a todas las funcionalidades</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Tu información:</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}</p>
            <p><strong>Nombre:</strong> {user?.firstName} {user?.lastName}</p>
          </div>
        </div>

        <Button 
          onClick={setupFirstAdmin} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Configurando...
            </>
          ) : (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Convertirme en Administrador
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}