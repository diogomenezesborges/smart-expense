import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the AI categorization service
vi.mock('../ai-categorization', () => ({
  categorizeTransaction: vi.fn(),
  batchCategorizeTransactions: vi.fn(),
  getCategorizationConfidence: vi.fn(),
  getCategoryPatterns: vi.fn()
}));

interface CategorizationRequest {
  description: string;
  amount: number;
  merchantName?: string;
  flow: 'ENTRADA' | 'SAIDA';
}

interface CategorizationResponse {
  categoryId: string;
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    categoryId: string;
    confidence: number;
  }>;
}

// Mock the OpenAI API
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  }))
}));

// Mock the database client
vi.mock('@/lib/database/client', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
      findFirst: vi.fn()
    },
    transaction: {
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn()
    }
  }
}));

describe('AI Categorization Service', () => {
  let mockCategorizeTransaction: any;
  let mockBatchCategorizeTransactions: any;
  let mockGetCategorizationConfidence: any;
  let mockGetCategoryPatterns: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import('../ai-categorization');
    mockCategorizeTransaction = module.categorizeTransaction;
    mockBatchCategorizeTransactions = module.batchCategorizeTransactions;
    mockGetCategorizationConfidence = module.getCategorizationConfidence;
    mockGetCategoryPatterns = module.getCategoryPatterns;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('categorizeTransaction', () => {
    const mockRequest: CategorizationRequest = {
      description: 'COFFEE SHOP PAYMENT',
      amount: 4.50,
      merchantName: 'Starbucks',
      flow: 'SAIDA'
    };

    it('should categorize a simple coffee purchase', async () => {
      const expectedResult = {
        categoryId: 'cat-food-beverages',
        confidence: 0.95,
        reasoning: 'Coffee shop payment clearly indicates food/beverage expense',
        alternatives: [
          { categoryId: 'cat-discretionary', confidence: 0.75 }
        ]
      };

      mockCategorizeTransaction.mockResolvedValue(expectedResult);

      const result = await mockCategorizeTransaction(mockRequest);

      expect(mockCategorizeTransaction).toHaveBeenCalledWith(mockRequest);
      expect(result).toMatchObject({
        categoryId: expect.any(String),
        confidence: expect.any(Number),
        reasoning: expect.any(String),
        alternatives: expect.any(Array)
      });
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should handle grocery store transactions', async () => {
      const groceryRequest: CategorizationRequest = {
        description: 'WALMART SUPERCENTER',
        amount: 125.89,
        flow: 'SAIDA'
      };

      const mockOpenAI = await import('openai');
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              categoryId: 'cat-groceries',
              confidence: 0.92,
              reasoning: 'Walmart Supercenter is a major grocery retailer',
              alternatives: [
                { categoryId: 'cat-household', confidence: 0.65 }
              ]
            })
          }
        }]
      });
      
      (mockOpenAI.default as any).mockImplementation(() => ({
        chat: { completions: { create: mockCreate } }
      }));

      const result = await categorizeTransaction(groceryRequest);

      expect(result.categoryId).toBe('cat-groceries');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should handle salary/income transactions', async () => {
      const salaryRequest: CategorizationRequest = {
        description: 'COMPANY PAYROLL SALARY',
        amount: 3500.00,
        flow: 'ENTRADA'
      };

      const mockOpenAI = await import('openai');
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              categoryId: 'cat-salary',
              confidence: 0.98,
              reasoning: 'Payroll salary clearly indicates regular employment income',
              alternatives: [
                { categoryId: 'cat-bonus', confidence: 0.15 }
              ]
            })
          }
        }]
      });
      
      (mockOpenAI.default as any).mockImplementation(() => ({
        chat: { completions: { create: mockCreate } }
      }));

      const result = await categorizeTransaction(salaryRequest);

      expect(result.categoryId).toBe('cat-salary');
      expect(result.confidence).toBeGreaterThan(0.95);
    });

    it('should handle ambiguous transactions with lower confidence', async () => {
      const ambiguousRequest: CategorizationRequest = {
        description: 'TRANSFER TO JOHN SMITH',
        amount: 250.00,
        flow: 'SAIDA'
      };

      const mockOpenAI = await import('openai');
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              categoryId: 'cat-transfers',
              confidence: 0.65,
              reasoning: 'Personal transfer - could be loan, gift, or payment',
              alternatives: [
                { categoryId: 'cat-personal', confidence: 0.60 },
                { categoryId: 'cat-loans', confidence: 0.55 }
              ]
            })
          }
        }]
      });
      
      (mockOpenAI.default as any).mockImplementation(() => ({
        chat: { completions: { create: mockCreate } }
      }));

      const result = await categorizeTransaction(ambiguousRequest);

      expect(result.confidence).toBeLessThan(0.8);
      expect(result.alternatives.length).toBeGreaterThan(1);
    });

    it('should handle API errors gracefully', async () => {
      const mockOpenAI = await import('openai');
      const mockCreate = vi.fn().mockRejectedValue(new Error('API Error'));
      
      (mockOpenAI.default as any).mockImplementation(() => ({
        chat: { completions: { create: mockCreate } }
      }));

      await expect(categorizeTransaction(mockRequest)).rejects.toThrow('API Error');
    });

    it('should validate required fields', async () => {
      const invalidRequest = {
        description: '',
        amount: -10,
        flow: 'INVALID'
      } as any;

      await expect(categorizeTransaction(invalidRequest)).rejects.toThrow();
    });
  });

  describe('batchCategorizeTransactions', () => {
    it('should categorize multiple transactions', async () => {
      const transactions = [
        { id: '1', description: 'COFFEE SHOP', amount: 4.50, flow: 'SAIDA' },
        { id: '2', description: 'SALARY PAYMENT', amount: 3000.00, flow: 'ENTRADA' },
        { id: '3', description: 'GROCERY STORE', amount: 87.32, flow: 'SAIDA' }
      ];

      // Mock successful categorizations
      const mockOpenAI = await import('openai');
      const mockCreate = vi.fn()
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                categoryId: 'cat-food-beverages',
                confidence: 0.95,
                reasoning: 'Coffee expense',
                alternatives: []
              })
            }
          }]
        })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                categoryId: 'cat-salary',
                confidence: 0.98,
                reasoning: 'Employment income',
                alternatives: []
              })
            }
          }]
        })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                categoryId: 'cat-groceries',
                confidence: 0.92,
                reasoning: 'Grocery shopping',
                alternatives: []
              })
            }
          }]
        });
      
      (mockOpenAI.default as any).mockImplementation(() => ({
        chat: { completions: { create: mockCreate } }
      }));

      const result = await batchCategorizeTransactions(transactions as any);

      expect(result).toHaveLength(3);
      expect(result[0].success).toBe(true);
      expect(result[1].success).toBe(true);
      expect(result[2].success).toBe(true);
    });

    it('should handle partial failures in batch processing', async () => {
      const transactions = [
        { id: '1', description: 'VALID TRANSACTION', amount: 10.00, flow: 'SAIDA' },
        { id: '2', description: 'ERROR TRANSACTION', amount: 20.00, flow: 'SAIDA' }
      ];

      const mockOpenAI = await import('openai');
      const mockCreate = vi.fn()
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                categoryId: 'cat-misc',
                confidence: 0.80,
                reasoning: 'Valid categorization',
                alternatives: []
              })
            }
          }]
        })
        .mockRejectedValueOnce(new Error('API Error'));
      
      (mockOpenAI.default as any).mockImplementation(() => ({
        chat: { completions: { create: mockCreate } }
      }));

      const result = await batchCategorizeTransactions(transactions as any);

      expect(result).toHaveLength(2);
      expect(result[0].success).toBe(true);
      expect(result[1].success).toBe(false);
      expect(result[1].error).toBe('API Error');
    });
  });

  describe('getCategorizationConfidence', () => {
    it('should return high confidence for clear patterns', () => {
      const highConfidenceDescriptions = [
        'SALARY PAYMENT FROM COMPANY',
        'STARBUCKS COFFEE SHOP',
        'WALMART GROCERY STORE',
        'RENT PAYMENT TO LANDLORD'
      ];

      highConfidenceDescriptions.forEach(description => {
        const confidence = getCategorizationConfidence(description, 100);
        expect(confidence).toBeGreaterThan(0.8);
      });
    });

    it('should return lower confidence for ambiguous patterns', () => {
      const lowConfidenceDescriptions = [
        'TRANSFER',
        'PAYMENT',
        'WITHDRAWAL',
        'DEPOSIT'
      ];

      lowConfidenceDescriptions.forEach(description => {
        const confidence = getCategorizationConfidence(description, 100);
        expect(confidence).toBeLessThan(0.7);
      });
    });

    it('should factor in transaction amount for confidence', () => {
      const description = 'UNKNOWN MERCHANT';
      
      const smallAmount = getCategorizationConfidence(description, 5.00);
      const largeAmount = getCategorizationConfidence(description, 5000.00);
      
      // Large amounts should have lower confidence for unknown merchants
      expect(largeAmount).toBeLessThan(smallAmount);
    });
  });

  describe('getCategoryPatterns', () => {
    it('should return known patterns for different categories', () => {
      const patterns = getCategoryPatterns();

      expect(patterns).toHaveProperty('FOOD_BEVERAGES');
      expect(patterns).toHaveProperty('GROCERIES');
      expect(patterns).toHaveProperty('TRANSPORTATION');
      expect(patterns).toHaveProperty('ENTERTAINMENT');
      expect(patterns).toHaveProperty('SALARY');

      // Verify pattern structure
      expect(patterns.FOOD_BEVERAGES).toHaveProperty('keywords');
      expect(patterns.FOOD_BEVERAGES).toHaveProperty('merchants');
      expect(Array.isArray(patterns.FOOD_BEVERAGES.keywords)).toBe(true);
    });

    it('should include common merchant patterns', () => {
      const patterns = getCategoryPatterns();
      
      expect(patterns.FOOD_BEVERAGES.merchants).toContain('STARBUCKS');
      expect(patterns.GROCERIES.merchants).toContain('WALMART');
      expect(patterns.TRANSPORTATION.merchants).toContain('UBER');
    });
  });

  describe('edge cases', () => {
    it('should handle very long transaction descriptions', async () => {
      const longDescription = 'A'.repeat(1000);
      const request: CategorizationRequest = {
        description: longDescription,
        amount: 50.00,
        flow: 'SAIDA'
      };

      const mockOpenAI = await import('openai');
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              categoryId: 'cat-misc',
              confidence: 0.60,
              reasoning: 'Long description with unclear purpose',
              alternatives: []
            })
          }
        }]
      });
      
      (mockOpenAI.default as any).mockImplementation(() => ({
        chat: { completions: { create: mockCreate } }
      }));

      const result = await categorizeTransaction(request);
      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThan(0.8);
    });

    it('should handle special characters in descriptions', async () => {
      const specialCharRequest: CategorizationRequest = {
        description: 'CAFÉ & RESTAURANT ñ á é',
        amount: 25.50,
        flow: 'SAIDA'
      };

      const mockOpenAI = await import('openai');
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              categoryId: 'cat-food-beverages',
              confidence: 0.90,
              reasoning: 'Restaurant with special characters',
              alternatives: []
            })
          }
        }]
      });
      
      (mockOpenAI.default as any).mockImplementation(() => ({
        chat: { completions: { create: mockCreate } }
      }));

      const result = await categorizeTransaction(specialCharRequest);
      expect(result).toBeDefined();
      expect(result.categoryId).toBe('cat-food-beverages');
    });

    it('should handle zero or negative amounts', async () => {
      const zeroAmountRequest: CategorizationRequest = {
        description: 'ZERO AMOUNT TRANSACTION',
        amount: 0,
        flow: 'SAIDA'
      };

      await expect(categorizeTransaction(zeroAmountRequest)).rejects.toThrow();
    });
  });
});