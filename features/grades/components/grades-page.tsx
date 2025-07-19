"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  ClipboardList,
  Users,
  BookOpen,
  Calendar,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-updated";
import { useUser } from "@clerk/nextjs";

interface Student {
  full_name: string;
  courses?: Array<{
    name: string;
  }>;
}

interface Subject {
  name: string;
}

interface Professor {
  users?: {
    full_name: string;
  };
}

interface GradeWithRelations {
  id: string;
  grade: number | null;
  observation: string | null;
  date: string;
  students: Student;
  subjects: Subject;
  professors?: Professor;
}

interface Grade {
  id: string;
  grade: number | null;
  observation: string | null;
  date: string;
  student: {
    full_name: string;
    course: {
      name: string;
    };
  };
  subject: {
    name: string;
  };
  professor: {
    full_name: string;
  } | null;
}

interface Course {
  id: string;
  name: string;
}

export function GradesPage() {
  const { user } = useUser();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all"); // Updated default value
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    if (user) {
      loadGrades();
      loadCourses();
      checkPermissions();
    }
  }, [user, selectedCourse]);

  const loadGrades = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("grades")
        .select(
          `
          id,
          grade,
          observation,
          date,
          students:students_id (
            full_name,
            courses (
              name
            )
          ),
          subjects:subject_id (
            name
          ),
          professors:professor_id (
            users (
              full_name
            )
          )
        `
        )
        .order("date", { ascending: false });

      // Filtrar por curso si está seleccionado
      if (selectedCourse !== "all") {
        query = query.eq("students.course_id", selectedCourse);
      }

      const { data, error } = (await query) as {
        data: GradeWithRelations[] | null;
        error: any;
      };

      if (error) throw error;

      const gradesWithDetails: Grade[] = (data || []).map((grade) => ({
        id: grade.id,
        grade: grade.grade,
        observation: grade.observation,
        date: grade.date,
        student: {
          full_name: grade.students?.full_name || "Estudiante desconocido",
          course: {
            name: grade.students?.courses?.[0]?.name || "Sin curso",
          },
        },
        subject: {
          name: grade.subjects?.name || "Sin asignatura",
        },
        professor: grade.professors?.users
          ? {
              full_name:
                grade.professors.users.full_name || "Profesor desconocido",
            }
          : null,
      }));

      setGrades(gradesWithDetails);
    } catch (error) {
      console.error("Error loading grades:", error || "Unknown error");
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, name")
      .order("name");
    setCourses(data || []);
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

  const handleDeleteGrade = async (gradeId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta nota?")) return;

    try {
      const { error } = await supabase
        .from("grades")
        .delete()
        .eq("id", gradeId);

      if (error) throw error;

      setGrades(grades.filter((grade) => grade.id !== gradeId));
    } catch (error) {
      console.error("Error deleting grade:", error || "Unknown error");
      alert("Error al eliminar la nota");
    }
  };

  const filteredGrades = grades.filter(
    (grade) =>
      grade.student.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      grade.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (grade.observation &&
        grade.observation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getGradeColor = (grade: number | null) => {
    if (grade === null)
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    if (grade >= 7)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (grade >= 4)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
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
            Gestión de Notas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra las calificaciones de todos los alumnos
          </p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/dashboard/notas/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Nota
            </Link>
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por alumno, materia u observación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filtrar por curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cursos</SelectItem>{" "}
            {/* Updated value prop */}
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de notas */}
      <div className="space-y-4">
        {filteredGrades.map((grade) => (
          <Card key={grade.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {grade.student.full_name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <BookOpen className="h-4 w-4" />
                        <span>{grade.subject.name}</span>
                        <span>•</span>
                        <span>{grade.student.course.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Badge className={getGradeColor(grade.grade)}>
                      {grade.grade !== null
                        ? grade.grade.toFixed(1)
                        : "Sin calificar"}
                    </Badge>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(grade.date).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    {grade.professor && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>{grade.professor.full_name}</span>
                      </div>
                    )}
                  </div>

                  {grade.observation && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      {grade.observation}
                    </p>
                  )}
                </div>

                {canManage && (
                  <div className="flex space-x-2 ml-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/notas/${grade.id}/editar`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGrade(grade.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGrades.length === 0 && !loading && (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron notas
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || selectedCourse !== "all"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza registrando la primera calificación"}
          </p>
          {canManage && (
            <Button asChild>
              <Link href="/dashboard/notas/nueva">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Nota
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
