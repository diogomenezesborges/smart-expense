import { describe, it, expect } from 'vitest';
import {
  TransactionSchema,
  CreateTransactionSchema,
  UpdateTransactionSchema,
  TransactionQuerySchema,
  TransactionFlowSchema,
  MajorCategorySchema,
  MonthSchema,
  validateRequest
} from '../transaction';
import type { 
  TransactionInput, 
  CreateTransactionInput, 
  UpdateTransactionInput 
} from '../transaction';

describe('Transaction Validation Schemas', () => {
  describe('TransactionFlowSchema', () => {
    it('should accept valid flow values', () => {
      expect(TransactionFlowSchema.parse('ENTRADA')).toBe('ENTRADA');
      expect(TransactionFlowSchema.parse('SAIDA')).toBe('SAIDA');
    });

    it('should reject invalid flow values', () => {
      expect(() => TransactionFlowSchema.parse('INVALID')).toThrow();
      expect(() => TransactionFlowSchema.parse('')).toThrow();
      expect(() => TransactionFlowSchema.parse(null)).toThrow();
    });
  });

  describe('MajorCategorySchema', () => {
    it('should accept all valid major categories', () => {
      const validCategories = [
        'RENDIMENTO',
        'RENDIMENTO_EXTRA',
        'ECONOMIA_INVESTIMENTOS',
        'CUSTOS_FIXOS',
        'CUSTOS_VARIAVEIS',
        'GASTOS_SEM_CULPA'
      ];

      validCategories.forEach(category => {
        expect(MajorCategorySchema.parse(category)).toBe(category);
      });
    });

    it('should reject invalid major categories', () => {
      expect(() => MajorCategorySchema.parse('INVALID_CATEGORY')).toThrow();
      expect(() => MajorCategorySchema.parse('')).toThrow();
    });
  });

  describe('MonthSchema', () => {
    it('should accept all valid Portuguese months', () => {
      const validMonths = [
        'JANEIRO', 'FEVEREIRO', 'MARCO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
      ];

      validMonths.forEach(month => {
        expect(MonthSchema.parse(month)).toBe(month);
      });
    });

    it('should reject invalid months', () => {
      expect(() => MonthSchema.parse('JANUARY')).toThrow();
      expect(() => MonthSchema.parse('13')).toThrow();
      expect(() => MonthSchema.parse('')).toThrow();
    });
  });

  describe('TransactionSchema', () => {
    const validTransactionData: TransactionInput = {
      date: new Date('2024-01-15'),
      originId: 'cm123456789abcdef01',
      bankId: 'cm123456789abcdef02',
      flow: 'SAIDA',
      categoryId: 'cm123456789abcdef03',
      description: 'Coffee shop payment',
      incomes: null,
      outgoings: 4.50,
      notes: 'Morning coffee',
      month: 'JANEIRO',
      year: 2024,
      externalId: 'ext-123',
      rawData: { merchant: 'Starbucks' },
      aiConfidence: 0.95,
      isAiGenerated: true,
      isValidated: false
    };

    it('should accept valid transaction data', () => {
      const result = TransactionSchema.parse(validTransactionData);
      expect(result).toMatchObject(validTransactionData);
    });

    it('should validate ENTRADA flow requires incomes', () => {
      const entradaData = {
        ...validTransactionData,
        flow: 'ENTRADA' as const,
        incomes: 1000.00,
        outgoings: null
      };

      expect(() => TransactionSchema.parse(entradaData)).not.toThrow();
    });

    it('should validate SAIDA flow requires outgoings', () => {
      const saidaData = {
        ...validTransactionData,
        flow: 'SAIDA' as const,
        outgoings: 50.00,
        incomes: null
      };

      expect(() => TransactionSchema.parse(saidaData)).not.toThrow();
    });

    it('should reject ENTRADA without incomes', () => {
      const invalidData = {
        ...validTransactionData,
        flow: 'ENTRADA' as const,
        incomes: null,
        outgoings: null
      };

      expect(() => TransactionSchema.parse(invalidData)).toThrow();
    });

    it('should reject SAIDA without outgoings', () => {
      const invalidData = {
        ...validTransactionData,
        flow: 'SAIDA' as const,
        incomes: null,
        outgoings: null
      };

      expect(() => TransactionSchema.parse(invalidData)).toThrow();
    });

    it('should coerce date strings to Date objects', () => {
      const dataWithStringDate = {
        ...validTransactionData,
        date: '2024-01-15'
      };

      const result = TransactionSchema.parse(dataWithStringDate);
      expect(result.date).toBeInstanceOf(Date);
    });

    it('should coerce number strings to numbers', () => {
      const dataWithStringNumbers = {
        ...validTransactionData,
        outgoings: '4.50',
        year: '2024',
        aiConfidence: '0.95'
      };

      const result = TransactionSchema.parse(dataWithStringNumbers);
      expect(typeof result.outgoings).toBe('number');
      expect(typeof result.year).toBe('number');
      expect(typeof result.aiConfidence).toBe('number');
    });

    it('should validate year range', () => {
      const invalidYearData = {
        ...validTransactionData,
        year: 2050
      };

      expect(() => TransactionSchema.parse(invalidYearData)).toThrow();
    });

    it('should validate positive amounts', () => {
      const negativeAmountData = {
        ...validTransactionData,
        outgoings: -10.00
      };

      expect(() => TransactionSchema.parse(negativeAmountData)).toThrow();
    });

    it('should validate CUID format for IDs', () => {
      const invalidIdData = {
        ...validTransactionData,
        originId: 'invalid-id'
      };

      expect(() => TransactionSchema.parse(invalidIdData)).toThrow();
    });

    it('should validate description length', () => {
      const longDescriptionData = {
        ...validTransactionData,
        description: 'A'.repeat(501)
      };

      expect(() => TransactionSchema.parse(longDescriptionData)).toThrow();
    });

    it('should validate notes length', () => {
      const longNotesData = {
        ...validTransactionData,
        notes: 'A'.repeat(1001)
      };

      expect(() => TransactionSchema.parse(longNotesData)).toThrow();
    });

    it('should validate aiConfidence range', () => {
      const invalidConfidenceData = {
        ...validTransactionData,
        aiConfidence: 1.5
      };

      expect(() => TransactionSchema.parse(invalidConfidenceData)).toThrow();
    });
  });

  describe('CreateTransactionSchema', () => {
    const validCreateData: CreateTransactionInput = {
      date: new Date('2024-01-15'),
      originId: 'cm123456789abcdef01',
      bankId: 'cm123456789abcdef02',
      flow: 'SAIDA',
      categoryId: 'cm123456789abcdef03',
      description: 'Test transaction',
      outgoings: 25.00,
      month: 'JANEIRO',
      year: 2024,
      isAiGenerated: false,
      isValidated: true
    };

    it('should accept valid create transaction data', () => {
      const result = CreateTransactionSchema.parse(validCreateData);
      expect(result).toMatchObject(validCreateData);
    });

    it('should apply default values', () => {
      const minimalData = {
        date: new Date('2024-01-15'),
        originId: 'cm123456789abcdef01',
        bankId: 'cm123456789abcdef02',
        flow: 'SAIDA' as const,
        categoryId: 'cm123456789abcdef03',
        description: 'Test',
        outgoings: 10.00,
        month: 'JANEIRO' as const,
        year: 2024
      };

      const result = CreateTransactionSchema.parse(minimalData);
      expect(result.isAiGenerated).toBe(false);
      expect(result.isValidated).toBe(false);
    });
  });

  describe('UpdateTransactionSchema', () => {
    it('should accept partial updates', () => {
      const updateData: UpdateTransactionInput = {
        id: 'cm123456789abcdef01',
        description: 'Updated description',
        isValidated: true
      };

      const result = UpdateTransactionSchema.parse(updateData);
      expect(result).toMatchObject(updateData);
    });

    it('should require ID field', () => {
      const dataWithoutId = {
        description: 'Updated description'
      };

      expect(() => UpdateTransactionSchema.parse(dataWithoutId)).toThrow();
    });

    it('should validate partial field updates', () => {
      const updateData = {
        id: 'cm123456789abcdef01',
        description: '', // Invalid - too short
      };

      expect(() => UpdateTransactionSchema.parse(updateData)).toThrow();
    });
  });

  describe('TransactionQuerySchema', () => {
    it('should accept valid query parameters with defaults', () => {
      const queryData = {
        flow: 'SAIDA' as const,
        page: '2',
        limit: '50'
      };

      const result = TransactionQuerySchema.parse(queryData);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
      expect(result.sortBy).toBe('date');
      expect(result.sortOrder).toBe('desc');
    });

    it('should validate date range', () => {
      const invalidDateRange = {
        dateFrom: new Date('2024-02-01'),
        dateTo: new Date('2024-01-01') // Before dateFrom
      };

      expect(() => TransactionQuerySchema.parse(invalidDateRange)).toThrow();
    });

    it('should validate amount range', () => {
      const invalidAmountRange = {
        minAmount: 100,
        maxAmount: 50 // Less than minAmount
      };

      expect(() => TransactionQuerySchema.parse(invalidAmountRange)).toThrow();
    });

    it('should coerce string numbers to numbers', () => {
      const queryWithStrings = {
        page: '3',
        limit: '25',
        minAmount: '10.50',
        maxAmount: '100.00',
        year: '2024'
      };

      const result = TransactionQuerySchema.parse(queryWithStrings);
      expect(typeof result.page).toBe('number');
      expect(typeof result.limit).toBe('number');
      expect(typeof result.minAmount).toBe('number');
      expect(typeof result.maxAmount).toBe('number');
      expect(typeof result.year).toBe('number');
    });

    it('should validate pagination limits', () => {
      const invalidPagination = {
        page: 0, // Must be >= 1
        limit: 101 // Must be <= 100
      };

      expect(() => TransactionQuerySchema.parse(invalidPagination)).toThrow();
    });

    it('should coerce date strings', () => {
      const queryWithDateStrings = {
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31'
      };

      const result = TransactionQuerySchema.parse(queryWithDateStrings);
      expect(result.dateFrom).toBeInstanceOf(Date);
      expect(result.dateTo).toBeInstanceOf(Date);
    });
  });

  describe('validateRequest helper', () => {
    it('should validate and return data on success', () => {
      const validData = {
        flow: 'ENTRADA',
        page: 1,
        limit: 20
      };

      const result = validateRequest(validData, TransactionQuerySchema);
      expect(result).toMatchObject({
        flow: 'ENTRADA',
        page: 1,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc'
      });
    });

    it('should throw error on validation failure', () => {
      const invalidData = {
        flow: 'INVALID_FLOW',
        page: -1
      };

      expect(() => validateRequest(invalidData, TransactionQuerySchema)).toThrow('Validation failed');
    });

    it('should handle undefined input', () => {
      expect(() => validateRequest(undefined, TransactionQuerySchema)).toThrow();
    });

    it('should handle null input', () => {
      expect(() => validateRequest(null, TransactionQuerySchema)).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings in optional fields', () => {
      const dataWithEmptyStrings = {
        date: new Date('2024-01-15'),
        originId: 'cm123456789abcdef01',
        bankId: 'cm123456789abcdef02',
        flow: 'SAIDA' as const,
        categoryId: 'cm123456789abcdef03',
        description: 'Test',
        outgoings: 10.00,
        month: 'JANEIRO' as const,
        year: 2024,
        notes: '', // Empty string
        externalId: '' // Empty string
      };

      expect(() => CreateTransactionSchema.parse(dataWithEmptyStrings)).not.toThrow();
    });

    it('should handle very small amounts', () => {
      const smallAmountData = {
        date: new Date('2024-01-15'),
        originId: 'cm123456789abcdef01',
        bankId: 'cm123456789abcdef02',
        flow: 'SAIDA' as const,
        categoryId: 'cm123456789abcdef03',
        description: 'Small amount',
        outgoings: 0.01, // Very small but positive
        month: 'JANEIRO' as const,
        year: 2024
      };

      expect(() => CreateTransactionSchema.parse(smallAmountData)).not.toThrow();
    });

    it('should handle maximum string lengths', () => {
      const maxLengthData = {
        date: new Date('2024-01-15'),
        originId: 'cm123456789abcdef01',
        bankId: 'cm123456789abcdef02',
        flow: 'SAIDA' as const,
        categoryId: 'cm123456789abcdef03',
        description: 'A'.repeat(500), // Maximum allowed length
        outgoings: 10.00,
        notes: 'B'.repeat(1000), // Maximum allowed length
        month: 'JANEIRO' as const,
        year: 2024
      };

      expect(() => CreateTransactionSchema.parse(maxLengthData)).not.toThrow();
    });
  });
});