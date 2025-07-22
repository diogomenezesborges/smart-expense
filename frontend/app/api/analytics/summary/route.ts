import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { Prisma } from '@prisma/client';

// GET /api/analytics/summary - Get transaction summary analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const originId = searchParams.get('originId');
    const bankId = searchParams.get('bankId');

    // Build where clause
    const where: Prisma.TransactionWhereInput = {};
    
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }
    
    if (originId) where.originId = originId;
    if (bankId) where.bankId = bankId;

    // Get summary aggregations
    const [incomeSum, outgoingsSum, transactionCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, flow: 'ENTRADA' },
        _sum: { incomes: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { ...where, flow: 'SAIDA' },
        _sum: { outgoings: true },
        _count: true,
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalIncome = incomeSum._sum.incomes?.toNumber() || 0;
    const totalOutgoings = outgoingsSum._sum.outgoings?.toNumber() || 0;
    const netAmount = totalIncome - totalOutgoings;

    // Get category breakdown
    const categoryBreakdown = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: {
        incomes: true,
        outgoings: true,
      },
      _count: true,
      orderBy: {
        _count: {
          _all: 'desc',
        },
      },
    });

    // Enrich category breakdown with category details
    const enrichedBreakdown = await Promise.all(
      categoryBreakdown.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
        });

        const amount = (item._sum.incomes?.toNumber() || 0) + (item._sum.outgoings?.toNumber() || 0);
        const total = totalIncome + totalOutgoings;
        const percentage = total > 0 ? (amount / total) * 100 : 0;

        return {
          categoryId: item.categoryId,
          category: category?.category || 'Unknown',
          subCategory: category?.subCategory || 'Unknown',
          majorCategory: category?.majorCategory || 'Unknown',
          flow: category?.flow || 'SAIDA',
          amount,
          percentage: Math.round(percentage * 100) / 100,
          transactionCount: item._count,
        };
      })
    );

    // Get monthly trend (last 12 months)
    const monthlyTrend = await prisma.$queryRaw<Array<{
      month: string;
      year: number;
      income: number;
      expenses: number;
    }>>`
      SELECT 
        EXTRACT(MONTH FROM date) as month_num,
        EXTRACT(YEAR FROM date) as year,
        SUM(CASE WHEN flow = 'ENTRADA' THEN COALESCE(incomes, 0) ELSE 0 END) as income,
        SUM(CASE WHEN flow = 'SAIDA' THEN COALESCE(outgoings, 0) ELSE 0 END) as expenses
      FROM "transactions"
      WHERE date >= NOW() - INTERVAL '12 months'
      GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
      ORDER BY year DESC, month_num DESC
      LIMIT 12
    `;

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const formattedTrend = monthlyTrend.map((item: any) => ({
      month: monthNames[item.month_num - 1],
      year: item.year,
      income: Number(item.income),
      expenses: Number(item.expenses),
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalOutgoings,
          netAmount,
          transactionCount,
          period: {
            from: dateFrom ? new Date(dateFrom) : null,
            to: dateTo ? new Date(dateTo) : null,
          },
        },
        categoryBreakdown: enrichedBreakdown.slice(0, 10), // Top 10 categories
        monthlyTrend: formattedTrend,
      },
    });

  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}