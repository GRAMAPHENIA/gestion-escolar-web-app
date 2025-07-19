import type React from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardLayoutModern } from "@/features/dashboard/components/dashboard-layout-modern"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  // Si no está autenticado, redirigir al login
  if (!userId) {
    redirect("/")
  }

  return <DashboardLayoutModern>{children}</DashboardLayoutModern>
}
