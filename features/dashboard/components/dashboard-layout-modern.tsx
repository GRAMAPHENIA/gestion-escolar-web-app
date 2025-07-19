"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  GraduationCap,
  Users,
  BookOpen,
  ClipboardList,
  Menu,
  X,
  BarChart3,
  Home,
  Database,
  FileText,
  Settings,
  Terminal,
  Search,
  Bell,
  Activity,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UserProfileButton } from "@/components/auth/user-profile-button";

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home, description: "Panel principal" },
  { name: "Instituciones", href: "/dashboard/instituciones", icon: Database, description: "Gestión de instituciones" },
  { name: "Cursos", href: "/dashboard/cursos", icon: BookOpen, description: "Administrar cursos" },
  { name: "Profesores", href: "/dashboard/profesores", icon: Users, description: "Gestión de profesores" },
  { name: "Alumnos", href: "/dashboard/alumnos", icon: GraduationCap, description: "Gestión de estudiantes" },
  { name: "Notas", href: "/dashboard/notas", icon: BarChart3, description: "Sistema de calificaciones" },
  { name: "Reportes", href: "/dashboard/reportes", icon: FileText, description: "Informes y estadísticas" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayoutModern({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-4">
      {/* Layout de 4 paneles con márgenes y bordes redondeados */}
      <div className="h-[calc(100vh-2rem)] grid grid-cols-12 grid-rows-12 gap-4">
        
        {/* Sidebar Izquierdo */}
        {sidebarOpen && (
          <div className="col-span-3 row-span-11 bg-zinc-800 rounded-2xl shadow-xl border border-zinc-700 flex flex-col overflow-hidden">
            {/* Header del Sidebar */}
            <div className="p-6 border-b border-zinc-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">Gestión Escolar</h2>
                  <p className="text-sm text-zinc-400">Sistema académico</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="px-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 group",
                          isActive 
                            ? "bg-orange-500/10 text-orange-400 shadow-sm border border-orange-500/20" 
                            : "text-zinc-300 hover:bg-zinc-700/50 hover:text-zinc-100"
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5 mr-3 flex-shrink-0",
                          isActive ? "text-orange-400" : "text-zinc-500 group-hover:text-zinc-300"
                        )} />
                        <span className="font-medium">{item.name}</span>
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-orange-400 rounded-full"></div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* Bottom Actions */}
            <div className="border-t border-zinc-700 p-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" size="sm" className="h-10 text-xs justify-start text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700">
                  <Terminal className="h-4 w-4 mr-2" />
                  Terminal
                </Button>
                <Button variant="ghost" size="sm" className="h-10 text-xs justify-start text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Config
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido Principal */}
        <div className={cn(
          "row-span-11 bg-zinc-800 rounded-2xl shadow-xl border border-zinc-700 flex flex-col overflow-hidden",
          sidebarOpen && rightPanelOpen ? "col-span-6" : 
          sidebarOpen || rightPanelOpen ? "col-span-9" : "col-span-12"
        )}>
          {/* Header del contenido */}
          <div className="p-6 border-b border-zinc-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!sidebarOpen && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSidebarOpen(true)}
                    className="h-10 w-10 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-zinc-100">
                    {navigation.find(
                      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
                    )?.name || "Dashboard"}
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    {new Date().toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="Buscar..." 
                    className="w-64 pl-10 bg-zinc-700 border-zinc-600 text-zinc-200 placeholder:text-zinc-500 focus:border-orange-400"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  className="h-10 w-10 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                >
                  <Activity className="h-5 w-5" />
                </Button>
                <UserProfileButton />
              </div>
            </div>
          </div>

          {/* Contenido de la página */}
          <main className="flex-1 overflow-auto p-6 bg-zinc-850">
            {children}
          </main>
        </div>

        {/* Panel Derecho */}
        {rightPanelOpen && (
          <div className="col-span-3 row-span-11 bg-zinc-800 rounded-2xl shadow-xl border border-zinc-700 flex flex-col overflow-hidden">
            {/* Header del panel derecho */}
            <div className="p-6 border-b border-zinc-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-100">Actividad</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setRightPanelOpen(false)}
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Contenido del panel derecho */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Notificaciones */}
                <div>
                  <h4 className="text-sm font-medium text-zinc-100 mb-3 flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-orange-400" />
                    Notificaciones
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-zinc-100">Nueva calificación</p>
                          <p className="text-xs text-zinc-400">Ana García - Matemáticas: 9.5</p>
                          <p className="text-xs text-zinc-500 mt-1">Hace 5 minutos</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-zinc-100">Nuevo estudiante</p>
                          <p className="text-xs text-zinc-400">Carlos López se unió al curso 5to A</p>
                          <p className="text-xs text-zinc-500 mt-1">Hace 1 hora</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-zinc-100">Reporte generado</p>
                          <p className="text-xs text-zinc-400">Informe mensual de rendimiento</p>
                          <p className="text-xs text-zinc-500 mt-1">Hace 2 horas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas rápidas */}
                <div>
                  <h4 className="text-sm font-medium text-zinc-100 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-orange-400" />
                    Resumen Rápido
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg border border-zinc-600">
                      <span className="text-sm text-zinc-300">Estudiantes activos</span>
                      <span className="text-sm font-semibold text-zinc-100">245</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg border border-zinc-600">
                      <span className="text-sm text-zinc-300">Promedio general</span>
                      <span className="text-sm font-semibold text-orange-400">7.8</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg border border-zinc-600">
                      <span className="text-sm text-zinc-300">Cursos activos</span>
                      <span className="text-sm font-semibold text-zinc-100">12</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg border border-zinc-600">
                      <span className="text-sm text-zinc-300">Instituciones</span>
                      <span className="text-sm font-semibold text-zinc-100">5</span>
                    </div>
                  </div>
                </div>

                {/* Acciones rápidas */}
                <div>
                  <h4 className="text-sm font-medium text-zinc-100 mb-3">Acciones Rápidas</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-zinc-700/30 border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100">
                      <Users className="h-4 w-4 mr-2" />
                      Agregar estudiante
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-zinc-700/30 border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Crear curso
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-zinc-700/30 border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ver reportes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barra Inferior */}
        <div className="col-span-12 row-span-1 bg-zinc-800 rounded-2xl shadow-xl border border-zinc-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-zinc-300">Sistema activo</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-zinc-300">Base de datos conectada</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-zinc-400">Última actualización: hace 2 min</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <span className="text-sm text-zinc-400">localhost:3000</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-zinc-300">5 usuarios activos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span className="text-sm text-orange-400">Modo desarrollo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}