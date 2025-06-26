"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/ui/components/Button"
import { signOut } from "next-auth/react"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = () => {
    switch (error) {
      case "AccessDenied":
        return "Access denied. Your GitHub account is not authorized to access this application."
      case "Configuration":
        return "There was a configuration error. Please contact the administrator."
      default:
        return "An authentication error occurred. Please try again."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage()}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <Button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Different Account
          </Button>
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Only authorized team members can access this application.
              <br />
              Contact your administrator to request access.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 