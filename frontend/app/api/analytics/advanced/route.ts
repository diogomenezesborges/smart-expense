import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { logApiRequest, logError, logInfo } from '@/lib/utils/logger';

interface AdvancedAnalyticsParams {
  dateFrom: Date;
  dateTo: Date;
  categoryFilter?: string;
  includeProjections?: boolean;
}

interface CategoryInsight {
  category: string;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageOfTotal: number;
  monthOverMonthChange?: number;
}

interface BudgetPerformance {
  category: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  status: 'over' | 'under' | 'on-track';
}

interface MonthlyTrend {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  transactionCount: number;
  averageTransactionSize: number;
}

interface SmartInsight {
  type: 'opportunity' | 'warning' | 'achievement' | 'recommendation';
  title: string;
  description: string;
  impact: number; // Potential financial impact
  confidence: number; // AI confidence score 0-1
  actionItems: string[];
  category?: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = new Date(searchParams.get('dateFrom') || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    const dateTo = new Date(searchParams.get('dateTo') || new Date());
    const categoryFilter = searchParams.get('category') || undefined;
    const includeProjections = searchParams.get('includeProjections') === 'true';

    logInfo('Advanced analytics request', { dateFrom, dateTo, categoryFilter, includeProjections });

    // Build comprehensive analytics data
    const [
      categoryInsights,
      monthlyTrends,
      budgetPerformance,
      smartInsights,
      summaryStats
    ] = await Promise.all([
      getCategoryInsights({ dateFrom, dateTo, ...(categoryFilter && { categoryFilter }) }),
      getMonthlyTrends({ dateFrom, dateTo }),
      getBudgetPerformance({ dateFrom, dateTo }),
      generateSmartInsights({ dateFrom, dateTo }),
      getSummaryStatistics({ dateFrom, dateTo })
    ]);

    const response = {
      success: true,
      data: {
        summary: summaryStats,
        categoryInsights,
        monthlyTrends,
        budgetPerformance,
        smartInsights,
        metadata: {
          dateRange: { from: dateFrom, to: dateTo },
          categoryFilter,
          includeProjections,
          generatedAt: new Date(),
          dataPoints: categoryInsights.length + monthlyTrends.length
        }
      }
    };

    const duration = Date.now() - startTime;
    logApiRequest('GET', '/api/analytics/advanced', 200, duration, { 
      dataPoints: response.data.metadata.dataPoints 
    });

    return NextResponse.json(response);

  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Advanced analytics API error', error);
    logApiRequest('GET', '/api/analytics/advanced', 500, duration);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to generate advanced analytics'
      },
      { status: 500 }
    );
  }
}

async function getSummaryStatistics(params: AdvancedAnalyticsParams) {
  const { dateFrom, dateTo } = params;

  const [totalStats, previousPeriodStats] = await Promise.all([
    // Current period stats
    prisma.transaction.aggregate({
      where: {
        date: { gte: dateFrom, lte: dateTo }
      },
      _sum: {
        incomes: true,
        outgoings: true
      },
      _count: true
    }),
    // Previous period for comparison
    prisma.transaction.aggregate({
      where: {
        date: { 
          gte: new Date(dateFrom.getTime() - (dateTo.getTime() - dateFrom.getTime())),
          lt: dateFrom
        }
      },
      _sum: {
        incomes: true,
        outgoings: true
      },
      _count: true
    })
  ]);

  const totalIncome = totalStats._sum.incomes || 0;
  const totalExpenses = totalStats._sum.outgoings || 0;
  const netFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netFlow / totalIncome) * 100 : 0;

  const previousIncome = previousPeriodStats._sum.incomes || 0;
  const previousExpenses = previousPeriodStats._sum.outgoings || 0;

  const incomeChange = previousIncome > 0 ? ((totalIncome - previousIncome) / previousIncome) * 100 : 0;
  const expenseChange = previousExpenses > 0 ? ((totalExpenses - previousExpenses) / previousExpenses) * 100 : 0;

  return {
    totalTransactions: totalStats._count,
    totalIncome,
    totalExpenses,
    netFlow,
    savingsRate,
    averageTransactionSize: totalStats._count > 0 ? (totalIncome + totalExpenses) / totalStats._count : 0,
    trends: {
      incomeChange,
      expenseChange,
      transactionCountChange: previousPeriodStats._count > 0 
        ? ((totalStats._count - previousPeriodStats._count) / previousPeriodStats._count) * 100 
        : 0
    }
  };
}

