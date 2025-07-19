import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestión Escolar",
  description: "Sistema de gestión educativa moderno y eficiente",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#2563eb",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#1f2937",
          colorText: "#111827",
          colorTextSecondary: "#4b5563",
          colorDanger: "#dc2626",
          colorSuccess: "#16a34a",
          colorWarning: "#d97706",
          colorNeutral: "#6b7280",
          colorShimmer: "rgba(255, 255, 255, 0.36)",
          colorShadow: "rgba(0, 0, 0, 0.08)",
        },
        elements: {
          rootBox: "w-full h-full",
          card: "shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl",
          headerTitle: "text-gray-900 dark:text-white text-2xl font-bold",
          headerSubtitle: "text-gray-600 dark:text-gray-400 text-sm",
          socialButtonsBlockButton:
            "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
          socialButtonsBlockButtonText: "text-gray-700 dark:text-gray-200",
          footerActionLink:
            "text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors",
          formFieldLabel: "text-gray-700 dark:text-gray-300 font-medium",
          formFieldInput:
            "border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:bg-gray-800 dark:text-white rounded-lg transition-all",
          formButtonPrimary:
            "bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors",
          formButtonSecondary:
            "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors",
          dividerLine: "bg-gray-200 dark:bg-gray-700",
          dividerText: "text-gray-500 dark:text-gray-400",
          alertText: "text-gray-700 dark:text-gray-300",
          footerActionText: "text-gray-600 dark:text-gray-400 text-sm",
        },
        layout: {
          logoPlacement: "inside",
          socialButtonsVariant: "blockButton",
          termsPageUrl: "/terminos",
          privacyPageUrl: "/privacidad",
        },
      }}
    >
      <html lang="es" suppressHydrationWarning className="h-full">
        <body
          className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-950 text-foreground transition-colors`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col">{children}</div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
