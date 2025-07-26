import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET() {
  try {
    console.log('🔍 Getting category breakdown...');

    // Get all expense transactions with categories
    const expenses = await prisma.transaction.findMany({
      where: { flow: 'SAIDA' },
      include: { category: true },
    });

    // Group by major category
    const categoryMap = new Map();
    
    expenses.forEach(transaction => {
      const majorCategory = transaction.category.majorCategory;
      const amount = parseFloat(transaction.outgoings?.toString() || '0');
      
      if (categoryMap.has(majorCategory)) {
        const existing = categoryMap.get(majorCategory);
        existing.total += amount;
        existing.transactionCount += 1;
      } else {
        categoryMap.set(majorCategory, {
          majorCategory,
          category: transaction.category.category,
          total: amount,
          transactionCount: 1,
        });
      }
    });

    // Convert to array and calculate percentages
    const totalExpenses = expenses.reduce((sum, t) => sum + (t.outgoings || 0), 0);
    
    const breakdown = Array.from(categoryMap.values()).map(item => ({
      ...item,
      percentage: totalExpenses > 0 ? (item.total / totalExpenses) * 100 : 0,
    }));

    // Sort by total descending
    breakdown.sort((a, b) => b.total - a.total);

    console.log(`✅ Found ${breakdown.length} expense categories`);

    return NextResponse.json({
      breakdown,
      totalExpenses,
    });

  } catch (error) {
    console.error('❌ Categories API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get categories',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}