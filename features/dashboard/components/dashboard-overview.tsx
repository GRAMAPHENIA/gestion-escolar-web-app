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
import { NotificationSystem } from "@/components/notifications/notification-system";

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
        console.error("Error fetching dashboard data:", error || "Unknown error");
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
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Hola, {user?.firstName || "Usuario"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aquí tienes un resumen de tu actividad reciente
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Plus className="mr-2 h-4 w-4" />
            Nueva tarea
          </Button>
          <NotificationSystem />
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instituciones</CardTitle>
            <School className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.institutions || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos</CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.courses || 0}</div>
            <p className="text-xs text-muted-foreground">
              +5 desde la semana pasada
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.students || 0}</div>
            <p className="text-xs text-muted-foreground">+12 desde ayer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio General
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageGrade?.toFixed(1) || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              +0.5 vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Gráfico de tendencias */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tendencias de Calificaciones</CardTitle>
            <CardDescription>
              Evolución de las calificaciones en los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <GradeTrendsChart />
            </div>
          </CardContent>
        </Card>

        {/* Últimas calificaciones */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Últimas Calificaciones</CardTitle>
            <CardDescription>Actividad reciente en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentGrades?.map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {grade.student_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {grade.subject_name} • {grade.course_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(grade.date)}
                    </p>
                  </div>
                  <Badge className={getGradeColor(grade.grade)}>
                    {grade.grade?.toFixed(1) || "N/A"}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/dashboard/notas">
                  Ver todas las calificaciones
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos adicionales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Curso</CardTitle>
            <CardDescription>
              Promedio de calificaciones por curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <CoursePerformanceChart />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Calificaciones</CardTitle>
            <CardDescription>
              Distribución general de las calificaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <GradeDistributionChart />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progreso de Estudiantes</CardTitle>
            <CardDescription>
              Evolución del rendimiento académico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <StudentProgressChart />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
