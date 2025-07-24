import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET() {
  try {
    console.log('🔍 Fetching transactions...');
    
    const transactions = await prisma.transaction.findMany({
      include: {
        category: true,
        origin: true,
        bank: true,
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    console.log(`✅ Found ${transactions.length} transactions`);

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
    });

  } catch (error) {
    console.error('❌ Transactions API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transactions',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}