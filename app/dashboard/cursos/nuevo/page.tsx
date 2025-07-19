import { CourseForm } from "@/components/forms/course-form"
import { canManageInstitutions } from "@/lib/auth-utils-updated"
import { redirect } from "next/navigation"

export default async function NuevoCursoPage() {
  const canManage = await canManageInstitutions()

  if (!canManage) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Curso</h1>
        <p className="text-gray-600 dark:text-gray-400">Crea un nuevo curso en el sistema</p>
      </div>

      <CourseForm />
    </div>
  )
}
