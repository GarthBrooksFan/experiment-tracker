import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      githubUsername?: string
      isAuthorized: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    githubUsername?: string
    isAuthorized: boolean
  }
} 