import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET() {
  try {
    console.log('🔍 Calculating summary...');

    // Get totals
    const [incomeSum, expenseSum, totalCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { flow: 'ENTRADA' },
        _sum: { incomes: true },
      }),
      prisma.transaction.aggregate({
        where: { flow: 'SAIDA' },
        _sum: { outgoings: true },
      }),
      prisma.transaction.count(),
    ]);

    const totalIncome = incomeSum._sum.incomes?.toNumber() || 0;
    const totalExpenses = expenseSum._sum.outgoings?.toNumber() || 0;
    const netAmount = totalIncome - totalExpenses;

    // Get current month data
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [thisMonthIncome, thisMonthExpenses] = await Promise.all([
      prisma.transaction.aggregate({
        where: { 
          flow: 'ENTRADA',
          date: {
            gte: currentMonthStart,
            lt: nextMonthStart,
          }
        },
        _sum: { incomes: true },
      }),
      prisma.transaction.aggregate({
        where: { 
          flow: 'SAIDA',
          date: {
            gte: currentMonthStart,
            lt: nextMonthStart,
          }
        },
        _sum: { outgoings: true },
      }),
    ]);

    const thisMonthIncomeTotal = thisMonthIncome._sum.incomes?.toNumber() || 0;
    const thisMonthExpensesTotal = thisMonthExpenses._sum.outgoings?.toNumber() || 0;

    console.log(`✅ Summary calculated: Income: €${totalIncome}, Expenses: €${totalExpenses}`);

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netAmount,
      transactionCount: totalCount,
      thisMonth: {
        income: thisMonthIncomeTotal,
        expenses: thisMonthExpensesTotal,
        net: thisMonthIncomeTotal - thisMonthExpensesTotal,
      },
    });

  } catch (error) {
    console.error('❌ Summary API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate summary',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}