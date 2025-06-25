import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for creating experiments
const createExperimentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  researcher: z.string().min(1),
  hypothesis: z.string().optional(),
  methodology: z.string().optional(),
  expectedDuration: z.string().optional(),
  durationUnit: z.enum(['minutes', 'hours', 'days', 'weeks']).default('hours'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  assignedResource: z.string().optional(),
  resourceUtilization: z.string().optional(),
  status: z.enum(['planned', 'in-progress', 'completed', 'failed', 'paused']).default('planned'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  datasetPath: z.string().optional(),
  modelConfig: z.string().optional(),
  hardwareRequirements: z.string().optional(),
  dependencies: z.string().optional(),
  trainingTask: z.string().optional(),
  trainingBatchSize: z.string().optional(),
  episodeLength: z.string().optional(),
  learningRate: z.string().optional(),
  stepsTrainedFor: z.string().optional(),
  epochsTrainedFor: z.string().optional(),
  episodesInDataset: z.string().optional(),
  taskHoursInDataset: z.string().optional(),
  framesInDataset: z.string().optional(),
  scoring: z.string().optional(),
  enableMonitoring: z.boolean().default(true),
  autoBackup: z.boolean().default(true),
  notifyOnCompletion: z.boolean().default(true),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/experiments - List and search experiments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Search and filter parameters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const resource = searchParams.get('resource') || '';
    const researcher = searchParams.get('researcher') || '';
    const tags = searchParams.get('tags')?.split(',') || [];
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { id: { contains: search } },
        { researcher: { contains: search } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (resource) {
      where.assignedResource = resource;
    }
    
    if (researcher) {
      where.researcher = researcher;
    }
    
    if (tags.length > 0) {
      // For now, we'll do a simple string contains search on the tags JSON
      where.tags = {
        contains: tags[0], // Simple implementation - can be improved
      };
    }

    // Get experiments with pagination
    const [experiments, total] = await Promise.all([
      prisma.experiment.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          logs: {
            orderBy: { timestamp: 'desc' },
            take: 5, // Latest 5 logs
          },
        },
      }),
      prisma.experiment.count({ where }),
    ]);

    // Parse tags from JSON strings
    const experimentsWithParsedTags = experiments.map(exp => ({
      ...exp,
      tags: exp.tags ? JSON.parse(exp.tags) : [],
    }));

    return NextResponse.json({
      experiments: experimentsWithParsedTags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching experiments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiments' },
      { status: 500 }
    );
  }
}

// POST /api/experiments - Create new experiment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = createExperimentSchema.parse(body);
    
    // Convert tags array to JSON string for storage
    const experimentData = {
      ...validatedData,
      tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
    };

    const experiment = await prisma.experiment.create({
      data: experimentData,
    });

    // Parse tags back for response
    const responseExperiment = {
      ...experiment,
      tags: experiment.tags ? JSON.parse(experiment.tags) : [],
    };

    return NextResponse.json(responseExperiment, { status: 201 });
  } catch (error) {
    console.error('Error creating experiment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create experiment' },
      { status: 500 }
    );
  }
} 