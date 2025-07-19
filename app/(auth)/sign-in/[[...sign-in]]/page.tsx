import { SignIn } from "@clerk/nextjs"
import { GraduationCap } from "lucide-react"
import { getClerkConfig } from "@/lib/clerk-config"

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gestión Escolar</h1>
          <p className="text-gray-600 dark:text-gray-400">Accede a tu sistema de gestión educativa</p>
        </div>

        <div className="flex justify-center">
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#F6A03B",
                colorBackground: "#ffffff",
                colorInputBackground: "#ffffff",
                colorInputText: "#1f2937",
              },
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-white",
                card: "shadow-lg border-0",
                headerTitle: "text-gray-900 dark:text-white",
                headerSubtitle: "text-gray-600 dark:text-gray-400",
                socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
            redirectUrl="/dashboard"
            signUpUrl="/registro"
          />
        </div>
      </div>
    </div>
  )
}
