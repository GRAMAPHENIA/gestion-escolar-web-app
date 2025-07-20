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
          colorPrimary: "#f97316",
          colorBackground: "#09090b",
          colorInputBackground: "#18181b",
          colorInputText: "#f4f4f5",
          colorText: "#f4f4f5",
          colorTextSecondary: "#a1a1aa",
          colorDanger: "#ef4444",
          colorSuccess: "#22c55e",
          colorWarning: "#f59e0b",
          colorNeutral: "#71717a",
          colorShimmer: "rgba(255, 255, 255, 0.1)",
          colorShadow: "rgba(0, 0, 0, 0.3)",
        },
        elements: {
          rootBox: "w-full h-full",
          card: "shadow-2xl border border-zinc-800/80 bg-zinc-950/40 rounded-xl backdrop-blur-sm",
          headerTitle: "text-zinc-100 text-2xl font-bold tracking-tight",
          headerSubtitle: "text-zinc-400 text-sm",
          socialButtonsBlockButton:
            "border border-zinc-800 hover:bg-zinc-950/40 transition-colors",
          socialButtonsBlockButtonText: "text-zinc-200",
          footerActionLink:
            "text-orange-400 hover:text-orange-300 transition-colors",
          formFieldLabel: "text-zinc-300 font-medium text-sm",
          formFieldInput:
            "border border-zinc-800/80 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-zinc-950/40 text-zinc-100 rounded-lg transition-all placeholder:text-zinc-500",
          formButtonPrimary:
            "bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors",
          formButtonSecondary:
            "bg-zinc-800/50 hover:bg-zinc-800 text-zinc-200 font-medium py-2 px-4 rounded-lg transition-colors border border-zinc-800/80",
          dividerLine: "bg-zinc-800/80",
          dividerText: "text-zinc-500",
          alertText: "text-zinc-200",
          footerActionText: "text-zinc-400 text-sm",
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
          className={`${inter.className} min-h-screen bg-zinc-950/40 text-zinc-100 antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col bg-zinc-950/40">
              {children}
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
