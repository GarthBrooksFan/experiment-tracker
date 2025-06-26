"use client"

import { SessionProvider } from "next-auth/react"
import { AuthWrapper } from "./auth-wrapper"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthWrapper>{children}</AuthWrapper>
    </SessionProvider>
  )
} 