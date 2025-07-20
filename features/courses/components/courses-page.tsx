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
import { Input } from "@/components/ui/input";
import { Plus, Search, BookOpen, Users, School, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-updated";
import { useUser } from "@clerk/nextjs";

interface Course {
  id: string;
  name: string;
  description: string | null;
  year: number | null;
  institution: {
    name: string;
  };
  student_count: number;
}

export function CoursesPage() {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    if (user) {
      loadCourses();
      checkPermissions();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(
          `
          id,
          name,
          description,
          year,
          institutions!inner(name),
          students(count)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const coursesWithCount = data?.map((course) => ({
        id: course.id,
        name: course.name,
        description: course.description,
        year: course.year,
        institution: {
          name: course.institutions?.[0]?.name || "Institución no especificada",
        },
        student_count: course.students?.[0]?.count || 0,
      }));

      setCourses(coursesWithCount || []);
    } catch (error) {
      console.error("Error loading courses:", error || "Unknown error");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    if (!user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    setCanManage(userData?.role === "admin" || userData?.role === "director");
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.institution.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cursos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona todos los cursos del sistema
            </p>
          </div>
          {canManage && (
            <Button asChild>
              <Link href="/dashboard/cursos/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Curso
              </Link>
            </Button>
          )}
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar cursos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando cursos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cursos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona todos los cursos del sistema
          </p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/dashboard/cursos/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Curso
            </Link>
          </Button>
        )}
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Buscar cursos..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    {course.year && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        Año {course.year}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {course.institution?.name && (
                <CardDescription className="flex items-center mt-2">
                  <School className="h-4 w-4 mr-1" />
                  {course.institution.name}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {course.student_count || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Estudiantes
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    0
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Asignaturas
                  </div>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href={`/dashboard/cursos/${course.id}`}>
                  Ver Detalles
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No se encontraron cursos
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm
              ? "No hay cursos que coincidan con tu búsqueda."
              : "Aún no hay cursos registrados en el sistema."}
          </p>
          {canManage && !searchTerm && (
            <div className="mt-6">
              <Button asChild>
                <Link href="/dashboard/cursos/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Curso
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