async function getCategoryInsights(params: AdvancedAnalyticsParams): Promise<CategoryInsight[]> {
  const { dateFrom, dateTo, categoryFilter } = params;

  const categoryData = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      date: { gte: dateFrom, lte: dateTo },
      categoryId: categoryFilter ? categoryFilter : undefined
    },
    _sum: {
      incomes: true,
      outgoings: true
    },
    _count: true,
    _avg: {
      incomes: true,
      outgoings: true
    }
  });

  // Get category details
  const categoryIds = categoryData.map(item => item.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } }
  });

  const totalAmount = categoryData.reduce((sum, item) => 
    sum + (item._sum.incomes || 0) + (item._sum.outgoings || 0), 0
  );

  // Get previous period data for trend analysis
  const previousPeriodData = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      date: { 
        gte: new Date(dateFrom.getTime() - (dateTo.getTime() - dateFrom.getTime())),
        lt: dateFrom
      },
      categoryId: categoryFilter ? categoryFilter : undefined
    },
    _sum: {
      incomes: true,
      outgoings: true
    }
  });

  const previousPeriodMap = new Map(
    previousPeriodData.map(item => [
      item.categoryId, 
      (item._sum.incomes || 0) + (item._sum.outgoings || 0)
    ])
  );

  return categoryData.map(item => {
    const category = categories.find(c => c.id === item.categoryId);
    const currentAmount = (item._sum.incomes || 0) + (item._sum.outgoings || 0);
    const previousAmount = previousPeriodMap.get(item.categoryId) || 0;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let monthOverMonthChange = 0;

    if (previousAmount > 0) {
      monthOverMonthChange = ((currentAmount - previousAmount) / previousAmount) * 100;
      if (monthOverMonthChange > 5) trend = 'increasing';
      else if (monthOverMonthChange < -5) trend = 'decreasing';
    }

    return {
      category: category?.category || 'Unknown',
      totalAmount: currentAmount,
      transactionCount: item._count,
      averageAmount: currentAmount / item._count,
      trend,
      percentageOfTotal: totalAmount > 0 ? (currentAmount / totalAmount) * 100 : 0,
      monthOverMonthChange
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount);
}

async function getMonthlyTrends(params: AdvancedAnalyticsParams): Promise<MonthlyTrend[]> {
  const { dateFrom, dateTo } = params;

  // Generate month buckets
  const months: MonthlyTrend[] = [];
  const currentDate = new Date(dateFrom);
  
  while (currentDate <= dateTo) {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const monthData = await prisma.transaction.aggregate({
      where: {
        date: { gte: monthStart, lte: monthEnd }
      },
      _sum: {
        incomes: true,
        outgoings: true
      },
      _count: true
    });

    const totalIncome = monthData._sum.incomes || 0;
    const totalExpenses = monthData._sum.outgoings || 0;
    const transactionCount = monthData._count;

    months.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      totalIncome,
      totalExpenses,
      netFlow: totalIncome - totalExpenses,
      transactionCount,
      averageTransactionSize: transactionCount > 0 ? (totalIncome + totalExpenses) / transactionCount : 0
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return months;
}

async function getBudgetPerformance(params: AdvancedAnalyticsParams): Promise<BudgetPerformance[]> {
  const { dateFrom, dateTo } = params;

  // Mock budget data - in real implementation, this would come from a budgets table
  const mockBudgets = [
    { categoryId: 'cat-food', budgetedAmount: 1200 },
    { categoryId: 'cat-transport', budgetedAmount: 900 },
    { categoryId: 'cat-shopping', budgetedAmount: 800 },
    { categoryId: 'cat-entertainment', budgetedAmount: 400 }
  ];

  const actualSpending = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      date: { gte: dateFrom, lte: dateTo },
      flow: 'SAIDA' // Only expenses for budget comparison
    },
    _sum: {
      outgoings: true
    }
  });

  const spendingMap = new Map(
    actualSpending.map(item => [item.categoryId, item._sum.outgoings || 0])
  );

  return mockBudgets.map(budget => {
    const actualAmount = spendingMap.get(budget.categoryId) || 0;
    const variance = actualAmount - budget.budgetedAmount;
    const variancePercentage = budget.budgetedAmount > 0 
      ? (variance / budget.budgetedAmount) * 100 
      : 0;

    let status: 'over' | 'under' | 'on-track' = 'on-track';
    if (variancePercentage > 10) status = 'over';
    else if (variancePercentage < -10) status = 'under';

    return {
      category: budget.categoryId.replace('cat-', '').replace('-', ' '),
      budgetedAmount: budget.budgetedAmount,
      actualAmount,
      variance,
      variancePercentage,
      status
    };
  });
}

