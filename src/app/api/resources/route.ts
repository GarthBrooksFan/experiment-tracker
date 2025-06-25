import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/resources - Get all resources with current status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAvailability = searchParams.get('includeAvailability') === 'true';

    // Get all resources
    const resources = await prisma.resource.findMany({
      orderBy: [
        { type: 'asc' },
        { name: 'asc' },
      ],
    });

    // If availability is requested, calculate current usage from active experiments
    if (includeAvailability) {
      const resourcesWithAvailability = await Promise.all(
        resources.map(async (resource) => {
          // Get active experiments using this resource
          const activeExperiments = await prisma.experiment.findMany({
            where: {
              assignedResource: resource.resourceId,
              status: {
                in: ['in-progress', 'planned'],
              },
              startDate: { not: null },
            },
            select: {
              id: true,
              name: true,
              resourceUtilization: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          });

          // Calculate current utilization
          const currentUtilization = activeExperiments.reduce((total, exp) => {
            const utilization = exp.resourceUtilization ? parseInt(exp.resourceUtilization) : 0;
            return total + utilization;
          }, 0);

          // Determine status based on utilization
          let calculatedStatus = 'idle';
          if (currentUtilization > 90) {
            calculatedStatus = 'active';
          } else if (currentUtilization > 0) {
            calculatedStatus = 'active';
          }

          return {
            ...resource,
            calculatedUsage: Math.min(currentUtilization, 100),
            activeExperiments: activeExperiments.length,
            experiments: activeExperiments,
            availableCapacity: Math.max(0, 100 - currentUtilization),
          };
        })
      );

      return NextResponse.json({
        resources: resourcesWithAvailability,
        summary: {
          total: resources.length,
          active: resourcesWithAvailability.filter(r => r.calculatedUsage > 0).length,
          idle: resourcesWithAvailability.filter(r => r.calculatedUsage === 0).length,
          overAllocated: resourcesWithAvailability.filter(r => r.calculatedUsage > 100).length,
        },
      });
    }

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create new resource
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resourceId, name, type, totalUnits, status = 'active' } = body;

    if (!resourceId || !name || !type || !totalUnits) {
      return NextResponse.json(
        { error: 'resourceId, name, type, and totalUnits are required' },
        { status: 400 }
      );
    }

    // Check if resourceId already exists
    const existingResource = await prisma.resource.findUnique({
      where: { resourceId },
    });

    if (existingResource) {
      return NextResponse.json(
        { error: 'Resource with this ID already exists' },
        { status: 409 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        resourceId,
        name,
        type,
        totalUnits,
        status,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
} 