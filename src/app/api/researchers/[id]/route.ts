import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for updating researchers
const updateResearcherSchema = z.object({
  name: z.string().min(1),
}).partial();

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/researchers/[id] - Get specific researcher
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const researcher = await prisma.researcher.findUnique({
      where: { id: params.id },
    });

    if (!researcher) {
      return NextResponse.json(
        { error: 'Researcher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(researcher);
  } catch (error) {
    console.error('Error fetching researcher:', error);
    return NextResponse.json(
      { error: 'Failed to fetch researcher' },
      { status: 500 }
    );
  }
}

// PUT /api/researchers/[id] - Update researcher
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = updateResearcherSchema.parse(body);
    
    const researcher = await prisma.researcher.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(researcher);
  } catch (error: any) {
    console.error('Error updating researcher:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Researcher not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update researcher' },
      { status: 500 }
    );
  }
}

// DELETE /api/researchers/[id] - Delete researcher
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if researcher has any experiments (by name since experiments store researcher name, not ID)
    const researcher = await prisma.researcher.findUnique({
      where: { id: params.id },
    });

    if (!researcher) {
      return NextResponse.json(
        { error: 'Researcher not found' },
        { status: 404 }
      );
    }

    const experimentCount = await prisma.experiment.count({
      where: { researcher: researcher.name },
    });

    if (experimentCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete researcher with existing experiments',
          details: { experimentCount }
        },
        { status: 400 }
      );
    }

    await prisma.researcher.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Researcher deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting researcher:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Researcher not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete researcher' },
      { status: 500 }
    );
  }
} 