import { InstitutionDetailPage } from "@/features/institutions/components/institution-detail-page"

interface Props {
  params: Promise<{ id: string }>
}

export default async function InstitutionDetail({ params }: Props) {
  const { id } = await params
  return <InstitutionDetailPage institutionId={id} />
}
