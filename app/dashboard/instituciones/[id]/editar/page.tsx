import { Suspense } from "react";
import { ArrowLeft, Building2, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InstitutionEditForm } from "@/features/institutions/components/institution-edit-form";
import { notFound } from 'next/navigation';

// Componente de carga para el formulario
function FormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6 p-6 border rounded-lg">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarInstitucionPage({ params }: Props) {
  const { id } = await params;
  
  // Validar que el ID sea un UUID válido
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb y Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/instituciones/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Detalles
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Edit className="h-6 w-6" />
            Editar Institución
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Modifica los datos de la institución educativa
          </p>
        </div>
      </div>

      {/* Formulario */}
      <Suspense fallback={<FormSkeleton />}>
        <InstitutionEditForm institutionId={id} />
      </Suspense>
    </div>
  );
}