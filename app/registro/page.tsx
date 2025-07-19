import { SignUp } from "@clerk/nextjs"
import { GraduationCap } from "lucide-react"

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Header con logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Crear Cuenta</h1>
          <p className="text-gray-600 dark:text-gray-400">Regístrate en el sistema de gestión educativa</p>
        </div>

        {/* Componente de registro de Clerk */}
        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-lg border-0 bg-white dark:bg-gray-800 rounded-lg",
                headerTitle: "text-xl font-semibold text-gray-900 dark:text-white mb-2",
                headerSubtitle: "text-sm text-gray-600 dark:text-gray-400 mb-6",
                socialButtonsBlockButton:
                  "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors",
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors w-full",
                formFieldInput:
                  "border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent",
                formFieldLabel: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
                footerActionLink: "text-primary hover:text-primary/80 font-medium",
                footerActionText: "text-gray-600 dark:text-gray-400",
              },
              variables: {
                colorPrimary: "#F6A03B",
                colorBackground: "#ffffff",
                colorInputBackground: "#ffffff",
                colorInputText: "#1f2937",
                borderRadius: "0.5rem",
              },
            }}
            redirectUrl="/dashboard"
            signInUrl="/"
            routing="path"
            path="/registro"
          />
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Al registrarte, aceptas nuestros términos y condiciones</p>
        </div>
      </div>
    </div>
  )
}
