import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = auth();

  // Si el usuario está autenticado, redirigir al dashboard
  if (userId) {
    redirect("/dashboard");
  }

  // Si no está autenticado, redirigir a la página de inicio de sesión
  redirect("/sign-in");
}
