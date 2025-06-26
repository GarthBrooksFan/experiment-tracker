import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // This function will only be called if the user is authenticated
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Only allow access if user has a valid token
        return !!token
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - auth (authentication pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|.*\\..*).)*",
  ],
} 