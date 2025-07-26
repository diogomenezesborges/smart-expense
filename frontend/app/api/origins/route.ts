import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

// Mock origins for when database is not available
const mockOrigins = [
  {
    id: '1',
    name: 'Comum',
    description: 'Shared family expenses',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      transactions: 45
    }
  },
  {
    id: '2',
    name: 'Diogo',
    description: 'Diogo personal expenses',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      transactions: 28
    }
  },
  {
    id: '3',
    name: 'Joana',
    description: 'Joana personal expenses',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      transactions: 33
    }
  }
];

// GET /api/origins - List all origins
export async function GET() {
  try {
    let origins;
    let isUsingMockData = false;

    try {
      // Try to use database first
      origins = await prisma.origin.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      });
    } catch (dbError) {
      // Fallback to mock data if database fails
      console.warn('Database unavailable, using mock data:', dbError);
      isUsingMockData = true;
      origins = mockOrigins;
    }

    return NextResponse.json({
      success: true,
      data: origins,
      isUsingMockData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching origins:', error);
    
    // Final fallback - return mock data
    return NextResponse.json({
      success: true,
      data: mockOrigins,
      isUsingMockData: true,
      error: 'Database unavailable, using mock data',
      timestamp: new Date().toISOString()
    });
  }
}