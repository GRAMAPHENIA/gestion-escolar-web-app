"use client"

import { UserButton } from "@clerk/nextjs"
import { useTheme } from "next-themes"

export function UserProfileButton() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "h-8 w-8 rounded-full border-2 border-gray-200 dark:border-gray-600",
          userButtonPopoverCard:
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg",
          userButtonPopoverActionButton:
            "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors",
          userButtonPopoverActionButtonText: "text-sm font-medium",
          userButtonPopoverActionButtonIcon: "w-4 h-4",
          userButtonPopoverFooter: "hidden", // Ocultar el footer de Clerk
        },
        variables: {
          colorPrimary: "#F6A03B",
        },
      }}
      userProfileMode="navigation"
      userProfileUrl="/perfil"
    />
  )
}
