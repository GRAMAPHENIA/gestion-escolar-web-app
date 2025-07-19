import { UserProfile } from "@clerk/nextjs"

export default function PerfilPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona tu información personal y configuración de cuenta</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent",
                navbar: "bg-gray-50 dark:bg-gray-700 rounded-t-lg",
                navbarButton: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600",
                navbarButtonActive: "bg-primary text-white",
                pageScrollBox: "p-6",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-white",
                formFieldInput:
                  "border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                formFieldLabel: "text-gray-700 dark:text-gray-300",
              },
              variables: {
                colorPrimary: "#F6A03B",
                borderRadius: "0.5rem",
              },
            }}
            routing="path"
            path="/perfil"
          />
        </div>
      </div>
    </div>
  )
}
