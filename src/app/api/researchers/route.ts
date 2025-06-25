import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for creating researchers
const createResearcherSchema = z.object({
  name: z.string().min(1),
});

// Validation schema for updating researchers
const updateResearcherSchema = createResearcherSchema.partial();

// GET /api/researchers - List all researchers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Search and filter parameters
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.name = {
        contains: search,
      };
    }

    // Get researchers
    const researchers = await prisma.researcher.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
    });

    return NextResponse.json({
      researchers,
      total: researchers.length,
    });
  } catch (error) {
    console.error('Error fetching researchers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch researchers' },
      { status: 500 }
    );
  }
}

// POST /api/researchers - Create new researcher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = createResearcherSchema.parse(body);
    
    const researcher = await prisma.researcher.create({
      data: validatedData,
    });

    return NextResponse.json(researcher, { status: 201 });
  } catch (error) {
    console.error('Error creating researcher:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create researcher' },
      { status: 500 }
    );
  }
} 