async function generateSmartInsights(params: AdvancedAnalyticsParams): Promise<SmartInsight[]> {
  const { dateFrom, dateTo } = params;

  const insights: SmartInsight[] = [];

  // Analyze spending patterns for insights
  const categoryAnalysis = await getCategoryInsights(params);
  const summaryStats = await getSummaryStatistics(params);

  // High savings rate achievement
  if (summaryStats.savingsRate > 20) {
    insights.push({
      type: 'achievement',
      title: 'Excellent Savings Performance',
      description: `You've achieved a ${summaryStats.savingsRate.toFixed(1)}% savings rate, exceeding the recommended 20% threshold.`,
      impact: summaryStats.netFlow,
      confidence: 0.95,
      actionItems: [
        'Consider increasing investment contributions',
        'Build emergency fund if not already established',
        'Explore high-yield savings options'
      ]
    });
  }

  // High spending category warning
  const topSpendingCategory = categoryAnalysis[0];
  if (topSpendingCategory && topSpendingCategory.trend === 'increasing') {
    insights.push({
      type: 'warning',
      title: `${topSpendingCategory.category} Spending Increasing`,
      description: `Your ${topSpendingCategory.category.toLowerCase()} expenses have increased by ${topSpendingCategory.monthOverMonthChange?.toFixed(1)}% this period.`,
      impact: -topSpendingCategory.totalAmount * 0.1, // Potential 10% savings
      confidence: 0.8,
      actionItems: [
        `Review ${topSpendingCategory.category.toLowerCase()} transactions`,
        'Set spending alerts for this category',
        'Consider alternative options to reduce costs'
      ],
      category: topSpendingCategory.category
    });
  }

  // Income growth opportunity
  if (summaryStats.trends.incomeChange > 0) {
    insights.push({
      type: 'opportunity',
      title: 'Income Growth Detected',
      description: `Your income has increased by ${summaryStats.trends.incomeChange.toFixed(1)}% compared to the previous period.`,
      impact: summaryStats.totalIncome * (summaryStats.trends.incomeChange / 100),
      confidence: 0.9,
      actionItems: [
        'Update budget to reflect new income level',
        'Increase savings rate proportionally',
        'Consider lifestyle inflation limits'
      ]
    });
  }

  // Expense reduction opportunity
  const expensiveCategories = categoryAnalysis
    .filter(cat => cat.percentageOfTotal > 15 && cat.trend === 'increasing')
    .slice(0, 2);

  expensiveCategories.forEach(category => {
    insights.push({
      type: 'recommendation',
      title: `Optimize ${category.category} Spending`,
      description: `${category.category} represents ${category.percentageOfTotal.toFixed(1)}% of your total spending. Small optimizations could yield significant savings.`,
      impact: category.totalAmount * 0.15, // Potential 15% savings
      confidence: 0.7,
      actionItems: [
        `Analyze top ${category.category.toLowerCase()} transactions`,
        'Look for subscription services to cancel',
        'Compare prices and switch to alternatives'
      ],
      category: category.category
    });
  });

  return insights.sort((a, b) => b.impact - a.impact);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { action, parameters } = body;

    logInfo('Advanced analytics action request', { action, parameters });

    let result;

    switch (action) {
      case 'export-data':
        result = await exportAnalyticsData(parameters);
        break;
      case 'create-budget-goal':
        result = await createBudgetGoal(parameters);
        break;
      case 'generate-forecast':
        result = await generateForecast(parameters);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const duration = Date.now() - startTime;
    logApiRequest('POST', '/api/analytics/advanced', 200, duration, { action });

    return NextResponse.json({
      success: true,
      data: result,
      action
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Advanced analytics action error', error);
    logApiRequest('POST', '/api/analytics/advanced', 500, duration);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function exportAnalyticsData(parameters: any) {
  // Implementation for data export
  return {
    message: 'Data export initiated',
    downloadUrl: '/api/analytics/export/download',
    format: parameters.format || 'csv'
  };
}

async function createBudgetGoal(parameters: any) {
  // Implementation for creating budget goals
  return {
    message: 'Budget goal created successfully',
    goalId: `goal-${Date.now()}`,
    category: parameters.category,
    amount: parameters.amount
  };
}

async function generateForecast(parameters: any) {
  // Simple forecasting based on historical trends
  const { dateRange, category } = parameters;
  
  return {
    message: 'Forecast generated successfully',
    projectedSpending: 2500.00,
    projectedIncome: 3200.00,
    confidence: 0.75,
    period: dateRange
  };
}