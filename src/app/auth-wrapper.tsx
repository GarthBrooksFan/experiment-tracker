"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Button } from "@/ui/components/Button"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Don't show header on auth pages
  const isAuthPage = pathname.startsWith('/auth')
  
  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (isAuthPage) {
    return <>{children}</>
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with user info and logout */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Experiment Tracker
                </h1>
                {session.user?.githubUsername && (
                  <span className="text-sm text-gray-500">
                    @{session.user.githubUsername}
                  </span>
                )}
              </div>
              <Button
                onClick={() => signOut()}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    )
  }

  // This shouldn't happen due to middleware, but just in case
  return <>{children}</>
} 