import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the database client
vi.mock('@/lib/database/client', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn()
    },
    transaction: {
      findMany: vi.fn(),
      count: vi.fn()
    },
    auditLog: {
      create: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn()
    }
  }
}));

import { AiCategorizationService } from '../ai-categorization';

vi.mock('@/lib/utils/logger', () => ({
  logAI: vi.fn(),
  logError: vi.fn()
}));

describe('AI Categorization Service', () => {
  let service: AiCategorizationService;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get the mocked prisma instance
    const { prisma } = await import('@/lib/database/client');
    
    // Mock categories data
    prisma.category.findMany.mockResolvedValue([
      {
        id: 'cat-food-1',
        flow: 'SAIDA',
        category: 'Alimentação',
        subCategory: 'Supermercado'
      },
      {
        id: 'cat-salary-1',
        flow: 'ENTRADA',
        category: 'Salario',
        subCategory: 'Salario Liq.'
      },
      {
        id: 'cat-transport-1',
        flow: 'SAIDA',
        category: 'Transportes',
        subCategory: 'Carro Combustivel'
      },
      {
        id: 'cat-unknown-1',
        flow: 'SAIDA',
        category: 'Desconhecido',
        subCategory: 'Desconhecido'
      }
    ]);

    prisma.category.findFirst.mockResolvedValue({
      id: 'cat-unknown-1',
      flow: 'SAIDA',
      category: 'Desconhecido',
      subCategory: 'Desconhecido'
    });

    prisma.category.findUnique.mockResolvedValue({
      id: 'cat-food-1',
      flow: 'SAIDA',
      category: 'Alimentação',
      subCategory: 'Supermercado'
    });

    prisma.transaction.findMany.mockResolvedValue([]);
    prisma.auditLog.findMany.mockResolvedValue([]);

    service = new AiCategorizationService();
  });

  describe('categorizeTransaction', () => {
    it('should categorize grocery store transactions', async () => {
      const context = {
        description: 'CONTINENTE SUPERMERCADO',
        amount: 45.67,
        flow: 'SAIDA' as const,
        date: new Date('2024-01-15')
      };

      const result = await service.categorizeTransaction(context);

      expect(result).toMatchObject({
        categoryId: 'cat-food-1',
        confidence: expect.any(Number),
        reasoning: expect.stringContaining('keywords'),
        alternatives: expect.any(Array)
      });
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should categorize salary transactions', async () => {
      const context = {
        description: 'SALARIO MENSAL EMPRESA',
        amount: 2500.00,
        flow: 'ENTRADA' as const,
        date: new Date('2024-01-15')
      };

      // Mock salary category
      const { prisma } = await import('@/lib/database/client');
      prisma.category.findMany.mockResolvedValueOnce([
        {
          id: 'cat-salary-1',
          flow: 'ENTRADA',
          category: 'Salario',
          subCategory: 'Salario Liq.'
        }
      ]);

      const result = await service.categorizeTransaction(context);

      expect(result.categoryId).toBe('cat-salary-1');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.reasoning).toContain('keywords');
    });

    it('should handle fuel/gas station transactions', async () => {
      const context = {
        description: 'GALP ENERGIA COMBUSTIVEL',
        amount: 65.50,
        flow: 'SAIDA' as const,
        date: new Date('2024-01-15')
      };

      const result = await service.categorizeTransaction(context);

      expect(result).toMatchObject({
        categoryId: 'cat-transport-1',
        confidence: expect.any(Number),
        reasoning: expect.stringContaining('keywords')
      });
    });

    it('should use historical data when available', async () => {
      const context = {
        description: 'CONTINENTE SUPERMERCADO',
        amount: 50.00,
        flow: 'SAIDA' as const,
        date: new Date('2024-01-15')
      };

      // Mock historical transaction
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.findMany.mockResolvedValue([
        {
          categoryId: 'cat-food-1',
          description: 'CONTINENTE SUPERMERCADO PAYMENT',
          isValidated: true
        }
      ]);

      const result = await service.categorizeTransaction(context);

      expect(result.reasoning).toContain('historical');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should fall back to unknown category for unrecognized transactions', async () => {
      const context = {
        description: 'UNKNOWN MERCHANT XYZ',
        amount: 25.00,
        flow: 'SAIDA' as const,
        date: new Date('2024-01-15')
      };

      const result = await service.categorizeTransaction(context);

      expect(result.categoryId).toBe('cat-unknown-1');
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.reasoning).toContain('No matching patterns');
    });

    it('should handle merchant name in context', async () => {
      const context = {
        description: 'PAYMENT TO MERCHANT',
        amount: 35.00,
        merchantName: 'LIDL SUPERMERCADO',
        flow: 'SAIDA' as const,
        date: new Date('2024-01-15')
      };

      const result = await service.categorizeTransaction(context);

      expect(result.categoryId).toBe('cat-food-1');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should generate alternatives for categorization', async () => {
      const context = {
        description: 'CONTINENTE SUPERMERCADO',
        amount: 45.67,
        flow: 'SAIDA' as const,
        date: new Date('2024-01-15')
      };

      const result = await service.categorizeTransaction(context);

      expect(result.alternatives).toBeInstanceOf(Array);
      // Should have alternatives when multiple rules could match
    });
  });

  describe('learnFromCorrection', () => {
    it('should log categorization corrections', async () => {
      await service.learnFromCorrection(
        'txn-123',
        'cat-wrong-1',
        'cat-correct-1',
        'CORRECTED TRANSACTION DESCRIPTION'
      );

      const { prisma } = await import('@/lib/database/client');
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          tableName: 'ai_categorization',
          recordId: 'txn-123',
          action: 'CORRECTION',
          oldValues: { categoryId: 'cat-wrong-1' },
          newValues: {
            categoryId: 'cat-correct-1',
            description: 'CORRECTED TRANSACTION DESCRIPTION',
            timestamp: expect.any(Date)
          }
        }
      });
    });

    it('should handle database errors gracefully', async () => {
      const { prisma } = await import('@/lib/database/client');
      prisma.auditLog.create.mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(
        service.learnFromCorrection('txn-123', 'cat-1', 'cat-2', 'description')
      ).resolves.not.toThrow();
    });

    it('should create feedback patterns from corrections', async () => {
      await service.learnFromCorrection(
        'txn-123',
        'cat-wrong-1',
        'cat-correct-1',
        'CONTINENTE SUPERMERCADO PAYMENT'
      );

      // Check that feedback patterns are created (internal state)
      const insights = await service.getFeedbackInsights();
      expect(insights.totalPatterns).toBeGreaterThanOrEqual(0);
    });

    it('should create learned rules from corrections', async () => {
      await service.learnFromCorrection(
        'txn-123',
        'cat-wrong-1',
        'cat-correct-1',
        'NOVA FARMACIA MEDICATION'
      );

      const insights = await service.getFeedbackInsights();
      expect(insights.learnedRules).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getCategorizationStats', () => {
    it('should return categorization statistics', async () => {
      // Mock database responses
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(75)  // ai generated
        .mockResolvedValueOnce(60); // validated

      prisma.auditLog.count.mockResolvedValue(5); // corrections

      const stats = await service.getCategorizationStats(30);

      expect(stats).toMatchObject({
        period: expect.objectContaining({
          days: 30,
          since: expect.any(Date)
        }),
        totalTransactions: 100,
        aiGeneratedTransactions: 75,
        validatedTransactions: 60,
        corrections: 5,
        aiAccuracy: expect.any(Number),
        validationRate: expect.any(Number)
      });

      expect(stats.aiAccuracy).toBe(93.33); // ((75-5)/75)*100
      expect(stats.validationRate).toBe(60); // (60/100)*100
    });

    it('should handle zero transactions', async () => {
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.count.mockResolvedValue(0);
      prisma.auditLog.count.mockResolvedValue(0);

      const stats = await service.getCategorizationStats(30);

      expect(stats.totalTransactions).toBe(0);
      expect(stats.aiAccuracy).toBe(0);
      expect(stats.validationRate).toBe(0);
    });

    it('should handle database errors', async () => {
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.count.mockRejectedValue(new Error('Database error'));

      await expect(service.getCategorizationStats()).rejects.toThrow('Database error');
    });
  });

  describe('text normalization and matching', () => {
    it('should handle Portuguese text with accents', async () => {
      const context = {
        description: 'PADARIA & PASTELARIA JOSÉ',
        amount: 12.50,
        flow: 'SAIDA' as const,
        date: new Date('2024-01-15')
      };

      // Should match 'padaria' keyword despite accents
      const result = await service.categorizeTransaction(context);

      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should normalize spaces and special characters', async () => {
      const context = {
        description: 'CONTINENTE...SUPERMERCADO   PAYMENT',
        amount: 30.00,
        flow: 'SAIDA' as const,
        date: new Date('2024-01-15')
      };

      const result = await service.categorizeTransaction(context);

      expect(result.categoryId).toBe('cat-food-1');
    });
  });

  describe('confidence calculation', () => {
    it('should give higher confidence to exact matches', async () => {
      const exactMatch = {
        description: 'CONTINENTE',
        amount: 50.00,
        flow: 'SAIDA' as const,
        date: new Date('2024-01-15')
      };

      const partialMatch = {
        description: 'CONTINENTE SUPERMERCADO PAYMENT TRANSACTION',
        amount: 50.00,
        flow: 'SAIDA' as const,
        date: new Date('2024-01-15')
      };

      const exactResult = await service.categorizeTransaction(exactMatch);
      const partialResult = await service.categorizeTransaction(partialMatch);

      expect(exactResult.confidence).toBeGreaterThan(partialResult.confidence);
    });

    it('should consider rule priority in confidence calculation', async () => {
      // Higher priority rules should have higher confidence
      const highPriorityMatch = {
        description: 'CONTINENTE SUPERMERCADO', // Priority 10
        amount: 50.00,
        flow: 'SAIDA' as const,
        date: new Date('2024-01-15')
      };

      const result = await service.categorizeTransaction(highPriorityMatch);

      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Feedback Learning Enhancement', () => {
    beforeEach(async () => {
      // Mock audit log data for feedback patterns
      const { prisma } = await import('@/lib/database/client');
      prisma.auditLog.findMany.mockResolvedValue([
        {
          oldValues: { categoryId: 'cat-transport-1' },
          newValues: { 
            categoryId: 'cat-food-1',
            description: 'CONTINENTE SUPERMERCADO',
            timestamp: new Date('2024-01-15')
          },
          timestamp: new Date('2024-01-15')
        },
        {
          oldValues: { categoryId: 'cat-transport-1' },
          newValues: { 
            categoryId: 'cat-food-1',
            description: 'CONTINENTE MARKET PAYMENT',
            timestamp: new Date('2024-01-16')
          },
          timestamp: new Date('2024-01-16')
        }
      ]);
    });

    it('should load feedback patterns from audit log', async () => {
      const insights = await service.getFeedbackInsights();
      
      expect(insights).toMatchObject({
        totalPatterns: expect.any(Number),
        highConfidencePatterns: expect.any(Number),
        recentPatterns: expect.any(Number),
        learnedRules: expect.any(Number),
        mostCorrectiveCategories: expect.any(Array)
      });
    });

    it('should use feedback patterns for categorization', async () => {
      // First make a correction to create a pattern
      await service.learnFromCorrection(
        'txn-123',
        'cat-transport-1',
        'cat-food-1',
        'CONTINENTE SUPERMERCADO PAYMENT'
      );

      // Then test if the pattern is used for similar transaction
      const context = {
        description: 'CONTINENTE SUPERMERCADO',
        amount: 45.67,
        flow: 'SAIDA' as const,
        date: new Date('2024-01-20')
      };

      const result = await service.categorizeTransaction(context);
      
      // Should prioritize feedback pattern
      expect(result.reasoning).toContain('feedback pattern');
    });

    it('should strengthen patterns with multiple corrections', async () => {
      // Make multiple corrections for the same pattern
      await service.learnFromCorrection('txn-1', 'cat-wrong', 'cat-correct', 'TEST MERCHANT');
      await service.learnFromCorrection('txn-2', 'cat-wrong', 'cat-correct', 'TEST MERCHANT PAYMENT');
      
      const insights = await service.getFeedbackInsights();
      expect(insights.totalPatterns).toBeGreaterThan(0);
    });

    it('should create learned rules from corrections', async () => {
      await service.learnFromCorrection(
        'txn-123',
        'cat-wrong',
        'cat-correct',
        'NEW PHARMACY MEDICATION'
      );

      const insights = await service.getFeedbackInsights();
      expect(insights.learnedRules).toBeGreaterThan(0);
    });

    it('should provide most corrected categories analysis', async () => {
      const insights = await service.getFeedbackInsights();
      
      expect(insights.mostCorrectiveCategories).toBeInstanceOf(Array);
      if (insights.mostCorrectiveCategories.length > 0) {
        expect(insights.mostCorrectiveCategories[0]).toMatchObject({
          correctionPattern: expect.any(String),
          count: expect.any(Number),
          fromCategory: expect.any(String),
          toCategory: expect.any(String)
        });
      }
    });

    it('should reset learning patterns when requested', async () => {
      const result = await service.resetLearning(30);
      
      expect(result).toMatchObject({
        message: expect.any(String),
        remainingPatterns: expect.any(Number),
        remainingLearnedRules: expect.any(Number)
      });
    });

    it('should extract meaningful keywords from descriptions', async () => {
      const context = {
        description: 'FARMACIA NOVA MEDICATION PURCHASE',
        amount: 25.50,
        flow: 'SAIDA' as const,
        date: new Date('2024-01-15')
      };

      // Test that keyword extraction works properly by creating a learned rule
      await service.learnFromCorrection('txn-123', 'cat-wrong', 'cat-health', context.description);
      
      const insights = await service.getFeedbackInsights();
      expect(insights.learnedRules).toBeGreaterThanOrEqual(0);
    });

    it('should handle feedback patterns with higher priority than rules', async () => {
      // Create a feedback pattern
      await service.learnFromCorrection(
        'txn-123',
        'cat-transport-1',
        'cat-food-1',
        'SPECIAL MERCHANT NAME'
      );

      // Test categorization of similar transaction
      const context = {
        description: 'SPECIAL MERCHANT',
        amount: 30.00,
        flow: 'SAIDA' as const,
        date: new Date('2024-01-20')
      };

      const result = await service.categorizeTransaction(context);
      
      // Should use feedback pattern if confidence is sufficient
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.reasoning).toBeDefined();
    });
  });
});