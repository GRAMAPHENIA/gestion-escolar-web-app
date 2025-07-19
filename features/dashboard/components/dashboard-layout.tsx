"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  GraduationCap,
  School,
  Users,
  BookOpen,
  ClipboardList,
  Menu,
  X,
  BarChart3,
  Home,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { UserProfileButton } from "@/components/auth/user-profile-button";

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  {
    name: "Instituciones",
    href: "/dashboard/instituciones",
    icon: GraduationCap,
  },
  { name: "Cursos", href: "/dashboard/cursos", icon: BookOpen },
  { name: "Profesores", href: "/dashboard/profesores", icon: Users },
  { name: "Alumnos", href: "/dashboard/alumnos", icon: Users },
  { name: "Notas", href: "/dashboard/notas", icon: ClipboardList },
  { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Evitar hidratación no coincidente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar móvil */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        <div className="fixed inset-y-0 left-0 flex w-72 max-w-xs flex-col bg-white dark:bg-gray-900 shadow-xl ring-1 ring-gray-900/10 dark:ring-gray-800">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <GraduationCap className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                Gestión Escolar
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Cerrar menú</span>
            </Button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-200"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0",
                          isActive
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-800">
            <GraduationCap className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
              Gestión Escolar
            </span>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-200"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0",
                          isActive
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 lg:pl-72">
        {/* Barra superior */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-700 dark:text-gray-300"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
            <span className="sr-only">Abrir menú</span>
          </Button>

          {/* Separador */}
          <div
            className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden"
            aria-hidden="true"
          />

          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-x-2">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {navigation.find(
                  (item) =>
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                )?.name || "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-x-2">
              <ThemeToggle />
              <UserProfileButton />
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
