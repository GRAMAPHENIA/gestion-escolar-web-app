import { InstitutionDetailPage } from "@/features/institutions/components/institution-detail-page"
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InstitutionDetail({ params }: Props) {
  const { id } = await params
  
  // Validar que el ID sea un UUID válido
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    notFound()
  }
  
  return <InstitutionDetailPage institutionId={id} />
}
