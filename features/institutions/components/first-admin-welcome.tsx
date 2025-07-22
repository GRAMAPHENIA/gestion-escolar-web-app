'use client';

import React from 'react';
import { Crown, Building2, Users, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FirstAdminWelcomeProps {
  userName?: string;
  onDismiss?: () => void;
}

export function FirstAdminWelcome({ userName, onDismiss }: FirstAdminWelcomeProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              ¡Bienvenido, Administrador!
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Primer Usuario
              </Badge>
            </CardTitle>
            <CardDescription>
              {userName ? `Hola ${userName}, ` : ''}Has sido configurado automáticamente como administrador del sistema.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Permisos otorgados */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Permisos otorgados:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-md bg-background/50">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm">Gestionar instituciones</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-background/50">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm">Administrar usuarios</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-background/50">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm">Exportar datos</span>
            </div>
          </div>
        </div>

        {/* Próximos pasos */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Próximos pasos recomendados:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Crear tu primera institución educativa
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              Configurar cursos y profesores
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              Invitar otros usuarios al sistema
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button asChild className="flex-1">
            <Link href="/dashboard/instituciones/nueva">
              <Building2 className="h-4 w-4 mr-2" />
              Crear Primera Institución
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          
          {onDismiss && (
            <Button variant="outline" onClick={onDismiss} className="flex-1 sm:flex-none">
              Entendido
            </Button>
          )}
        </div>

        {/* Nota informativa */}
        <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded-md">
          <strong>Nota:</strong> Como primer usuario del sistema, tienes permisos completos de administrador. 
          Puedes gestionar instituciones, usuarios y configuraciones. Los próximos usuarios tendrán permisos limitados por defecto.
        </div>
      </CardContent>
    </Card>
  );
}