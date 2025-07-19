"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { School, Users, BookOpen, MessageSquare, Plus, Edit, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"

interface InstitutionDetailPageProps {
  institutionId: string
}

// Datos de ejemplo - en una app real vendrían de una API
const institutionData = {
  id: 1,
  name: "Colegio San Martín",
  address: "Av. San Martín 1234, Buenos Aires",
  phone: "+54 11 4567-8900",
  email: "info@colegiosanmartin.edu.ar",
  type: "Secundario",
  courses: [
    { id: 1, name: "1° Año A", students: 28, teacher: "Prof. García" },
    { id: 2, name: "1° Año B", students: 25, teacher: "Prof. López" },
    { id: 3, name: "2° Año A", students: 30, teacher: "Prof. Martínez" },
    { id: 4, name: "3° Año A", students: 22, teacher: "Prof. Rodríguez" },
  ],
  teachers: [
    { id: 1, name: "María García", subject: "Matemáticas", courses: 3 },
    { id: 2, name: "Juan López", subject: "Lengua", courses: 2 },
    { id: 3, name: "Ana Martínez", subject: "Historia", courses: 4 },
    { id: 4, name: "Carlos Rodríguez", subject: "Ciencias", courses: 2 },
  ],
  students: [
    { id: 1, name: "Pedro Gómez", course: "1° Año A", average: 8.5 },
    { id: 2, name: "Laura Fernández", course: "1° Año A", average: 9.2 },
    { id: 3, name: "Diego Silva", course: "2° Año A", average: 7.8 },
    { id: 4, name: "Sofía Morales", course: "3° Año A", average: 9.0 },
  ],
  observations: [
    {
      id: 1,
      author: "Prof. García",
      date: "2024-01-15",
      content: "Excelente participación en clase de matemáticas del curso 1° A",
    },
    {
      id: 2,
      author: "Director",
      date: "2024-01-10",
      content: "Reunión de padres programada para el 25 de enero",
    },
  ],
}

export function InstitutionDetailPage({ institutionId }: InstitutionDetailPageProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const institution = institutionData // En una app real, se haría fetch por ID

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <School className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{institution.name}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {institution.address}
              </div>
              <Badge variant="secondary">{institution.type}</Badge>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {institution.phone}
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {institution.email}
              </div>
            </div>
          </div>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cursos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{institution.courses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Profesores</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{institution.teachers.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alumnos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{institution.students.length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Observaciones</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{institution.observations.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="teachers">Profesores</TabsTrigger>
          <TabsTrigger value="students">Alumnos</TabsTrigger>
          <TabsTrigger value="observations">Observaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Cursos</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Curso
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {institution.courses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription>Profesor: {course.teacher}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{course.students} alumnos</span>
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/cursos/${course.id}`}>Ver Curso</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Profesores</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Profesor
            </Button>
          </div>
          <div className="space-y-4">
            {institution.teachers.map((teacher) => (
              <Card key={teacher.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                        <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{teacher.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {teacher.subject} • {teacher.courses} cursos
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Alumnos</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Alumno
            </Button>
          </div>
          <div className="space-y-4">
            {institution.students.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                        <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{student.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.course} • Promedio: {student.average}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="observations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Observaciones</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Observación
            </Button>
          </div>
          <div className="space-y-4">
            {institution.observations.map((observation) => (
              <Card key={observation.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                      <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{observation.author}</h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{observation.date}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{observation.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
