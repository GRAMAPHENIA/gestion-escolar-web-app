import Link from 'next/link'
import { ArrowLeft, AlertCircle, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InstitutionNotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Institución No Encontrada
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              La institución que buscas no existe o ha sido eliminada.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/dashboard/instituciones">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Instituciones
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  Ir al Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}