import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for updating experiments
const updateExperimentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  researcher: z.string().min(1).optional(),
  hypothesis: z.string().optional(),
  methodology: z.string().optional(),
  expectedDuration: z.string().optional(),
  durationUnit: z.enum(['minutes', 'hours', 'days', 'weeks']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  assignedResource: z.string().optional(),
  resourceUtilization: z.string().optional(),
  status: z.enum(['planned', 'in-progress', 'completed', 'failed', 'paused']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
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
  enableMonitoring: z.boolean().optional(),
  autoBackup: z.boolean().optional(),
  notifyOnCompletion: z.boolean().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/experiments/[id] - Get single experiment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const experiment = await prisma.experiment.findUnique({
      where: { id: params.id },
      include: {
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 50, // More logs for individual view
        },
      },
    });

    if (!experiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }

    // Parse tags from JSON string
    const experimentWithParsedTags = {
      ...experiment,
      tags: experiment.tags ? JSON.parse(experiment.tags) : [],
    };

    return NextResponse.json(experimentWithParsedTags);
  } catch (error) {
    console.error('Error fetching experiment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiment' },
      { status: 500 }
    );
  }
}

// PUT /api/experiments/[id] - Update experiment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = updateExperimentSchema.parse(body);
    
    // Check if experiment exists
    const existingExperiment = await prisma.experiment.findUnique({
      where: { id: params.id },
    });

    if (!existingExperiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }
    
    // Convert tags array to JSON string for storage
    const experimentData = {
      ...validatedData,
      tags: validatedData.tags ? JSON.stringify(validatedData.tags) : undefined,
    };

    const updatedExperiment = await prisma.experiment.update({
      where: { id: params.id },
      data: experimentData,
      include: {
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });

    // Parse tags back for response
    const responseExperiment = {
      ...updatedExperiment,
      tags: updatedExperiment.tags ? JSON.parse(updatedExperiment.tags) : [],
    };

    return NextResponse.json(responseExperiment);
  } catch (error) {
    console.error('Error updating experiment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update experiment' },
      { status: 500 }
    );
  }
}

// DELETE /api/experiments/[id] - Delete experiment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if experiment exists
    const existingExperiment = await prisma.experiment.findUnique({
      where: { id: params.id },
    });

    if (!existingExperiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }

    // Delete experiment (logs will be deleted due to cascade)
    await prisma.experiment.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Experiment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting experiment:', error);
    return NextResponse.json(
      { error: 'Failed to delete experiment' },
      { status: 500 }
    );
  }
} 