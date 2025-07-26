import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock the database client
vi.mock('@/lib/database/client', () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn()
    }
  }
}));

// Mock the validation functions
vi.mock('@/lib/validations', () => ({
  validateRequest: vi.fn(),
  TransactionQuerySchema: {},
  CreateTransactionSchema: {}
}));

describe('/api/transactions API Routes', () => {
  let mockPrisma: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { prisma } = await import('@/lib/database/client');
    mockPrisma = prisma;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/transactions', () => {
    it('should return paginated transactions successfully', async () => {
      const mockTransactions = [
        {
          id: 'txn-1',
          date: new Date('2024-01-15'),
          description: 'Coffee Shop',
          outgoings: 4.50,
          flow: 'SAIDA',
          origin: { name: 'Bank Transfer' },
          bank: { name: 'Test Bank' },
          category: { category: 'Food & Beverages' }
        },
        {
          id: 'txn-2',
          date: new Date('2024-01-14'),
          description: 'Salary',
          incomes: 3000.00,
          flow: 'ENTRADA',
          origin: { name: 'Employer' },
          bank: { name: 'Test Bank' },
          category: { category: 'Salary' }
        }
      ];

      const mockTotal = 50;

      // Mock validation
      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockReturnValue({
        page: 1,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc'
      });

      // Mock database calls
      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.transaction.count.mockResolvedValue(mockTotal);

      const request = new NextRequest('http://localhost:3000/api/transactions?page=1&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.transactions).toEqual(mockTransactions);
      expect(data.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNext: true,
        hasPrev: false
      });
    });

    it('should handle filtering by flow', async () => {
      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockReturnValue({
        page: 1,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc',
        flow: 'SAIDA'
      });

      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/transactions?flow=SAIDA');
      const response = await GET(request);

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            flow: 'SAIDA'
          })
        })
      );
    });

    it('should handle date range filtering', async () => {
      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-01-31');

      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockReturnValue({
        page: 1,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc',
        dateFrom,
        dateTo
      });

      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/transactions?dateFrom=2024-01-01&dateTo=2024-01-31');
      const response = await GET(request);

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: dateFrom,
              lte: dateTo
            }
          })
        })
      );
    });

    it('should handle amount range filtering', async () => {
      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockReturnValue({
        page: 1,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc',
        minAmount: 10,
        maxAmount: 100
      });

      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/transactions?minAmount=10&maxAmount=100');
      const response = await GET(request);

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array)
          })
        })
      );
    });

    it('should handle description search', async () => {
      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockReturnValue({
        page: 1,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc',
        description: 'coffee'
      });

      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/transactions?description=coffee');
      const response = await GET(request);

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            description: {
              contains: 'coffee',
              mode: 'insensitive'
            }
          })
        })
      );
    });

    it('should handle major category filtering', async () => {
      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockReturnValue({
        page: 1,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc',
        majorCategory: 'CUSTOS_VARIAVEIS'
      });

      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/transactions?majorCategory=CUSTOS_VARIAVEIS');
      const response = await GET(request);

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: {
              majorCategory: 'CUSTOS_VARIAVEIS'
            }
          })
        })
      );
    });

    it('should handle validation errors', async () => {
      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockImplementation(() => {
        throw new Error('Validation failed: Invalid page number');
      });

      const request = new NextRequest('http://localhost:3000/api/transactions?page=-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed: Invalid page number');
    });

    it('should handle database errors', async () => {
      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockReturnValue({
        page: 1,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc'
      });

      mockPrisma.transaction.findMany.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/transactions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database connection failed');
    });

    it('should calculate pagination correctly for edge cases', async () => {
      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockReturnValue({
        page: 3,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc'
      });

      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(50); // Exactly 3 pages

      const request = new NextRequest('http://localhost:3000/api/transactions?page=3&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination).toMatchObject({
        page: 3,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNext: false, // Last page
        hasPrev: true
      });
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction successfully', async () => {
      const mockTransactionData = {
        date: '2024-01-15',
        originId: 'cm123456789abcdef01',
        bankId: 'cm123456789abcdef02',
        flow: 'SAIDA',
        categoryId: 'cm123456789abcdef03',
        description: 'Coffee shop payment',
        outgoings: 4.50,
        month: 'JANEIRO',
        year: 2024,
        isAiGenerated: false,
        isValidated: true
      };

      const mockCreatedTransaction = {
        id: 'cm123456789abcdef04',
        ...mockTransactionData,
        date: new Date('2024-01-15'),
        incomes: null,
        notes: null,
        externalId: null,
        rawData: null,
        aiConfidence: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        origin: { name: 'Test Origin' },
        bank: { name: 'Test Bank' },
        category: { category: 'Food & Beverages' }
      };

      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockReturnValue(mockTransactionData);

      mockPrisma.transaction.create.mockResolvedValue(mockCreatedTransaction);

      const request = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify(mockTransactionData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCreatedTransaction);
      expect(data.message).toBe('Transaction created successfully');
    });

    it('should auto-set month and year from date', async () => {
      const mockTransactionData = {
        date: '2024-03-15', // March
        originId: 'cm123456789abcdef01',
        bankId: 'cm123456789abcdef02',
        flow: 'SAIDA',
        categoryId: 'cm123456789abcdef03',
        description: 'Test transaction',
        outgoings: 10.00
        // month and year not provided
      };

      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockReturnValue(mockTransactionData);

      mockPrisma.transaction.create.mockResolvedValue({
        id: 'test-id',
        ...mockTransactionData,
        month: 'MARCO',
        year: 2024
      });

      const request = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify(mockTransactionData)
      });

      const response = await POST(request);

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            month: 'MARCO',
            year: 2024
          })
        })
      );
    });

    it('should handle ENTRADA transactions', async () => {
      const mockTransactionData = {
        date: '2024-01-15',
        originId: 'cm123456789abcdef01',
        bankId: 'cm123456789abcdef02',
        flow: 'ENTRADA',
        categoryId: 'cm123456789abcdef03',
        description: 'Salary payment',
        incomes: 3000.00,
        month: 'JANEIRO',
        year: 2024
      };

      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockReturnValue(mockTransactionData);

      mockPrisma.transaction.create.mockResolvedValue({
        id: 'test-id',
        ...mockTransactionData,
        date: new Date('2024-01-15')
      });

      const request = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify(mockTransactionData)
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            flow: 'ENTRADA',
            incomes: 3000.00
          })
        })
      );
    });

    it('should handle validation errors on creation', async () => {
      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockImplementation(() => {
        throw new Error('Validation failed: Amount is required');
      });

      const request = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify({ description: 'Invalid transaction' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed: Amount is required');
    });

    it('should handle database errors on creation', async () => {
      const mockTransactionData = {
        date: '2024-01-15',
        originId: 'cm123456789abcdef01',
        bankId: 'cm123456789abcdef02',
        flow: 'SAIDA',
        categoryId: 'cm123456789abcdef03',
        description: 'Test transaction',
        outgoings: 10.00,
        month: 'JANEIRO',
        year: 2024
      };

      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockReturnValue(mockTransactionData);

      mockPrisma.transaction.create.mockRejectedValue(new Error('Database constraint violation'));

      const request = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify(mockTransactionData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database constraint violation');
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should include all transaction relations in response', async () => {
      const mockTransactionData = {
        date: '2024-01-15',
        originId: 'cm123456789abcdef01',
        bankId: 'cm123456789abcdef02',
        flow: 'SAIDA',
        categoryId: 'cm123456789abcdef03',
        description: 'Test transaction',
        outgoings: 10.00,
        month: 'JANEIRO',
        year: 2024
      };

      const { validateRequest } = await import('@/lib/validations');
      (validateRequest as any).mockReturnValue(mockTransactionData);

      mockPrisma.transaction.create.mockResolvedValue({
        id: 'test-id',
        ...mockTransactionData
      });

      const request = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify(mockTransactionData)
      });

      await POST(request);

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            origin: true,
            bank: true,
            category: true
          }
        })
      );
    });
  });

  describe('month name handling', () => {
    it('should correctly map all month numbers to Portuguese names', async () => {
      const monthTests = [
        { month: 0, expected: 'JANEIRO' },
        { month: 1, expected: 'FEVEREIRO' },
        { month: 2, expected: 'MARCO' },
        { month: 3, expected: 'ABRIL' },
        { month: 4, expected: 'MAIO' },
        { month: 5, expected: 'JUNHO' },
        { month: 6, expected: 'JULHO' },
        { month: 7, expected: 'AGOSTO' },
        { month: 8, expected: 'SETEMBRO' },
        { month: 9, expected: 'OUTUBRO' },
        { month: 10, expected: 'NOVEMBRO' },
        { month: 11, expected: 'DEZEMBRO' }
      ];

      for (const { month, expected } of monthTests) {
        const mockTransactionData = {
          date: new Date(2024, month, 15).toISOString(), // Use specific month
          originId: 'cm123456789abcdef01',
          bankId: 'cm123456789abcdef02',
          flow: 'SAIDA',
          categoryId: 'cm123456789abcdef03',
          description: 'Test transaction',
          outgoings: 10.00
        };

        const { validateRequest } = await import('@/lib/validations');
        (validateRequest as any).mockReturnValue(mockTransactionData);

        mockPrisma.transaction.create.mockResolvedValue({
          id: 'test-id',
          ...mockTransactionData
        });

        const request = new NextRequest('http://localhost:3000/api/transactions', {
          method: 'POST',
          body: JSON.stringify(mockTransactionData)
        });

        await POST(request);

        expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              month: expected
            })
          })
        );

        vi.clearAllMocks();
      }
    });
  });
});