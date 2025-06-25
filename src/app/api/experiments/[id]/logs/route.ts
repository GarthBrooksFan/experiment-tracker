import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for creating experiment logs
const createLogSchema = z.object({
  message: z.string().min(1),
  level: z.enum(['info', 'warning', 'error', 'success']).default('info'),
  metadata: z.object({}).passthrough().optional(), // Allow any additional metadata
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/experiments/[id]/logs - Get logs for specific experiment
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filter parameters
    const level = searchParams.get('level') || '';
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Verify experiment exists
    const experiment = await prisma.experiment.findUnique({
      where: { id: params.id },
      select: { id: true, name: true },
    });

    if (!experiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }

    // Build where clause
    const where: any = {
      experimentId: params.id,
    };
    
    if (level) {
      where.level = level;
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.experimentLog.findMany({
        where,
        orderBy: { timestamp: sortOrder as 'asc' | 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.experimentLog.count({ where }),
    ]);

    // Parse metadata from JSON strings
    const logsWithParsedMetadata = logs.map(log => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : {},
    }));

    return NextResponse.json({
      logs: logsWithParsedMetadata,
      experiment: {
        id: experiment.id,
        name: experiment.name,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching experiment logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiment logs' },
      { status: 500 }
    );
  }
}

// POST /api/experiments/[id]/logs - Add log entry to experiment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = createLogSchema.parse(body);
    
    // Verify experiment exists
    const experiment = await prisma.experiment.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!experiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }

    // Convert metadata object to JSON string for storage
    const logData = {
      ...validatedData,
      experimentId: params.id,
      metadata: validatedData.metadata ? JSON.stringify(validatedData.metadata) : null,
      timestamp: new Date(),
    };

    const log = await prisma.experimentLog.create({
      data: logData,
    });

    // Parse metadata back for response
    const responseLog = {
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : {},
    };

    return NextResponse.json(responseLog, { status: 201 });
  } catch (error) {
    console.error('Error creating experiment log:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create experiment log' },
      { status: 500 }
    );
  }
} 