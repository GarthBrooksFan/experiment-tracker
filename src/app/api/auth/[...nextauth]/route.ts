import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        // Get GitHub username from profile
        const githubUsername = (profile as any)?.login as string
        
        try {
          // Check if user is already authorized by GitHub username
          const dbUser = await prisma.user.findFirst({
            where: { githubUsername: githubUsername }
          })

          if (dbUser && dbUser.isAuthorized) {
            // User is pre-authorized, allow sign in
            return true
          } else if (dbUser && !dbUser.isAuthorized) {
            // User exists but not authorized
            return false
          } else {
            // New user, not authorized
            return false
          }
        } catch (error) {
          console.error("Error during sign in:", error)
          return false
        }
      }
      return true
    },
    async session({ token, session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email }
        })
        
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.isAuthorized = dbUser.isAuthorized
          session.user.githubUsername = dbUser.githubUsername
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt"
  }
})

export { handler as GET, handler as POST } 