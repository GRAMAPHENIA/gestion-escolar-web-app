import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Gestión Escolar",
  description: "Accede a tu cuenta de Gestión Escolar",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6 flex flex-col">
      {/* Logo */}
      <div className="flex justify-center sm:justify-start mb-12 sm:mb-16">
        <Link href="/" className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-orange-500/90 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">GE</span>
          </div>
          <span className="text-2xl font-bold text-white hidden sm:inline-block">
            Gestión Escolar
          </span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-zinc-800 p-8 sm:p-10">
            <div className="text-center mb-10">
              <h1 className="text-2xl font-bold text-white mb-2">
                Bienvenido de vuelta
              </h1>
              <p className="text-zinc-400">
                Por favor inicia sesión para continuar
              </p>
            </div>

            <div className="space-y-5">
              <SignIn
                path="/sign-in"
                routing="path"
                signUpUrl="/registro"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-white dark:bg-zinc-900 shadow-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 w-full max-w-md mx-auto",

                    // Header
                    headerTitle:
                      "text-2xl font-bold text-zinc-900 dark:text-white mb-2 text-center",
                    headerSubtitle:
                      "text-sm text-zinc-500 dark:text-zinc-400 mb-8 text-center",

                    // Campos de formulario
                    formField: "space-y-1.5 mb-5 last:mb-0",
                    formFieldLabel:
                      "text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-between",
                    formFieldInput: `
                      bg-white dark:bg-zinc-900 
                      border border-zinc-300 dark:border-zinc-600 
                      text-zinc-900 dark:text-white 
                      rounded-xl 
                      px-4 py-3 
                      focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 
                      w-full 
                      text-base 
                      transition-all duration-150 
                      placeholder-zinc-400 dark:placeholder-zinc-500
                      hover:border-zinc-400 dark:hover:border-zinc-500
                      focus:outline-none
                      shadow-sm
                    `,

                    // Botón principal
                    formButtonPrimary: `
                      bg-gradient-to-r from-orange-500 to-orange-600 
                      hover:from-orange-600 hover:to-orange-700 
                      text-white 
                      font-medium 
                      py-3 px-6 
                      rounded-xl 
                      w-full 
                      transition-all 
                      duration-200
                      hover:shadow-lg 
                      hover:shadow-orange-500/10 
                      hover:scale-[1.02] 
                      active:scale-100
                    `,

                    // Enlaces de acción
                    footerAction:
                      "mt-8 text-sm text-center text-zinc-500 dark:text-zinc-400",
                    footerActionLink: `
                      text-orange-500 
                      hover:text-orange-400 
                      hover:underline 
                      underline-offset-2 
                      transition-colors 
                      duration-200 
                      font-medium 
                      text-sm 
                      inline-flex 
                      items-center 
                      gap-1.5
                    `,

                    // Mensajes de validación
                    formFieldHintText:
                      "text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 flex items-center gap-1.5",
                    formFieldSuccessText:
                      "text-emerald-500 text-xs mt-1.5 flex items-center gap-1.5",
                    formFieldWarningText:
                      "text-amber-500 text-xs mt-1.5 flex items-center gap-1.5",
                    formFieldErrorText:
                      "text-rose-500 text-xs mt-1.5 flex items-center gap-1.5",

                    // Botones sociales
                    socialButtonsBlockButton: `
                      border border-zinc-200 dark:border-zinc-700 
                      hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                      text-zinc-700 dark:text-zinc-200 
                      rounded-xl 
                      px-4 py-2.5 
                      transition-colors 
                      w-full 
                      flex 
                      items-center 
                      justify-center 
                      gap-3
    `,
                    socialButtonsBlockButtonText: "font-medium text-sm",

                    // Divisor
                    dividerLine: "bg-zinc-200 dark:bg-zinc-700",
                    dividerText:
                      "text-zinc-500 dark:text-zinc-400 text-xs px-3 bg-white dark:bg-zinc-900",

                    // Encabezado del formulario
                    formHeader: "space-y-2 text-center mb-8",

                    // Acción de campo
                    formFieldAction: `
                      text-xs 
                      text-orange-500 
                      hover:text-orange-400 
                      transition-colors 
                      font-medium 
                      flex 
                      items-center 
                      gap-1.5
                    `,

                    // Otros elementos
                    identityPreviewEditButton:
                      "text-zinc-400 hover:text-orange-400 transition-colors",
                    formHeaderTitle:
                      "text-2xl font-bold text-zinc-900 dark:text-white mb-1",
                    formHeaderSubtitle:
                      "text-sm text-zinc-500 dark:text-zinc-400 mb-6",
                  },
                }}
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-zinc-500">
              ¿Necesitas ayuda?{" "}
              <a
                href="#"
                className="text-orange-400 hover:underline hover:text-orange-300 transition-colors"
              >
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="py-6 text-center">
        <p className="text-sm text-zinc-500">
          {new Date().getFullYear()} Gestión Escolar. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  );
}
