import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getTransactions, POST as createTransaction } from '../../transactions/route';
import { GET as getBanks } from '../../banks/route';
import { GET as getCategories } from '../../categories/route';
import { GET as getOrigins } from '../../origins/route';

// Mock database for integration tests
const mockDatabase = {
  transactions: [],
  banks: [
    { id: 'bank-1', name: 'Test Bank', createdAt: new Date(), updatedAt: new Date() }
  ],
  categories: [
    { 
      id: 'cat-1', 
      flow: 'SAIDA', 
      majorCategory: 'CUSTOS_VARIAVEIS',
      category: 'Food & Beverages',
      subCategory: 'Restaurants',
      createdAt: new Date(), 
      updatedAt: new Date() 
    }
  ],
  origins: [
    { id: 'origin-1', name: 'Bank Transfer', createdAt: new Date(), updatedAt: new Date() }
  ]
};

// Mock prisma for integration tests
vi.mock('@/lib/database/client', () => ({
  prisma: {
    transaction: {
      findMany: vi.fn().mockImplementation(() => Promise.resolve(mockDatabase.transactions)),
      count: vi.fn().mockImplementation(() => Promise.resolve(mockDatabase.transactions.length)),
      create: vi.fn().mockImplementation((data) => {
        const newTransaction = {
          id: `txn-${Date.now()}`,
          ...data.data,
          createdAt: new Date(),
          updatedAt: new Date(),
          origin: mockDatabase.origins.find(o => o.id === data.data.originId),
          bank: mockDatabase.banks.find(b => b.id === data.data.bankId),
          category: mockDatabase.categories.find(c => c.id === data.data.categoryId)
        };
        mockDatabase.transactions.push(newTransaction);
        return Promise.resolve(newTransaction);
      })
    },
    bank: {
      findMany: vi.fn().mockImplementation(() => Promise.resolve(mockDatabase.banks))
    },
    category: {
      findMany: vi.fn().mockImplementation(() => Promise.resolve(mockDatabase.categories))
    },
    origin: {
      findMany: vi.fn().mockImplementation(() => Promise.resolve(mockDatabase.origins))
    }
  }
}));

