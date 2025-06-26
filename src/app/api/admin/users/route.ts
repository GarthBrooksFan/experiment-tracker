import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"

const prisma = new PrismaClient()

// GET all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        githubUsername: true,
        isAuthorized: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// POST - authorize a user by GitHub username or email
export async function POST(request: NextRequest) {
  try {
    const { githubUsername, email, authorize } = await request.json()

    if (!githubUsername && !email) {
      return NextResponse.json(
        { error: "Either githubUsername or email is required" },
        { status: 400 }
      )
    }

    const whereClause = githubUsername 
      ? { githubUsername }
      : { email }

    const user = await prisma.user.upsert({
      where: whereClause,
      update: {
        isAuthorized: authorize ?? true,
      },
      create: {
        githubUsername,
        email,
        isAuthorized: authorize ?? true,
      },
    })

    return NextResponse.json({ 
      message: `User ${authorize ? 'authorized' : 'unauthorized'} successfully`,
      user: {
        id: user.id,
        githubUsername: user.githubUsername,
        email: user.email,
        isAuthorized: user.isAuthorized
      }
    })
  } catch (error) {
    console.error("Error updating user authorization:", error)
    return NextResponse.json(
      { error: "Failed to update user authorization" },
      { status: 500 }
    )
  }
} 