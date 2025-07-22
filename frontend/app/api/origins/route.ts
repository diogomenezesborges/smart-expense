import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

// GET /api/origins - List all origins
export async function GET() {
  try {
    const origins = await prisma.origin.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: origins,
    });

  } catch (error) {
    console.error('Error fetching origins:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}