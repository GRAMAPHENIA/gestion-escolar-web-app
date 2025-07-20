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
  School,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UserProfileButton } from "@/components/auth/user-profile-button";

const navigation = [
  {
    name: "Inicio",
    href: "/dashboard",
    icon: Home,
    description: "Panel principal",
  },
  {
    name: "Instituciones",
    href: "/dashboard/instituciones",
    icon: Database,
    description: "Gestión de instituciones",
  },
  {
    name: "Cursos",
    href: "/dashboard/cursos",
    icon: BookOpen,
    description: "Administrar cursos",
  },
  {
    name: "Profesores",
    href: "/dashboard/profesores",
    icon: Users,
    description: "Gestión de profesores",
  },
  {
    name: "Alumnos",
    href: "/dashboard/alumnos",
    icon: GraduationCap,
    description: "Gestión de estudiantes",
  },
  {
    name: "Notas",
    href: "/dashboard/notas",
    icon: BarChart3,
    description: "Sistema de calificaciones",
  },
  {
    name: "Reportes",
    href: "/dashboard/reportes",
    icon: FileText,
    description: "Informes y estadísticas",
  },
];

const analyticsNavigation = [
  {
    name: "Tendencias",
    href: "/dashboard/analytics/trends",
    icon: TrendingUp,
    description: "Tendencias de calificaciones",
  },
  {
    name: "Rendimiento",
    href: "/dashboard/analytics/performance",
    icon: BarChart3,
    description: "Rendimiento por curso",
  },
  {
    name: "Distribución",
    href: "/dashboard/analytics/distribution",
    icon: ClipboardList,
    description: "Distribución de calificaciones",
  },
  {
    name: "Progreso",
    href: "/dashboard/analytics/progress",
    icon: Users,
    description: "Progreso individual",
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayoutModern({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
        setRightPanelOpen(true);
      } else {
        setSidebarOpen(false);
        setRightPanelOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-2 sm:p-4">
      {/* Navbar Superior */}
      <div className="h-7 flex items-center justify-end px-4 mb-2 sm:mb-3">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 hidden lg:flex"
            title="Toggle Panel de Actividad"
          >
            <Activity className="h-4 w-4" />
          </Button>

          {/* Botón de Notificaciones */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 relative"
              title="Notificaciones"
            >
              <Bell className="h-4 w-4" />
              {/* Badge de notificaciones sin leer */}
              <div className="absolute text-xs text-orange-400 -top-1 -right-1 w-5 h-5 bg-orange-400/20 border border-orange-400/20 backdrop-blur-lg rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">3</span>
              </div>
            </Button>

            {/* Dropdown de Notificaciones */}
            {notificationsOpen && (
              <>
                {/* Overlay para cerrar */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />

                {/* Card de Notificaciones */}
                <div className="absolute right-0 top-10 w-80 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-zinc-100">
                        Notificaciones
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-200"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Lista de Notificaciones */}
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-2 ">
                      {/* Notificación 1 */}
                      <div className="p-3 hover:bg-zinc-800/50 rounded-lg transition-colors mb-2">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-orange-400/20 border border-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-100">
                              Nueva calificación registrada
                            </p>
                            <p className="text-xs text-zinc-400 mt-1">
                              Ana García obtuvo 9.5 en Matemáticas
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              Hace 5 minutos
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Notificación 2 */}
                      <div className="p-3 hover:bg-zinc-800/50 rounded-lg transition-colors mb-2">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-400/20 border border-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-100">
                              Nuevo estudiante matriculado
                            </p>
                            <p className="text-xs text-zinc-400 mt-1">
                              Carlos López se unió al curso 5to A
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              Hace 1 hora
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Notificación 3 */}
                      <div className="p-3 hover:bg-zinc-800/50 rounded-lg transition-colors mb-2">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-400/20 border border-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-100">
                              Reporte mensual generado
                            </p>
                            <p className="text-xs text-zinc-400 mt-1">
                              Informe de rendimiento académico disponible
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              Hace 2 horas
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-zinc-800">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-zinc-800/30 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    >
                      Ver todas las notificaciones
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          <UserProfileButton />
        </div>
      </div>

      <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4.5rem)] flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-12 gap-2 sm:gap-4">
        {/* Sidebar Izquierdo */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-zinc-900/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-2 top-14 bottom-2 w-80 max-w-[calc(100vw-1rem)] bg-zinc-900/30 backdrop-blur-sm rounded-2xl shadow-2xl border border-zinc-800 flex flex-col overflow-hidden z-50 lg:static lg:col-span-3 lg:row-span-11 lg:w-auto lg:max-w-none lg:flex">
              <div className="p-4 sm:p-6 border-b border-zinc-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                      <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-zinc-100">
                        Gestión Escolar
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-400">
                        Sistema académico
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 lg:hidden"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto py-4">
                <div className="px-4 space-y-4">
                  {/* Navegación Principal */}
                  <div className="space-y-2">
                    {navigation.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
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
                            <Icon
                              className={cn(
                                "h-5 w-5 mr-3 flex-shrink-0",
                                isActive
                                  ? "text-orange-400"
                                  : "text-zinc-500 group-hover:text-zinc-300"
                              )}
                            />
                            <span className="font-medium">{item.name}</span>
                            {isActive && (
                              <div className="ml-auto w-2 h-2 bg-orange-400 rounded-full"></div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </nav>
              {/* Footer */}
              <div className="border-t border-zinc-700 p-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 text-xs justify-start text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                  >
                    <Terminal className="h-4 w-4 mr-2" />
                    Terminal
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 text-xs justify-start text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Config
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Contenido Principal */}
        <div
          className={cn(
            "flex-1 lg:row-span-11 bg-zinc-900/30 rounded-2xl shadow-2xl border border-zinc-800 flex flex-col overflow-hidden",
            "lg:col-span-12",
            sidebarOpen && rightPanelOpen && "lg:col-span-6",
            sidebarOpen && !rightPanelOpen && "lg:col-span-9",
            !sidebarOpen && rightPanelOpen && "lg:col-span-9"
          )}
        >
          <div className="p-4 sm:p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="h-10 w-10 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-zinc-100">
                    {navigation.find(
                      (item) =>
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                    )?.name || "Dashboard"}
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 hidden sm:block">
                    {new Date().toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Buscar..."
                    className="w-48 lg:w-64 pl-10 bg-zinc-900/30  border-zinc-600 text-zinc-200 placeholder:text-zinc-500 focus:border-none focus:ring-0"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 sm:hidden"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 sm:p-6">{children}</div>

          {/* Footer del Contenido Principal */}
          <div className="border-t border-zinc-900 p-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="flex items-center justify-center">
                <div className="p-2 rounded-lg bg-zinc-900/50">
                  <Globe className="h-4 w-4 text-zinc-600" />
                </div>
                <span className="ml-2 text-xs font-medium text-zinc-600">
                  5
                </span>
              </div>

              <div className="flex items-center justify-center">
                <div className="p-2 rounded-lg bg-zinc-900/50">
                  <School className="h-4 w-4 text-zinc-600" />
                </div>
                <span className="ml-2 text-xs font-medium text-zinc-600">
                  12
                </span>
              </div>

              <div className="flex items-center justify-center">
                <div className="p-2 rounded-lg bg-zinc-900/50">
                  <BookOpen className="h-4 w-4 text-zinc-600" />
                </div>
                <span className="ml-2 text-xs font-medium text-zinc-600">
                  245
                </span>
              </div>

              <div className="flex items-center justify-center">
                <div className="p-2 rounded-lg bg-zinc-900/50">
                  <GraduationCap className="h-4 w-4 text-zinc-600" />
                </div>
                <span className="ml-2 text-xs font-medium text-zinc-600">
                  8.7
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho */}
        {rightPanelOpen && (
          <div className="col-span-3 row-span-11 bg-zinc-900/30 rounded-2xl shadow-2xl border border-zinc-900 flex flex-col overflow-hidden lg:flex">
            <div className="p-4 border-b border-zinc-900">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-100">
                  Análisis
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightPanelOpen(false)}
                  className="h-8 w-8 p-0 text-zinc-600 hover:text-zinc-200 hover:bg-zinc-900/30"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {analyticsNavigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center p-4 rounded-xl transition-all duration-200 group mb-2",
                          isActive
                            ? "bg-orange-500/10 text-orange-400 shadow-sm border border-orange-500/20"
                            : "bg-zinc-900/30 text-zinc-300 hover:bg-zinc-900/50 hover:text-zinc-100"
                        )}
                      >
                        <div className="p-2 bg-zinc-700/50 rounded-lg mr-3">
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              isActive
                                ? "text-orange-400"
                                : "text-zinc-600 group-hover:text-zinc-200"
                            )}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-zinc-400">
                            {item.description}
                          </p>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 bg-orange-400 rounded-full ml-2"></div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="col-span-12 row-span-1 flex items-center justify-end px-6">
          <div className="flex items-center space-x-6 text-zinc-500">
            <div
              className="flex items-center space-x-1.5 hover:text-zinc-400 transition-colors cursor-help"
              title="Instituciones registradas"
            >
              <Database className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">5</span>
            </div>
            <div
              className="flex items-center space-x-1.5 hover:text-zinc-400 transition-colors cursor-help"
              title="Cursos activos"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">12</span>
            </div>
            <div
              className="flex items-center space-x-1.5 hover:text-zinc-400 transition-colors cursor-help"
              title="Estudiantes matriculados"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">245</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
