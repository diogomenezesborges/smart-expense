import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { Prisma } from '@prisma/client';

// GET /api/analytics/categories - Get category breakdown analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const originId = searchParams.get('originId');
    const bankId = searchParams.get('bankId');

    // Build where clause
    const where: Prisma.TransactionWhereInput = {
      flow: 'SAIDA', // Only expenses for category breakdown
    };
    
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }
    
    if (originId) where.originId = originId;
    if (bankId) where.bankId = bankId;

    // Get category breakdown by grouping transactions
    const categoryData = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: {
        outgoings: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          outgoings: 'desc',
        },
      },
    });

    // Get total expenses to calculate percentages
    const totalExpenses = categoryData.reduce((sum, item) => {
      return sum + (item._sum.outgoings?.toNumber() || 0);
    }, 0);

    // Enrich with category details
    const enrichedBreakdown = await Promise.all(
      categoryData.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
        });

        const total = item._sum.outgoings?.toNumber() || 0;
        const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;

        return {
          categoryId: item.categoryId,
          category: category?.category || 'Unknown',
          subCategory: category?.subCategory || 'Unknown',
          majorCategory: category?.majorCategory || 'Unknown',
          total,
          percentage: Math.round(percentage * 100) / 100,
          transactionCount: item._count,
        };
      })
    );

    return NextResponse.json({
      breakdown: enrichedBreakdown,
      totalExpenses,
    });

  } catch (error) {
    console.error('Error fetching category analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}