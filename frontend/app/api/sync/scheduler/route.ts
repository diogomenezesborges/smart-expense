import { NextRequest, NextResponse } from 'next/server';
import { syncScheduler } from '@/lib/services/sync-scheduler';
import { z } from 'zod';

const JobActionSchema = z.object({
  action: z.enum(['start', 'stop', 'trigger']),
  jobId: z.string(),
});

const ManualSyncSchema = z.object({
  action: z.literal('manual-sync'),
  jobId: z.string().optional(),
});

// GET /api/sync/scheduler - Get all scheduled jobs and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get('stats') === 'true';
    const statsDays = parseInt(searchParams.get('days') || '30');

    if (statsOnly) {
      const statistics = await syncScheduler.getSyncStatistics(statsDays);
      return NextResponse.json({
        success: true,
        data: { statistics },
      });
    }

    const [jobs, statistics] = await Promise.all([
      syncScheduler.getAllJobs(),
      syncScheduler.getSyncStatistics(7), // Last 7 days for overview
    ]);

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        statistics,
        serverTime: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error fetching scheduler status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/sync/scheduler - Control scheduled jobs or trigger manual sync
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle manual sync
    if (body.action === 'manual-sync') {
      const { jobId } = ManualSyncSchema.parse(body);
      const result = await syncScheduler.triggerManualSync(jobId);
      
      return NextResponse.json({
        success: true,
        data: result,
        message: 'Manual sync completed successfully',
      });
    }

    // Handle job actions
    const { action, jobId } = JobActionSchema.parse(body);

    switch (action) {
      case 'start':
        syncScheduler.startJob(jobId);
        return NextResponse.json({
          success: true,
          message: `Job ${jobId} started successfully`,
        });

      case 'stop':
        syncScheduler.stopJob(jobId);
        return NextResponse.json({
          success: true,
          message: `Job ${jobId} stopped successfully`,
        });

      case 'trigger':
        await syncScheduler.triggerManualSync(jobId);
        return NextResponse.json({
          success: true,
          message: `Job ${jobId} triggered successfully`,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error controlling scheduler:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}