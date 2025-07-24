import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock database client
vi.mock('@/lib/database/client', () => {
  const mockPrisma = {
    transaction: {
      aggregate: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn()
    },
    category: {
      findMany: vi.fn()
    }
  };
  return { prisma: mockPrisma };
});

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logApiRequest: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}));

import { GET, POST } from '../route';

describe('Advanced Analytics API', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get the mocked prisma instance
    const { prisma } = await import('@/lib/database/client');
    
    // Reset mock implementations
    prisma.transaction.aggregate.mockResolvedValue({
      _sum: { incomes: 5000, outgoings: 3000 },
      _count: 50
    });
    
    prisma.transaction.groupBy.mockResolvedValue([
      {
        categoryId: 'cat-1',
        _sum: { incomes: 1000, outgoings: 800 },
        _count: 10,
        _avg: { incomes: 100, outgoings: 80 }
      }
    ]);
    
    prisma.category.findMany.mockResolvedValue([
      { id: 'cat-1', category: 'Food & Beverages' }
    ]);
  });

  describe('GET /api/analytics/advanced', () => {
    it('should return comprehensive analytics data', async () => {
      const url = 'http://localhost:3000/api/analytics/advanced?dateFrom=2024-01-01&dateTo=2024-01-31';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        summary: expect.any(Object),
        categoryInsights: expect.any(Array),
        monthlyTrends: expect.any(Array),
        budgetPerformance: expect.any(Array),
        smartInsights: expect.any(Array),
        metadata: expect.any(Object)
      });
    });

    it('should handle date range parameters', async () => {
      const dateFrom = '2024-01-01';
      const dateTo = '2024-01-31';
      const url = `http://localhost:3000/api/analytics/advanced?dateFrom=${dateFrom}&dateTo=${dateTo}`;
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.metadata.dateRange).toMatchObject({
        from: new Date(dateFrom),
        to: new Date(dateTo)
      });
    });

    it('should handle category filter parameter', async () => {
      const categoryId = 'cat-food';
      const url = `http://localhost:3000/api/analytics/advanced?category=${categoryId}`;
      const request = new NextRequest(url);

      await GET(request);

      const { prisma } = await import('@/lib/database/client');
      expect(prisma.transaction.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: categoryId
          })
        })
      );
    });

    it('should use default date range when not provided', async () => {
      const url = 'http://localhost:3000/api/analytics/advanced';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.metadata.dateRange).toMatchObject({
        from: expect.any(Date),
        to: expect.any(Date)
      });
    });

    it('should include projections when requested', async () => {
      const url = 'http://localhost:3000/api/analytics/advanced?includeProjections=true';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.metadata.includeProjections).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.aggregate.mockRejectedValue(new Error('Database connection failed'));

      const url = 'http://localhost:3000/api/analytics/advanced';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database connection failed');
    });

    it('should calculate summary statistics correctly', async () => {
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.aggregate
        .mockResolvedValueOnce({
          _sum: { incomes: 5000, outgoings: 3000 },
          _count: 25
        })
        .mockResolvedValueOnce({
          _sum: { incomes: 4500, outgoings: 2800 },
          _count: 20
        });

      const url = 'http://localhost:3000/api/analytics/advanced';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.summary).toMatchObject({
        totalTransactions: 25,
        totalIncome: 5000,
        totalExpenses: 3000,
        netFlow: 2000,
        savingsRate: 40, // (2000/5000) * 100
        averageTransactionSize: 320 // (5000+3000)/25
      });
    });

    it('should generate category insights with trends', async () => {
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.groupBy
        .mockResolvedValueOnce([
          {
            categoryId: 'cat-food',
            _sum: { incomes: 0, outgoings: 1200 },
            _count: 15,
            _avg: { incomes: 0, outgoings: 80 }
          }
        ])
        .mockResolvedValueOnce([
          {
            categoryId: 'cat-food',
            _sum: { incomes: 0, outgoings: 1000 },
            _count: 12
          }
        ]);

      prisma.category.findMany.mockResolvedValue([
        { id: 'cat-food', category: 'Food & Dining' }
      ]);

      const url = 'http://localhost:3000/api/analytics/advanced';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.categoryInsights).toHaveLength(1);
      expect(data.data.categoryInsights[0]).toMatchObject({
        category: 'Food & Dining',
        totalAmount: 1200,
        transactionCount: 15,
        averageAmount: 80,
        trend: 'increasing',
        monthOverMonthChange: 20 // ((1200-1000)/1000)*100
      });
    });

    it('should generate monthly trends correctly', async () => {
      // Mock monthly data aggregation
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.aggregate.mockResolvedValue({
        _sum: { incomes: 2500, outgoings: 1800 },
        _count: 20
      });

      const url = 'http://localhost:3000/api/analytics/advanced?dateFrom=2024-01-01&dateTo=2024-01-31';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.monthlyTrends).toBeInstanceOf(Array);
      expect(data.data.monthlyTrends[0]).toMatchObject({
        month: expect.any(String),
        totalIncome: expect.any(Number),
        totalExpenses: expect.any(Number),
        netFlow: expect.any(Number),
        transactionCount: expect.any(Number),
        averageTransactionSize: expect.any(Number)
      });
    });

    it('should generate budget performance data', async () => {
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.groupBy.mockResolvedValue([
        {
          categoryId: 'cat-food',
          _sum: { outgoings: 1400 }
        }
      ]);

      const url = 'http://localhost:3000/api/analytics/advanced';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.budgetPerformance).toBeInstanceOf(Array);
      expect(data.data.budgetPerformance[0]).toMatchObject({
        category: expect.any(String),
        budgetedAmount: expect.any(Number),
        actualAmount: expect.any(Number),
        variance: expect.any(Number),
        variancePercentage: expect.any(Number),
        status: expect.stringMatching(/^(over|under|on-track)$/)
      });
    });

    it('should generate smart insights based on data patterns', async () => {
      // Mock high savings rate scenario
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.aggregate
        .mockResolvedValueOnce({
          _sum: { incomes: 5000, outgoings: 3000 },
          _count: 25
        })
        .mockResolvedValueOnce({
          _sum: { incomes: 4500, outgoings: 2800 },
          _count: 20
        });

      const url = 'http://localhost:3000/api/analytics/advanced';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.smartInsights).toBeInstanceOf(Array);
      
      // Should generate savings achievement insight for 40% savings rate
      const savingsInsight = data.data.smartInsights.find(
        insight => insight.type === 'achievement' && insight.title.includes('Savings')
      );
      expect(savingsInsight).toBeDefined();
    });

    it('should handle empty data gracefully', async () => {
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.aggregate.mockResolvedValue({
        _sum: { incomes: null, outgoings: null },
        _count: 0
      });

      prisma.transaction.groupBy.mockResolvedValue([]);
      prisma.category.findMany.mockResolvedValue([]);

      const url = 'http://localhost:3000/api/analytics/advanced';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.summary.totalTransactions).toBe(0);
      expect(data.data.categoryInsights).toHaveLength(0);
    });
  });

  describe('POST /api/analytics/advanced', () => {
    it('should handle export-data action', async () => {
      const requestBody = {
        action: 'export-data',
        parameters: { format: 'csv' }
      };

      const request = new NextRequest('http://localhost:3000/api/analytics/advanced', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.action).toBe('export-data');
      expect(data.data).toMatchObject({
        message: 'Data export initiated',
        downloadUrl: '/api/analytics/export/download',
        format: 'csv'
      });
    });

    it('should handle create-budget-goal action', async () => {
      const requestBody = {
        action: 'create-budget-goal',
        parameters: { category: 'Food & Dining', amount: 1200 }
      };

      const request = new NextRequest('http://localhost:3000/api/analytics/advanced', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.action).toBe('create-budget-goal');
      expect(data.data).toMatchObject({
        message: 'Budget goal created successfully',
        goalId: expect.any(String),
        category: 'Food & Dining',
        amount: 1200
      });
    });

    it('should handle generate-forecast action', async () => {
      const requestBody = {
        action: 'generate-forecast',
        parameters: { dateRange: '2024-02', category: 'all' }
      };

      const request = new NextRequest('http://localhost:3000/api/analytics/advanced', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.action).toBe('generate-forecast');
      expect(data.data).toMatchObject({
        message: 'Forecast generated successfully',
        projectedSpending: expect.any(Number),
        projectedIncome: expect.any(Number),
        confidence: expect.any(Number),
        period: '2024-02'
      });
    });

    it('should handle unknown actions', async () => {
      const requestBody = {
        action: 'unknown-action',
        parameters: {}
      };

      const request = new NextRequest('http://localhost:3000/api/analytics/advanced', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unknown action: unknown-action');
    });

    it('should handle malformed JSON requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/advanced', {
        method: 'POST',
        body: 'invalid json content'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle missing action parameter', async () => {
      const requestBody = {
        parameters: { format: 'csv' }
      };

      const request = new NextRequest('http://localhost:3000/api/analytics/advanced', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe('Analytics Helper Functions', () => {
    it('should calculate trends correctly', async () => {
      // Test increasing trend (>5% change)
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.groupBy
        .mockResolvedValueOnce([
          { categoryId: 'cat-1', _sum: { incomes: 0, outgoings: 1200 }, _count: 10 }
        ])
        .mockResolvedValueOnce([
          { categoryId: 'cat-1', _sum: { incomes: 0, outgoings: 1000 }, _count: 8 }
        ]);

      prisma.category.findMany.mockResolvedValue([
        { id: 'cat-1', category: 'Test Category' }
      ]);

      const url = 'http://localhost:3000/api/analytics/advanced';
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.categoryInsights[0].trend).toBe('increasing');
      expect(data.data.categoryInsights[0].monthOverMonthChange).toBe(20);
    });

    it('should handle zero division in calculations', async () => {
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.aggregate.mockResolvedValue({
        _sum: { incomes: null, outgoings: null },
        _count: 0
      });

      const url = 'http://localhost:3000/api/analytics/advanced';
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.summary.savingsRate).toBe(0);
      expect(data.data.summary.averageTransactionSize).toBe(0);
    });

    it('should sort category insights by total amount', async () => {
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.groupBy.mockResolvedValue([
        { categoryId: 'cat-1', _sum: { incomes: 0, outgoings: 500 }, _count: 5 },
        { categoryId: 'cat-2', _sum: { incomes: 0, outgoings: 1200 }, _count: 10 },
        { categoryId: 'cat-3', _sum: { incomes: 0, outgoings: 800 }, _count: 8 }
      ]);

      prisma.category.findMany.mockResolvedValue([
        { id: 'cat-1', category: 'Category A' },
        { id: 'cat-2', category: 'Category B' },
        { id: 'cat-3', category: 'Category C' }
      ]);

      const url = 'http://localhost:3000/api/analytics/advanced';
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      const amounts = data.data.categoryInsights.map(cat => cat.totalAmount);
      expect(amounts).toEqual([1200, 800, 500]); // Sorted descending
    });
  });

  describe('Smart Insights Generation', () => {
    it('should generate warning for increasing top spending category', async () => {
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.groupBy
        .mockResolvedValueOnce([
          { categoryId: 'cat-food', _sum: { incomes: 0, outgoings: 1400 }, _count: 15 }
        ])
        .mockResolvedValueOnce([
          { categoryId: 'cat-food', _sum: { incomes: 0, outgoings: 1200 }, _count: 12 }
        ]);

      prisma.category.findMany.mockResolvedValue([
        { id: 'cat-food', category: 'Food & Dining' }
      ]);

      const url = 'http://localhost:3000/api/analytics/advanced';
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      const warningInsight = data.data.smartInsights.find(
        insight => insight.type === 'warning' && insight.category === 'Food & Dining'
      );
      expect(warningInsight).toBeDefined();
      expect(warningInsight.title).toContain('Food & Dining Spending Increasing');
    });

    it('should generate income growth opportunity insight', async () => {
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.aggregate
        .mockResolvedValueOnce({
          _sum: { incomes: 5500, outgoings: 3000 }, // Current period
          _count: 25
        })
        .mockResolvedValueOnce({
          _sum: { incomes: 5000, outgoings: 2800 }, // Previous period  
          _count: 20
        });

      const url = 'http://localhost:3000/api/analytics/advanced';
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      const incomeInsight = data.data.smartInsights.find(
        insight => insight.type === 'opportunity' && insight.title.includes('Income Growth')
      );
      expect(incomeInsight).toBeDefined();
    });
  });
});