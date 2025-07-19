"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, BookOpen, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-updated";
import { useUser } from "@clerk/nextjs";

// Definir interfaces para los tipos de datos
interface Institution {
  name: string;
}

interface Course {
  name: string;
  institutions: Institution;
}

interface StudentWithRelations {
  id: string;
  full_name: string;
  dni: string | null;
  birth_date: string | null;
  courses: Course[];
}

interface Student {
  id: string;
  full_name: string;
  dni: string | null;
  birth_date: string | null;
  course: {
    name: string;
    institution: {
      name: string;
    };
  } | null;
}

export function StudentsPage() {
  const { user } = useUser();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    if (user) {
      loadStudents();
      checkPermissions();
    }
  }, [user]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = (await supabase
        .from("students")
        .select(
          `
          id,
          full_name,
          dni,
          birth_date,
          courses (
            name,
            institutions (
              name
            )
          )
        `
        )
        .order("full_name")) as {
        data: StudentWithRelations[] | null;
        error: any;
      };

      if (error) throw error;

      const studentsWithCourse: Student[] = (data || []).map((student) => ({
        id: student.id,
        full_name: student.full_name,
        dni: student.dni,
        birth_date: student.birth_date,
        course: student.courses?.[0]
          ? {
              name: student.courses[0].name,
              institution: {
                name:
                  student.courses[0].institutions?.name || "Sin institución",
              },
            }
          : null,
      }));

      setStudents(studentsWithCourse);
    } catch (error) {
      console.error("Error loading students:", error || "Unknown error");
      setStudents([]);
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

    setCanManage(
      userData?.role === "admin" ||
        userData?.role === "director" ||
        userData?.role === "profesor"
    );
  };

  const filteredStudents = students.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.dni && student.dni.includes(searchTerm)) ||
      (student.course &&
        student.course.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Alumnos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona todos los alumnos del sistema educativo
          </p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/dashboard/alumnos/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Alumno
            </Link>
          </Button>
        )}
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar alumnos por nombre, DNI o curso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de alumnos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {student.full_name}
                    </CardTitle>
                    {student.dni && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        DNI: {student.dni}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.course && (
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium">
                      {student.course.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                    {student.course.institution.name}
                  </p>
                </div>
              )}

              {student.birth_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm">
                    {calculateAge(student.birth_date)} años (
                    {new Date(student.birth_date).toLocaleDateString("es-ES")})
                  </span>
                </div>
              )}

              {!student.course && (
                <Badge variant="outline" className="text-xs">
                  Sin curso asignado
                </Badge>
              )}

              <Button asChild className="w-full mt-4">
                <Link href={`/dashboard/alumnos/${student.id}`}>
                  Ver Perfil
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron alumnos
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm
              ? "Intenta con otros términos de búsqueda"
              : "Comienza registrando tu primer alumno"}
          </p>
          {canManage && (
            <Button asChild>
              <Link href="/dashboard/alumnos/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Alumno
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
