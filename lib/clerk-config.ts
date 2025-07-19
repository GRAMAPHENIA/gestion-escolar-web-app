/**
 * Configuración centralizada de Clerk
 * Contiene todas las configuraciones y utilidades relacionadas con la autenticación
 */

export const clerkConfig = {
  // URLs de redirección
  signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/",
  signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/",
  afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/dashboard",
  afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/dashboard",

  // Configuración de apariencia personalizada
  appearance: {
    variables: {
      colorPrimary: "#F6A03B", // Color naranja principal
      colorBackground: "#ffffff",
      colorInputBackground: "#ffffff",
      colorInputText: "#1f2937",
      borderRadius: "0.5rem",
    },
    elements: {
      // Estilos para el formulario principal
      rootBox: "w-full",
      card: "shadow-lg border-0 bg-white dark:bg-gray-800 rounded-lg",

      // Header del formulario
      headerTitle: "text-xl font-semibold text-gray-900 dark:text-white mb-2",
      headerSubtitle: "text-sm text-gray-600 dark:text-gray-400 mb-6",

      // Botones sociales (Google, etc.)
      socialButtonsBlockButton:
        "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors",
      socialButtonsBlockButtonText: "font-medium",

      // Botón principal
      formButtonPrimary:
        "bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors w-full",

      // Campos de entrada
      formFieldInput:
        "border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent",
      formFieldLabel: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",

      // Enlaces del footer
      footerActionLink: "text-primary hover:text-primary/80 font-medium",
      footerActionText: "text-gray-600 dark:text-gray-400",

      // Divisor
      dividerLine: "bg-gray-200 dark:bg-gray-600",
      dividerText: "text-gray-500 dark:text-gray-400 text-sm",

      // Mensajes de error
      formFieldErrorText: "text-red-600 dark:text-red-400 text-sm mt-1",

      // Avatar y perfil
      avatarBox: "h-8 w-8 rounded-full",
      userButtonPopoverCard:
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg",
      userButtonPopoverActionButton: "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
    },
  },
}

/**
 * Configuración específica para el modo oscuro
 */
export const darkModeClerkConfig = {
  ...clerkConfig,
  appearance: {
    ...clerkConfig.appearance,
    variables: {
      ...clerkConfig.appearance.variables,
      colorBackground: "#1f2937",
      colorInputBackground: "#374151",
      colorInputText: "#f9fafb",
    },
  },
}

/**
 * Utilidad para obtener la configuración según el tema
 */
export const getClerkConfig = (isDark = false) => {
  return isDark ? darkModeClerkConfig : clerkConfig
}
