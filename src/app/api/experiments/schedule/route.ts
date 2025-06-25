import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/experiments/schedule - Get scheduled experiments for calendar view
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Calendar parameters
    const startDate = searchParams.get('startDate'); // e.g., "2024-01-15"
    const endDate = searchParams.get('endDate');     // e.g., "2024-01-21"
    const view = searchParams.get('view') || 'week';  // week, month
    const resourceFilter = searchParams.get('resource');
    const tagsFilter = searchParams.get('tags')?.split(',') || [];

    // Build where clause for date range
    const where: any = {
      AND: [
        {
          OR: [
            { startDate: { not: null } },
            { endDate: { not: null } },
          ],
        },
      ],
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      where.AND.push({
        OR: [
          // Experiment starts in range
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          // Experiment ends in range
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          // Experiment spans the entire range
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      });
    }

    // Add resource filter
    if (resourceFilter) {
      where.assignedResource = resourceFilter;
    }

    // Add tags filter (simple implementation)
    if (tagsFilter.length > 0) {
      where.tags = {
        contains: tagsFilter[0], // Simple implementation
      };
    }

    // Get scheduled experiments
    const experiments = await prisma.experiment.findMany({
      where,
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // Parse tags and format for calendar
    const formattedExperiments = experiments.map(exp => ({
      ...exp,
      tags: exp.tags ? JSON.parse(exp.tags) : [],
    }));

    // Group by date for easier frontend processing
    const experimentsByDate: { [date: string]: any[] } = {};
    
    formattedExperiments.forEach(exp => {
      if (exp.startDate) {
        if (!experimentsByDate[exp.startDate]) {
          experimentsByDate[exp.startDate] = [];
        }
        experimentsByDate[exp.startDate].push(exp);
      }
    });

    return NextResponse.json({
      experiments: formattedExperiments,
      experimentsByDate,
      summary: {
        total: formattedExperiments.length,
        byStatus: formattedExperiments.reduce((acc, exp) => {
          acc[exp.status] = (acc[exp.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byResource: formattedExperiments.reduce((acc, exp) => {
          if (exp.assignedResource) {
            acc[exp.assignedResource] = (acc[exp.assignedResource] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error('Error fetching scheduled experiments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled experiments' },
      { status: 500 }
    );
  }
}

// POST /api/experiments/schedule/conflicts - Check for scheduling conflicts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate, assignedResource, resourceUtilization, excludeExperimentId } = body;

    if (!startDate || !endDate || !assignedResource) {
      return NextResponse.json(
        { error: 'startDate, endDate, and assignedResource are required' },
        { status: 400 }
      );
    }

    // Find overlapping experiments on the same resource
    const where: any = {
      assignedResource,
      AND: [
        {
          OR: [
            // Existing experiment starts during new experiment
            {
              startDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            // Existing experiment ends during new experiment
            {
              endDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            // Existing experiment spans the new experiment
            {
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gte: endDate } },
              ],
            },
          ],
        },
      ],
    };

    // Exclude the current experiment if updating
    if (excludeExperimentId) {
      where.id = { not: excludeExperimentId };
    }

    const conflictingExperiments = await prisma.experiment.findMany({
      where,
      select: {
        id: true,
        name: true,
        researcher: true,
        startDate: true,
        endDate: true,
        resourceUtilization: true,
        status: true,
      },
    });

    // Calculate total utilization if provided
    let totalUtilization = 0;
    if (resourceUtilization) {
      totalUtilization = parseInt(resourceUtilization);
      
      conflictingExperiments.forEach(exp => {
        if (exp.resourceUtilization) {
          totalUtilization += parseInt(exp.resourceUtilization);
        }
      });
    }

    const hasConflicts = conflictingExperiments.length > 0;
    const utilizationOverLimit = totalUtilization > 100;

    return NextResponse.json({
      hasConflicts,
      utilizationOverLimit,
      totalUtilization,
      conflictingExperiments: conflictingExperiments.map(exp => ({
        ...exp,
        resourceUtilization: exp.resourceUtilization ? parseInt(exp.resourceUtilization) : 0,
      })),
      recommendations: {
        canProceed: !utilizationOverLimit,
        warning: hasConflicts ? 'Resource is already allocated during this time period' : null,
        suggestion: utilizationOverLimit 
          ? 'Consider reducing resource utilization or choosing a different time slot'
          : hasConflicts 
          ? 'Review conflicting experiments and their resource requirements'
          : 'No conflicts detected - safe to proceed',
      },
    });
  } catch (error) {
    console.error('Error checking scheduling conflicts:', error);
    return NextResponse.json(
      { error: 'Failed to check scheduling conflicts' },
      { status: 500 }
    );
  }
} 