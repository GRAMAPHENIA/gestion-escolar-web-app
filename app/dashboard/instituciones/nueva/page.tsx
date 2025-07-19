import { InstitutionForm } from "@/components/forms/institution-form"
import { canManageInstitutions } from "@/lib/auth-utils"
import { redirect } from "next/navigation"

export default async function NuevaInstitucionPage() {
  const canManage = await canManageInstitutions()

  if (!canManage) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Institución</h1>
        <p className="text-gray-600 dark:text-gray-400">Crea una nueva institución educativa en el sistema</p>
      </div>

      <InstitutionForm />
    </div>
  )
}
