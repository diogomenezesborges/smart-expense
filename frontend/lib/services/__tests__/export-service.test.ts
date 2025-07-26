import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies
vi.mock('papaparse', () => ({
  default: {
    unparse: vi.fn().mockReturnValue('mock,csv,data\n1,2,3'),
  },
}));

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    output: vi.fn().mockReturnValue(new Blob(['mock pdf'], { type: 'application/pdf' })),
  })),
}));

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn().mockReturnValue({}),
    json_to_sheet: vi.fn().mockReturnValue({}),
    book_append_sheet: vi.fn(),
  },
  write: vi.fn().mockReturnValue(new ArrayBuffer(0)),
}));

// Mock database client
vi.mock('@/lib/database/client', () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  },
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn().mockReturnValue('mock-blob-url');

import { ExportService } from '../export-service';

describe('ExportService', () => {
  let exportService: ExportService;

  beforeEach(async () => {
    vi.clearAllMocks();
    exportService = ExportService.getInstance();
    
    // Get the mocked prisma instance
    const { prisma } = await import('@/lib/database/client');
    
    // Setup default mocks
    prisma.transaction.findMany.mockResolvedValue([
      {
        id: 'txn-1',
        date: new Date('2024-01-15'),
        description: 'CONTINENTE SUPERMERCADO',
        amount: 45.67,
        incomes: 0,
        outgoings: 45.67,
        merchantName: 'CONTINENTE',
        bankName: 'Millennium',
        isValidated: true,
        isAiGenerated: true,
        createdAt: new Date('2024-01-15'),
        category: {
          category: 'Alimentação',
          subCategory: 'Supermercado',
          flow: 'SAIDA',
        },
      },
    ]);

    prisma.transaction.aggregate.mockResolvedValue({
      _sum: { incomes: 1000, outgoings: 800 },
      _count: 10,
    });

    prisma.transaction.groupBy.mockResolvedValue([
      {
        categoryId: 'cat-1',
        _sum: { incomes: 0, outgoings: 45.67 },
        _count: 1,
      },
    ]);

    prisma.category.findMany.mockResolvedValue([
      {
        id: 'cat-1',
        flow: 'SAIDA',
        category: 'Alimentação',
        subCategory: 'Supermercado',
        createdAt: new Date('2024-01-01'),
      },
    ]);
  });

  describe('exportData', () => {
    it('should export transaction data to CSV', async () => {
      const result = await exportService.exportData({
        format: 'csv',
        type: 'transactions',
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-01-31'),
      });

      expect(result.success).toBe(true);
      expect(result.downloadUrl).toBe('mock-blob-url');
      expect(result.filename).toMatch(/finance_transactions_\d{8}T\d{6}\.csv/);
      expect(result.metadata?.recordCount).toBe(1);
    });

    it('should export analytics data to Excel', async () => {
      const result = await exportService.exportData({
        format: 'excel',
        type: 'analytics',
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-01-31'),
      });

      expect(result.success).toBe(true);
      expect(result.downloadUrl).toBe('mock-blob-url');
      expect(result.filename).toMatch(/finance_analytics_\d{8}T\d{6}\.xlsx/);
    });

    it('should export budget data to PDF', async () => {
      const result = await exportService.exportData({
        format: 'pdf',
        type: 'budget',
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-01-31'),
      });

      expect(result.success).toBe(true);
      expect(result.downloadUrl).toBe('mock-blob-url');
      expect(result.filename).toMatch(/finance_budget_\d{8}T\d{6}\.pdf/);
    });

    it('should export category data', async () => {
      const result = await exportService.exportData({
        format: 'csv',
        type: 'categories',
      });

      expect(result.success).toBe(true);
      const { prisma } = await import('@/lib/database/client');
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: [{ flow: 'asc' }, { category: 'asc' }, { subCategory: 'asc' }],
      });
    });

    it('should handle date filters correctly', async () => {
      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-01-31');

      await exportService.exportData({
        format: 'csv',
        type: 'transactions',
        dateFrom,
        dateTo,
      });

      const { prisma } = await import('@/lib/database/client');
      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            date: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        })
      );
    });

    it('should handle category filter correctly', async () => {
      const categoryId = 'cat-food';

      await exportService.exportData({
        format: 'csv',
        type: 'transactions',
        categoryId,
      });

      const { prisma } = await import('@/lib/database/client');
      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            categoryId,
          },
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.findMany.mockRejectedValue(new Error('Database error'));

      const result = await exportService.exportData({
        format: 'csv',
        type: 'transactions',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unsupported format', async () => {
      const result = await exportService.exportData({
        format: 'invalid' as any,
        type: 'transactions',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported format');
    });

    it('should handle unsupported type', async () => {
      const result = await exportService.exportData({
        format: 'csv',
        type: 'invalid' as any,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported export type');
    });
  });

  describe('fetchTransactionData', () => {
    it('should transform transaction data correctly', async () => {
      const result = await exportService.exportData({
        format: 'csv',
        type: 'transactions',
      });

      expect(result.success).toBe(true);
      const { prisma } = await import('@/lib/database/client');
      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            category: {
              select: {
                category: true,
                subCategory: true,
                flow: true,
              },
            },
          },
          orderBy: { date: 'desc' },
          take: 10000,
        })
      );
    });
  });

  describe('fetchAnalyticsData', () => {
    it('should aggregate analytics data correctly', async () => {
      await exportService.exportData({
        format: 'csv',
        type: 'analytics',
      });

      const { prisma } = await import('@/lib/database/client');
      expect(prisma.transaction.aggregate).toHaveBeenCalled();
      expect(prisma.transaction.groupBy).toHaveBeenCalled();
    });
  });

  describe('fetchBudgetData', () => {
    it('should calculate budget performance correctly', async () => {
      const result = await exportService.exportData({
        format: 'csv',
        type: 'budget',
      });

      expect(result.success).toBe(true);
      const { prisma } = await import('@/lib/database/client');
      expect(prisma.transaction.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['categoryId'],
          _sum: {
            incomes: true,
            outgoings: true,
          },
          _count: true,
        })
      );
    });
  });

  describe('generateFilename', () => {
    it('should generate correct filename format', async () => {
      const result = await exportService.exportData({
        format: 'excel',
        type: 'transactions',
      });

      expect(result.filename).toMatch(/^finance_transactions_\d{8}T\d{6}\.xlsx$/);
    });

    it('should use correct extension for each format', async () => {
      const csvResult = await exportService.exportData({
        format: 'csv',
        type: 'transactions',
      });
      const excelResult = await exportService.exportData({
        format: 'excel',
        type: 'transactions',
      });
      const pdfResult = await exportService.exportData({
        format: 'pdf',
        type: 'transactions',
      });

      expect(csvResult.filename).toMatch(/\.csv$/);
      expect(excelResult.filename).toMatch(/\.xlsx$/);
      expect(pdfResult.filename).toMatch(/\.pdf$/);
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ExportService.getInstance();
      const instance2 = ExportService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('metadata generation', () => {
    it('should include correct metadata in export result', async () => {
      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-01-31');
      const categoryId = 'cat-food';

      const result = await exportService.exportData({
        format: 'csv',
        type: 'transactions',
        dateFrom,
        dateTo,
        categoryId,
      });

      expect(result.metadata).toMatchObject({
        recordCount: 1,
        generatedAt: expect.any(Date),
        filters: {
          dateFrom,
          dateTo,
          categoryId,
        },
      });
    });
  });
});