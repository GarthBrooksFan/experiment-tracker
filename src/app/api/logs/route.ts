import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Force dynamic behavior for this route since it uses search params
export const dynamic = 'force-dynamic';

// GET /api/logs - Get all experiment logs across system
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filter parameters
    const experimentId = searchParams.get('experimentId') || '';
    const level = searchParams.get('level') || '';
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};
    
    if (experimentId) {
      where.experimentId = experimentId;
    }
    
    if (level) {
      where.level = level;
    }
    
    if (search) {
      where.message = {
        contains: search,
      };
    }

    // Get logs with pagination and experiment details
    const [logs, total] = await Promise.all([
      prisma.experimentLog.findMany({
        where,
        orderBy: { timestamp: sortOrder as 'asc' | 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          experiment: {
            select: {
              id: true,
              name: true,
              researcher: true,
              status: true,
            },
          },
        },
      }),
      prisma.experimentLog.count({ where }),
    ]);

    // Parse metadata from JSON strings
    const logsWithParsedMetadata = logs.map(log => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : {},
    }));

    // Get summary statistics
    const summary = await prisma.experimentLog.groupBy({
      by: ['level'],
      where,
      _count: {
        level: true,
      },
    });

    const levelCounts = summary.reduce((acc, item) => {
      acc[item.level] = item._count.level;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      logs: logsWithParsedMetadata,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        totalLogs: total,
        levelCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
} 