import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for updating resources
const updateResourceSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  totalUnits: z.string().min(1),
  status: z.enum(['active', 'idle', 'maintenance']),
}).partial();

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/resources/[id] - Get specific resource
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}

// PUT /api/resources/[id] - Update resource
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = updateResourceSchema.parse(body);
    
    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(resource);
  } catch (error: any) {
    console.error('Error updating resource:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE /api/resources/[id] - Delete resource
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if resource has any active experiments
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Check for active experiments using this resource (by resourceId)
    const activeExperimentCount = await prisma.experiment.count({
      where: { 
        assignedResource: resource.resourceId,
        status: {
          in: ['in-progress', 'planned']
        }
      },
    });

    if (activeExperimentCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete resource with active experiments',
          details: { 
            activeExperimentCount,
            message: 'Complete or cancel active experiments before deleting this resource'
          }
        },
        { status: 400 }
      );
    }

    // Check for any experiments (completed ones) for informational purposes
    const totalExperimentCount = await prisma.experiment.count({
      where: { assignedResource: resource.resourceId },
    });

    await prisma.resource.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ 
      message: 'Resource deleted successfully',
      details: {
        deletedResource: resource.name,
        totalExperimentsUsingResource: totalExperimentCount
      }
    });
  } catch (error: any) {
    console.error('Error deleting resource:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
} 