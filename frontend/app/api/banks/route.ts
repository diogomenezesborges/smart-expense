import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

// GET /api/banks - List all banks
export async function GET() {
  try {
    const banks = await prisma.bank.findMany({
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
      data: banks,
    });

  } catch (error) {
    console.error('Error fetching banks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}