// Mock validation functions
vi.mock('@/lib/validations', () => ({
  validateRequest: vi.fn().mockImplementation((data, schema) => {
    // Simple mock validation - in real tests you'd want proper validation
    if (schema.name === 'TransactionQuerySchema') {
      return {
        page: parseInt(data.page) || 1,
        limit: parseInt(data.limit) || 20,
        sortBy: data.sortBy || 'date',
        sortOrder: data.sortOrder || 'desc',
        ...data
      };
    }
    if (schema.name === 'CreateTransactionSchema') {
      return {
        ...data,
        date: new Date(data.date)
      };
    }
    return data;
  }),
  TransactionQuerySchema: { name: 'TransactionQuerySchema' },
  CreateTransactionSchema: { name: 'CreateTransactionSchema' }
}));

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test environment
    process.env.NODE_ENV = 'test';
  });

  afterAll(async () => {
    // Cleanup test environment
  });

  beforeEach(() => {
    // Reset mock database state
    mockDatabase.transactions = [];
    vi.clearAllMocks();
  });

  describe('Transaction API Integration', () => {
    it('should create and retrieve transactions end-to-end', async () => {
      // Step 1: Create a new transaction
      const transactionData = {
        date: '2024-01-15',
        originId: 'origin-1',
        bankId: 'bank-1',
        flow: 'SAIDA',
        categoryId: 'cat-1',
        description: 'Integration test transaction',
        outgoings: 25.50,
        month: 'JANEIRO',
        year: 2024,
        isAiGenerated: false,
        isValidated: true
      };

      const createRequest = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData)
      });

      const createResponse = await createTransaction(createRequest);
      const createData = await createResponse.json();

      // Verify transaction creation
      expect(createResponse.status).toBe(201);
      expect(createData.success).toBe(true);
      expect(createData.data).toMatchObject({
        description: 'Integration test transaction',
        outgoings: 25.50,
        flow: 'SAIDA'
      });
      expect(createData.data.id).toBeDefined();

      // Step 2: Retrieve transactions
      const getRequest = new NextRequest('http://localhost:3000/api/transactions?page=1&limit=10');
      const getResponse = await getTransactions(getRequest);
      const getData = await getResponse.json();

      // Verify transaction retrieval
      expect(getResponse.status).toBe(200);
      expect(getData.success).toBe(true);
      expect(getData.transactions).toHaveLength(1);
      expect(getData.transactions[0]).toMatchObject({
        description: 'Integration test transaction',
        outgoings: 25.50
      });

      // Verify pagination
      expect(getData.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    });

    it('should handle transaction filtering', async () => {
      // Create multiple transactions
      const transactions = [
        {
          date: '2024-01-15',
          originId: 'origin-1',
          bankId: 'bank-1',
          flow: 'SAIDA',
          categoryId: 'cat-1',
          description: 'Coffee shop',
          outgoings: 4.50,
          month: 'JANEIRO',
          year: 2024
        },
        {
          date: '2024-01-16',
          originId: 'origin-1',
          bankId: 'bank-1',
          flow: 'ENTRADA',
          categoryId: 'cat-1',
          description: 'Salary',
          incomes: 3000.00,
          month: 'JANEIRO',
          year: 2024
        }
      ];

      // Create transactions
      for (const txn of transactions) {
        const request = new NextRequest('http://localhost:3000/api/transactions', {
          method: 'POST',
          body: JSON.stringify(txn)
        });
        await createTransaction(request);
      }

      // Test filtering by flow
      const filterRequest = new NextRequest('http://localhost:3000/api/transactions?flow=SAIDA');
      const filterResponse = await getTransactions(filterRequest);
      const filterData = await filterResponse.json();

      expect(filterResponse.status).toBe(200);
      expect(filterData.transactions).toHaveLength(1);
      expect(filterData.transactions[0].flow).toBe('SAIDA');
      expect(filterData.transactions[0].description).toBe('Coffee shop');
    });

    it('should handle transaction search', async () => {
      // Create transaction with specific description
      const transactionData = {
        date: '2024-01-15',
        originId: 'origin-1',
        bankId: 'bank-1',
        flow: 'SAIDA',
        categoryId: 'cat-1',
        description: 'Starbucks Coffee Purchase',
        outgoings: 5.75,
        month: 'JANEIRO',
        year: 2024
      };

      const createRequest = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData)
      });
      await createTransaction(createRequest);

      // Search for transactions
      const searchRequest = new NextRequest('http://localhost:3000/api/transactions?description=Starbucks');
      const searchResponse = await getTransactions(searchRequest);
      const searchData = await searchResponse.json();

      expect(searchResponse.status).toBe(200);
      expect(searchData.transactions).toHaveLength(1);
      expect(searchData.transactions[0].description).toContain('Starbucks');
    });

    it('should handle invalid transaction data', async () => {
      const invalidData = {
        // Missing required fields
        description: 'Invalid transaction'
      };

      const request = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });

      const response = await createTransaction(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('Master Data APIs Integration', () => {
    it('should retrieve banks', async () => {
      const request = new NextRequest('http://localhost:3000/api/banks');
      const response = await getBanks(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.banks).toHaveLength(1);
      expect(data.banks[0]).toMatchObject({
        id: 'bank-1',
        name: 'Test Bank'
      });
    });

    it('should retrieve categories', async () => {
      const request = new NextRequest('http://localhost:3000/api/categories');
      const response = await getCategories(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.categories).toHaveLength(1);
      expect(data.categories[0]).toMatchObject({
        id: 'cat-1',
        flow: 'SAIDA',
        majorCategory: 'CUSTOS_VARIAVEIS',
        category: 'Food & Beverages'
      });
    });

    it('should retrieve origins', async () => {
      const request = new NextRequest('http://localhost:3000/api/origins');
      const response = await getOrigins(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.origins).toHaveLength(1);
      expect(data.origins[0]).toMatchObject({
        id: 'origin-1',
        name: 'Bank Transfer'
      });
    });
  });

  describe('API Error Handling Integration', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock database error
      const { prisma } = await import('@/lib/database/client');
      prisma.transaction.findMany.mockRejectedValueOnce(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/transactions');
      const response = await getTransactions(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database connection failed');
    });

    it('should handle malformed JSON requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: 'invalid json content'
      });

      const response = await createTransaction(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('API Performance Integration', () => {
    it('should handle large dataset queries efficiently', async () => {
      // Create multiple transactions for performance testing
      const transactions = Array.from({ length: 50 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        originId: 'origin-1',
        bankId: 'bank-1',
        flow: i % 2 === 0 ? 'SAIDA' : 'ENTRADA',
        categoryId: 'cat-1',
        description: `Test transaction ${i + 1}`,
        ...(i % 2 === 0 ? { outgoings: 10.00 + i } : { incomes: 100.00 + i }),
        month: 'JANEIRO',
        year: 2024
      }));

      // Create all transactions
      for (const txn of transactions) {
        const request = new NextRequest('http://localhost:3000/api/transactions', {
          method: 'POST',
          body: JSON.stringify(txn)
        });
        await createTransaction(request);
      }

      // Test pagination performance
      const startTime = Date.now();
      const request = new NextRequest('http://localhost:3000/api/transactions?page=1&limit=20');
      const response = await getTransactions(request);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.transactions).toHaveLength(20);
      expect(data.pagination.total).toBe(50);
      
      // Response should be under 100ms for this dataset
      expect(responseTime).toBeLessThan(100);
    });

    it('should handle concurrent requests', async () => {
      const transactionData = {
        date: '2024-01-15',
        originId: 'origin-1',
        bankId: 'bank-1',
        flow: 'SAIDA',
        categoryId: 'cat-1',
        description: 'Concurrent test transaction',
        outgoings: 15.00,
        month: 'JANEIRO',
        year: 2024
      };

      // Create multiple concurrent requests
      const requests = Array.from({ length: 10 }, (_, i) => {
        const data = { ...transactionData, description: `Concurrent transaction ${i + 1}` };
        return createTransaction(new NextRequest('http://localhost:3000/api/transactions', {
          method: 'POST',
          body: JSON.stringify(data)
        }));
      });

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(async (response, i) => {
        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.description).toBe(`Concurrent transaction ${i + 1}`);
      });
    });
  });
});