import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

// Mock Prisma
const mockTransactions = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    description: 'Grocery Store Purchase',
    incomes: null,
    outgoings: 45.50,
    flow: 'SAIDA',
    isValidated: true,
    aiConfidence: 0.95,
    notes: 'Weekly groceries',
    category: {
      id: 'cat1',
      category: 'Food',
      subCategory: 'Groceries',
      majorCategory: 'Essential'
    },
    origin: {
      id: 'org1',
      name: 'Supermarket Chain'
    },
    bank: {
      id: 'bank1',
      name: 'Main Bank'
    }
  },
  {
    id: '2',
    date: new Date('2024-01-20'),
    description: 'Salary Payment',
    incomes: 2500.00,
    outgoings: null,
    flow: 'ENTRADA',
    isValidated: false,
    aiConfidence: 0.88,
    notes: null,
    category: {
      id: 'cat2',
      category: 'Income',
      subCategory: 'Salary',
      majorCategory: 'Income'
    },
    origin: {
      id: 'org2',
      name: 'Employer Corp'
    },
    bank: {
      id: 'bank1',
      name: 'Main Bank'
    }
  },
  {
    id: '3',
    date: new Date('2024-01-10'),
    description: 'Gas Station Payment',
    incomes: null,
    outgoings: 75.30,
    flow: 'SAIDA',
    isValidated: true,
    aiConfidence: 0.92,
    notes: 'Fuel for car',
    category: {
      id: 'cat3',
      category: 'Transport',
      subCategory: 'Fuel',
      majorCategory: 'Transport'
    },
    origin: {
      id: 'org3',
      name: 'Gas Station'
    },
    bank: {
      id: 'bank2',
      name: 'Credit Card Bank'
    }
  }
];

vi.mock('@/lib/database/client', () => ({
  prisma: {
    transaction: {
      findMany: vi.fn()
    }
  }
}));

import { prisma } from '@/lib/database/client';

