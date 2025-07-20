"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  School,
  Users,
  BookOpen,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Loader2,
  BarChart3,
  PieChart,
  LineChart,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-updated";
import { useUser } from "@clerk/nextjs";

// Importar los nuevos componentes de gráficos
import { GradeTrendsChart } from "@/components/charts/grade-trends-chart";
import { CoursePerformanceChart } from "@/components/charts/course-performance-chart";
import { GradeDistributionChart } from "@/components/charts/grade-distribution-chart";
import { StudentProgressChart } from "@/components/charts/student-progress-chart";

// Definir interfaces para los tipos de datos
interface Student {
  full_name: string;
  courses?: {
    name: string;
  }[];
}

interface Subject {
  name: string;
}

interface Course {
  id: string;
  name: string;
  students?: Array<{ id: string }>;
}

interface Institution {
  id: string;
  name: string;
  created_at: string;
  courses?: Course[];
}

interface GradeWithRelations {
  id: string;
  grade: number | null;
  date: string;
  students: Student[];
  subjects: Subject[];
}

interface DashboardStats {
  institutions: number;
  courses: number;
  students: number;
  grades: number;
  averageGrade: number | null;
  recentGrades: Array<{
    id: string;
    grade: number | null;
    student_name: string;
    subject_name: string;
    course_name: string;
    date: string;
  }>;
  topPerformers: Array<{
    student_name: string;
    course_name: string;
    average: number;
  }>;
  lowPerformers: Array<{
    student_name: string;
    course_name: string;
    average: number;
  }>;
  recentInstitutions: Array<{
    id: string;
    name: string;
    courses_count: number;
    students_count: number;
    created_at: string;
  }>;
}

