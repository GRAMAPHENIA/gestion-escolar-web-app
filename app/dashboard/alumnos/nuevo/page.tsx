import { StudentForm } from "@/components/forms/student-form"
import { hasRole } from "@/lib/auth-utils-updated"
import { redirect } from "next/navigation"

export default async function NuevoAlumnoPage() {
  const canManage = (await hasRole("admin")) || (await hasRole("director")) || (await hasRole("profesor"))

  if (!canManage) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nuevo Alumno</h1>
        <p className="text-gray-600 dark:text-gray-400">Registra un nuevo alumno en el sistema</p>
      </div>

      <StudentForm />
    </div>
  )
}