describe('Transactions API Route - Search and Filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return
    (prisma.transaction.findMany as any).mockResolvedValue(mockTransactions);
  });

  describe('GET /api/transactions-simple', () => {
    it('should return all transactions with no filters', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.transactions).toHaveLength(3);
      expect(data.count).toBe(3);
    });

    it('should filter by search term', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?search=grocery');
      
      await GET(request);
      
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { description: { contains: 'grocery', mode: 'insensitive' } },
            { notes: { contains: 'grocery', mode: 'insensitive' } },
            { category: { category: { contains: 'grocery', mode: 'insensitive' } } },
            { category: { subCategory: { contains: 'grocery', mode: 'insensitive' } } },
            { origin: { name: { contains: 'grocery', mode: 'insensitive' } } },
            { bank: { name: { contains: 'grocery', mode: 'insensitive' } } },
          ]
        },
        include: {
          category: true,
          origin: true,
          bank: true,
        },
        orderBy: { date: 'desc' }
      });
    });

    it('should filter by date range', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?startDate=2024-01-01&endDate=2024-01-31');
      
      await GET(request);
      
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          date: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31')
          }
        },
        include: {
          category: true,
          origin: true,
          bank: true,
        },
        orderBy: { date: 'desc' }
      });
    });

    it('should filter by multiple categories', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?categories=cat1,cat2');
      
      await GET(request);
      
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: { in: ['cat1', 'cat2'] }
        },
        include: {
          category: true,
          origin: true,
          bank: true,
        },
        orderBy: { date: 'desc' }
      });
    });

    it('should filter by flow type', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?flow=ENTRADA');
      
      await GET(request);
      
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          flow: 'ENTRADA'
        },
        include: {
          category: true,
          origin: true,
          bank: true,
        },
        orderBy: { date: 'desc' }
      });
    });

    it('should filter by validation status', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?validationStatus=validated');
      
      await GET(request);
      
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          isValidated: true
        },
        include: {
          category: true,
          origin: true,
          bank: true,
        },
        orderBy: { date: 'desc' }
      });
    });

    it('should filter by AI confidence range', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?minConfidence=80&maxConfidence=95');
      
      await GET(request);
      
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          aiConfidence: {
            gte: 0.8,
            lte: 0.95
          }
        },
        include: {
          category: true,
          origin: true,
          bank: true,
        },
        orderBy: { date: 'desc' }
      });
    });

    it('should filter by notes presence', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?hasNotes=with_notes');
      
      await GET(request);
      
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          notes: { not: null }
        },
        include: {
          category: true,
          origin: true,
          bank: true,
        },
        orderBy: { date: 'desc' }
      });
    });

    it('should filter by notes absence', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?hasNotes=without_notes');
      
      await GET(request);
      
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { notes: null },
            { notes: '' }
          ]
        },
        include: {
          category: true,
          origin: true,
          bank: true,
        },
        orderBy: { date: 'desc' }
      });
    });

    it('should sort by different fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?sortBy=description&sortOrder=asc');
      
      await GET(request);
      
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          category: true,
          origin: true,
          bank: true,
        },
        orderBy: { description: 'asc' }
      });
    });

    it('should combine multiple filters', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?search=grocery&flow=SAIDA&validationStatus=validated&categories=cat1');
      
      await GET(request);
      
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { description: { contains: 'grocery', mode: 'insensitive' } },
            { notes: { contains: 'grocery', mode: 'insensitive' } },
            { category: { category: { contains: 'grocery', mode: 'insensitive' } } },
            { category: { subCategory: { contains: 'grocery', mode: 'insensitive' } } },
            { origin: { name: { contains: 'grocery', mode: 'insensitive' } } },
            { bank: { name: { contains: 'grocery', mode: 'insensitive' } } },
          ],
          flow: 'SAIDA',
          isValidated: true,
          categoryId: { in: ['cat1'] }
        },
        include: {
          category: true,
          origin: true,
          bank: true,
        },
        orderBy: { date: 'desc' }
      });
    });

    it('should handle amount range filters', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?minAmount=50&maxAmount=100');
      
      await GET(request);
      
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { incomes: { gte: 50 } },
            { outgoings: { gte: 50 } },
            { incomes: { lte: 100 } },
            { outgoings: { lte: 100 } }
          ]
        },
        include: {
          category: true,
          origin: true,
          bank: true,
        },
        orderBy: { date: 'desc' }
      });
    });

    it('should return filter information in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?search=test&flow=ENTRADA');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.filters).toEqual({
        searchTerm: 'test',
        startDate: null,
        endDate: null,
        categoryIds: [],
        originIds: [],
        bankIds: [],
        flow: 'ENTRADA',
        minAmount: null,
        maxAmount: null,
        validationStatus: null,
        minConfidence: null,
        maxConfidence: null,
        hasNotes: null,
        sortBy: 'date',
        sortOrder: 'desc'
      });
    });

    it('should handle database errors gracefully', async () => {
      (prisma.transaction.findMany as any).mockRejectedValue(new Error('Database connection failed'));
      
      const request = new NextRequest('http://localhost:3000/api/transactions-simple');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch transactions');
      expect(data.details).toBe('Database connection failed');
    });

    it('should handle empty filter arrays', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?categories=&origins=&banks=');
      
      await GET(request);
      
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          category: true,
          origin: true,
          bank: true,
        },
        orderBy: { date: 'desc' }
      });
    });

    it('should handle invalid date formats gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?startDate=invalid-date');
      
      const response = await GET(request);
      
      // Should not crash, but may return different results depending on implementation
      expect(response.status).toBe(200);
    });

    it('should handle edge case filter values', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions-simple?minConfidence=0&maxConfidence=100&minAmount=0');
      
      await GET(request);
      
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          aiConfidence: {
            gte: 0,
            lte: 1
          },
          OR: [
            { incomes: { gte: 0 } },
            { outgoings: { gte: 0 } }
          ]
        },
        include: {
          category: true,
          origin: true,
          bank: true,
        },
        orderBy: { date: 'desc' }
      });
    });
  });
});