export function DashboardOverview() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      title: string;
      message: string;
      date: string;
      read: boolean;
    }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Aquí iría la lógica para obtener los datos del dashboard
        // ...

        // Datos de ejemplo para la vista previa
        setStats({
          institutions: 5,
          courses: 12,
          students: 245,
          grades: 1245,
          averageGrade: 7.8,
          recentGrades: [
            {
              id: "1",
              grade: 8.5,
              student_name: "Ana García",
              subject_name: "Matemáticas",
              course_name: "4to A",
              date: new Date().toISOString(),
            },
            {
              id: "2",
              grade: 6.2,
              student_name: "Carlos López",
              subject_name: "Lengua",
              course_name: "3ro B",
              date: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
          topPerformers: [
            {
              student_name: "María Fernández",
              course_name: "5to A",
              average: 9.2,
            },
            { student_name: "Juan Pérez", course_name: "4to B", average: 8.9 },
          ],
          lowPerformers: [
            { student_name: "Luis Gómez", course_name: "2do A", average: 4.1 },
            { student_name: "Sofía Ruiz", course_name: "3ro C", average: 4.5 },
          ],
          recentInstitutions: [
            {
              id: "1",
              name: "Colegio San Juan",
              courses_count: 8,
              students_count: 150,
              created_at: "2023-01-15T10:00:00Z",
            },
          ],
        });

        // Notificaciones de ejemplo
        setNotifications([
          {
            id: "1",
            title: "Nuevo estudiante registrado",
            message: "Ana García se ha registrado en el curso 4to A",
            date: new Date().toISOString(),
            read: false,
          },
          {
            id: "2",
            title: "Tarea pendiente de calificación",
            message: "Tienes 5 tareas pendientes de calificar en Matemáticas",
            date: new Date(Date.now() - 3600000).toISOString(),
            read: true,
          },
        ]);
      } catch (error) {
        console.error(
          "Error fetching dashboard data:",
          error || "Unknown error"
        );
        // Set default values on error
        setStats({
          institutions: 0,
          courses: 0,
          students: 0,
          grades: 0,
          averageGrade: null,
          recentGrades: [],
          topPerformers: [],
          lowPerformers: [],
          recentInstitutions: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGradeColor = (grade: number | null) => {
    if (grade === null)
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    if (grade >= 7)
      return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200";
    if (grade >= 4)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600 dark:text-gray-400">
            Cargando datos del dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-2 bg-zinc-950/50">
        {/* Encabezado - Compacto */}
        <div className="flex flex-col justify-between space-y-2 sm:space-y-4 md:flex-row md:items-center md:space-y-0 flex-shrink-0 bg-zinc-950/30 p-4 rounded-xl">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              Hola, {user?.firstName || "Usuario"}
            </h1>
            <p className="text-sm text-zinc-400">
              Resumen de tu actividad reciente
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-zinc-800/30 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar institución
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas - Diseño mejorado */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tarjeta de Instituciones */}
          <Card className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-200 hover:border-zinc-700/80 overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-orange-500/10 rounded-full border border-orange-500/20">
                <School className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-1">
                {stats?.institutions || 5}
              </h3>
              <p className="text-sm text-zinc-300 mb-2">Instituciones</p>
              <p className="text-xs text-green-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+2 desde el mes pasado</span>
              </p>
            </div>
          </Card>

          {/* Tarjeta de Cursos */}
          <Card className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-200 hover:border-zinc-700/80 overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-blue-500/10 rounded-full border border-blue-500/20">
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-1">
                {stats?.courses || 12}
              </h3>
              <p className="text-sm text-zinc-300 mb-2">Cursos</p>
              <p className="text-xs text-green-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+5 desde la semana pasada</span>
              </p>
            </div>
          </Card>

          {/* Tarjeta de Estudiantes */}
          <Card className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-200 hover:border-zinc-700/80 overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-purple-500/10 rounded-full border border-purple-500/20">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-1">
                {stats?.students || 245}
              </h3>
              <p className="text-sm text-zinc-300 mb-2">Estudiantes</p>
              <p className="text-xs text-green-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+12 desde ayer</span>
              </p>
            </div>
          </Card>

          {/* Tarjeta de Promedio */}
          <Card className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-200 hover:border-zinc-700/80 overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-green-500/10 rounded-full border border-green-500/20">
                <BarChart3 className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-1">
                {stats?.averageGrade?.toFixed(1) || "7.8"}
              </h3>
              <p className="text-sm text-zinc-300 mb-2">Promedio General</p>
              <p className="text-xs text-green-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+0.5 vs mes anterior</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Últimas calificaciones - Simplificado */}
        <Card className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-200 hover:border-zinc-700/80">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2 text-sm sm:text-base">
              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
              <span className="hidden sm:inline">Últimas Calificaciones</span>
              <span className="sm:hidden">Calificaciones</span>
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs sm:text-sm">
              <span className="hidden sm:inline">
                Actividad reciente en el sistema
              </span>
              <span className="sm:hidden">Recientes</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentGrades?.slice(0, 4).map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-700 p-3 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none text-zinc-100 truncate">
                      {grade.student_name}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {grade.subject_name} • {grade.course_name}
                    </p>
                    <p className="text-xs text-zinc-500 hidden sm:block">
                      {formatDate(grade.date)}
                    </p>
                  </div>
                  <Badge
                    className={`ml-2 ${
                      grade.grade && grade.grade >= 7
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : grade.grade && grade.grade >= 4
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {grade.grade?.toFixed(1) || "N/A"}
                  </Badge>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full mt-4 bg-zinc-800/30 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 text-sm"
                asChild
              >
                <Link href="/dashboard/notas">
                  <span className="hidden sm:inline">
                    Ver todas las calificaciones
                  </span>
                  <span className="sm:hidden">Ver todas</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Acceso rápido a Analytics */}
        <Card className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-200 hover:border-zinc-700/80">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
              Analytics Avanzados
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs sm:text-sm">
              Accede a gráficos detallados y análisis profundos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-zinc-800/30 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                asChild
              >
                <Link href="/dashboard/analytics/trends">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Tendencias
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-zinc-800/30 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                asChild
              >
                <Link href="/dashboard/analytics/performance">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Rendimiento
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-zinc-800/30 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                asChild
              >
                <Link href="/dashboard/analytics/distribution">
                  <PieChart className="h-4 w-4 mr-2" />
                  Distribución
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-zinc-800/30 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                asChild
              >
                <Link href="/dashboard/analytics/progress">
                  <Users className="h-4 w-4 mr-2" />
                  Progreso
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
