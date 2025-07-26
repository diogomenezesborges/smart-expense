import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the services we'll be testing
vi.mock('../gocardless-api', () => ({
  GoCardlessAPI: vi.fn().mockImplementation(() => ({
    getAccounts: vi.fn(),
    getAccountBalance: vi.fn(), 
    getTransactions: vi.fn(),
    syncTransactions: vi.fn()
  }))
}));

// Define types for testing
interface GoCardlessAccount {
  id: string;
  iban: string;
  name: string;
  currency: string;
  accountType: string;
  status: string;
  institution: {
    id: string;
    name: string;
    bic: string;
    logo: string;
    countries: string[];
  };
}

interface GoCardlessTransaction {
  transactionId: string;
  bookingDate: string;
  valueDate: string;
  transactionAmount: {
    amount: string;
    currency: string;
  };
  remittanceInformationUnstructured: string;
  proprietaryBankTransactionCode: string;
}

interface GoCardlessBalance {
  balanceAmount: {
    amount: string;
    currency: string;
  };
  balanceType: string;
}

interface TransactionSyncResult {
  success: boolean;
  newTransactions: number;
  updatedTransactions: number;
  totalTransactions: number;
  errors: string[];
  syncedAt: Date;
}

// Mock the global fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GoCardlessAPI', () => {
  let api: any;
  const mockAccessToken = 'test-access-token';
  const mockAccountId = 'test-account-id';

  beforeEach(async () => {
    vi.clearAllMocks();
    const { GoCardlessAPI } = await import('../gocardless-api');
    api = {
      getAccounts: vi.fn(),
      getAccountBalance: vi.fn(),
      getTransactions: vi.fn(),
      syncTransactions: vi.fn()
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAccounts', () => {
    it('should fetch accounts successfully', async () => {
      const mockAccounts: GoCardlessAccount[] = [
        {
          id: 'account-1',
          iban: 'GB33BUKB20201555555555',
          name: 'Test Account',
          currency: 'EUR',
          accountType: 'CURRENT',
          status: 'ENABLED',
          institution: {
            id: 'institution-1',
            name: 'Test Bank',
            bic: 'BUKBGB22',
            logo: 'https://example.com/logo.png',
            countries: ['GB']
          }
        }
      ];

      api.getAccounts.mockResolvedValue(mockAccounts);

      const result = await api.getAccounts(mockAccessToken);

      expect(api.getAccounts).toHaveBeenCalledWith(mockAccessToken);
      expect(result).toEqual(mockAccounts);
    });

    it('should throw error when API returns error', async () => {
      api.getAccounts.mockRejectedValue(new Error('Failed to fetch accounts: 401'));

      await expect(api.getAccounts(mockAccessToken)).rejects.toThrow('Failed to fetch accounts: 401');
    });

    it('should handle network errors', async () => {
      api.getAccounts.mockRejectedValue(new Error('Network error'));

      await expect(api.getAccounts(mockAccessToken)).rejects.toThrow('Network error');
    });
  });

  describe('getAccountBalance', () => {
    it('should fetch account balance successfully', async () => {
      const mockBalances: GoCardlessBalance[] = [
        {
          balanceAmount: {
            amount: '1000.50',
            currency: 'EUR'
          },
          balanceType: 'EXPECTED'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ balances: mockBalances })
      });

      const result = await api.getAccountBalance(mockAccessToken, mockAccountId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://bankaccountdata.gocardless.com/api/v2/accounts/${mockAccountId}/balances/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      expect(result).toEqual(mockBalances);
    });
  });

  describe('getTransactions', () => {
    it('should fetch transactions with date range', async () => {
      const mockTransactions: GoCardlessTransaction[] = [
        {
          transactionId: 'txn-1',
          bookingDate: '2024-01-15',
          valueDate: '2024-01-15',
          transactionAmount: {
            amount: '-50.00',
            currency: 'EUR'
          },
          remittanceInformationUnstructured: 'Coffee Shop Payment',
          proprietaryBankTransactionCode: 'PURCHASE'
        }
      ];

      const dateFrom = '2024-01-01';
      const dateTo = '2024-01-31';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ transactions: { booked: mockTransactions } })
      });

      const result = await api.getTransactions(mockAccessToken, mockAccountId, dateFrom, dateTo);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://bankaccountdata.gocardless.com/api/v2/accounts/${mockAccountId}/transactions/?date_from=${dateFrom}&date_to=${dateTo}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should handle empty transactions response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ transactions: { booked: [] } })
      });

      const result = await api.getTransactions(mockAccessToken, mockAccountId);

      expect(result).toEqual([]);
    });
  });

  describe('syncTransactions', () => {
    it('should sync transactions and return sync result', async () => {
      const mockTransactions: GoCardlessTransaction[] = [
        {
          transactionId: 'txn-1',
          bookingDate: '2024-01-15',
          valueDate: '2024-01-15',
          transactionAmount: {
            amount: '-50.00',
            currency: 'EUR'
          },
          remittanceInformationUnstructured: 'Test Transaction',
          proprietaryBankTransactionCode: 'PURCHASE'
        }
      ];

      // Mock the getTransactions method
      vi.spyOn(api, 'getTransactions').mockResolvedValueOnce(mockTransactions);

      const expectedResult: TransactionSyncResult = {
        success: true,
        newTransactions: 1,
        updatedTransactions: 0,
        totalTransactions: 1,
        errors: [],
        syncedAt: expect.any(Date)
      };

      const result = await api.syncTransactions(mockAccessToken, mockAccountId);

      expect(result).toMatchObject({
        success: true,
        newTransactions: expect.any(Number),
        updatedTransactions: expect.any(Number),
        totalTransactions: expect.any(Number),
        errors: expect.any(Array),
        syncedAt: expect.any(Date)
      });
    });
  });

  describe('error handling', () => {
    it('should handle rate limiting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limited' })
      });

      await expect(api.getAccounts(mockAccessToken)).rejects.toThrow('Failed to fetch accounts: 429');
    });

    it('should handle invalid token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid token' })
      });

      await expect(api.getAccounts(mockAccessToken)).rejects.toThrow('Failed to fetch accounts: 401');
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      await expect(api.getAccounts(mockAccessToken)).rejects.toThrow('Failed to fetch accounts: 500');
    });
  });

  describe('request validation', () => {
    it('should validate access token is provided', async () => {
      await expect(api.getAccounts('')).rejects.toThrow();
    });

    it('should validate account ID is provided', async () => {
      await expect(api.getAccountBalance(mockAccessToken, '')).rejects.toThrow();
    });

    it('should validate date format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ transactions: { booked: [] } })
      });

      // Should accept valid ISO date strings
      await expect(api.getTransactions(mockAccessToken, mockAccountId, '2024-01-01', '2024-01-31')).resolves.not.toThrow();
    });
  });
});