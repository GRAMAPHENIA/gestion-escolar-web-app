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
                    card: "bg-transparent shadow-none w-full p-0",
                    headerTitle: "text-xl font-semibold text-white mb-1.5",
                    headerSubtitle: "text-sm text-zinc-400 mb-8",
                    formFieldLabel: "text-sm font-medium text-zinc-300 mb-2",
                    formFieldInput:
                      "bg-zinc-800/40 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/30 w-full text-base",
                    formButtonPrimary:
                      "bg-gradient-to-r from-orange-500/90 to-orange-600/90 hover:from-orange-500 hover:to-orange-600 text-white font-medium py-3 px-6 rounded-lg w-full transition-all hover:shadow-lg hover:shadow-orange-500/10",
                    footerActionLink:
                      "text-orange-400 hover:text-orange-300 font-medium transition-colors",
                    footerActionText: "text-zinc-400 text-sm",
                    dividerLine: "bg-zinc-800/50",
                    dividerText: "text-zinc-400 text-sm",
                    socialButtonsBlockButton:
                      "border border-zinc-700 hover:bg-zinc-800/30 text-white rounded-lg px-4 py-2.5 transition-colors w-full",
                    socialButtonsBlockButtonText: "font-medium text-sm",
                    identityPreviewEditButton:
                      "text-zinc-400 hover:text-white transition-colors",
                    formHeaderTitle: "text-white text-xl",
                    formHeaderSubtitle: "text-zinc-400 text-sm",
                    formFieldAction:
                      "text-zinc-400 hover:text-orange-400 transition-colors text-sm",
                    formFieldHintText: "text-zinc-500 text-xs mt-1.5",
                    formFieldSuccessText: "text-green-400 text-xs mt-1.5",
                    formFieldWarningText: "text-amber-400 text-xs mt-1.5",
                    formFieldErrorText: "text-red-400 text-xs mt-1.5",
                    footerAction: "mt-6 text-sm",
                    footerActionLink:
                      "text-orange-400 hover:text-orange-300 transition-colors font-medium",
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
