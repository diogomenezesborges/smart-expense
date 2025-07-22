import { gocardlessAuth } from './gocardless-auth';
import { prisma } from '@/lib/database/client';

// GoCardless Bank Account Data API types
export interface GoCardlessAccount {
  id: string;
  created: string;
  last_accessed?: string;
  iban: string;
  institution_id: string;
  status: string;
  owner_name?: string;
  name?: string;
  details?: {
    iban: string;
    name: string;
    product?: string;
    cash_account_type?: string;
    currency: string;
  };
}

export interface GoCardlessTransaction {
  transaction_id: string;
  entry_reference?: string;
  end_to_end_id?: string;
  booking_date: string;
  value_date?: string;
  amount: string;
  currency: string;
  exchange_rate?: number;
  creditor_name?: string;
  creditor_account?: {
    iban?: string;
  };
  debtor_name?: string;
  debtor_account?: {
    iban?: string;
  };
  remittance_information_unstructured?: string;
  remittance_information_structured?: string;
  additional_information?: string;
  purpose_code?: string;
  bank_transaction_code?: string;
  proprietary_bank_transaction_code?: string;
  balance_after_transaction?: {
    balance_amount: {
      amount: string;
      currency: string;
    };
  };
}

export interface GoCardlessBalance {
  balance_amount: {
    amount: string;
    currency: string;
  };
  balance_type: string;
  last_change_date_time?: string;
  reference_date?: string;
}

export interface GoCardlessInstitution {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: string;
  countries: string[];
  logo: string;
}

export class GoCardlessApiService {
  private readonly baseUrl = 'https://bankaccountdata.gocardless.com/api/v2';

  // Get all requisitions (account access agreements)
  async getRequisitions(): Promise<any[]> {
    try {
      const response = await gocardlessAuth.makeAuthenticatedRequest('/requisitions/');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch requisitions: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching requisitions:', error);
      throw error;
    }
  }

  // Get accounts from all requisitions
  async getAccounts(): Promise<GoCardlessAccount[]> {
    try {
      const requisitions = await this.getRequisitions();
      const allAccounts: GoCardlessAccount[] = [];

      for (const req of requisitions) {
        if (req.status === 'LN' && req.accounts) { // LN = Linked
          for (const accountId of req.accounts) {
            try {
              const account = await this.getAccount(accountId);
              allAccounts.push(account);
            } catch (error) {
              console.error(`Error fetching account ${accountId}:`, error);
            }
          }
        }
      }

      return allAccounts;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  // Get specific account details
  async getAccount(accountId: string): Promise<GoCardlessAccount> {
    try {
      const response = await gocardlessAuth.makeAuthenticatedRequest(`/accounts/${accountId}/`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch account ${accountId}: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching account ${accountId}:`, error);
      throw error;
    }
  }

  // Get account transactions
  async getTransactions(
    accountId: string, 
    dateFrom?: string, 
    dateTo?: string
  ): Promise<GoCardlessTransaction[]> {
    try {
      let url = `/accounts/${accountId}/transactions/`;
      const params = new URLSearchParams();
      
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await gocardlessAuth.makeAuthenticatedRequest(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions for ${accountId}: ${response.status}`);
      }

      const data = await response.json();
      return data.transactions?.booked || [];
    } catch (error) {
      console.error(`Error fetching transactions for account ${accountId}:`, error);
      throw error;
    }
  }

  // Get account balances
  async getBalances(accountId: string): Promise<GoCardlessBalance[]> {
    try {
      const response = await gocardlessAuth.makeAuthenticatedRequest(`/accounts/${accountId}/balances/`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch balances for ${accountId}: ${response.status}`);
      }

      const data = await response.json();
      return data.balances || [];
    } catch (error) {
      console.error(`Error fetching balances for account ${accountId}:`, error);
      throw error;
    }
  }

  // Get account details (metadata)
  async getAccountDetails(accountId: string): Promise<any> {
    try {
      const response = await gocardlessAuth.makeAuthenticatedRequest(`/accounts/${accountId}/details/`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch account details for ${accountId}: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching account details for ${accountId}:`, error);
      throw error;
    }
  }

  // Get supported institutions
  async getInstitutions(country?: string): Promise<GoCardlessInstitution[]> {
    try {
      let url = '/institutions/';
      if (country) {
        url += `?country=${country}`;
      }

      const response = await gocardlessAuth.makeAuthenticatedRequest(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch institutions: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching institutions:', error);
      throw error;
    }
  }

  // Map GoCardless transaction to our database format
  async mapTransactionToDatabase(
    gcTransaction: GoCardlessTransaction,
    accountId: string
  ): Promise<any> {
    try {
      // Get account details to determine bank and origin
      const account = await this.getAccount(accountId);
      const accountDetails = await this.getAccountDetails(accountId);
      
      // Find or create bank in our database
      let bank = await prisma.bank.findFirst({
        where: {
          OR: [
            { name: { contains: account.institution_id, mode: 'insensitive' } },
            { name: { contains: accountDetails.name || '', mode: 'insensitive' } },
          ],
        },
      });

      if (!bank) {
        // Get institution name for better bank identification
        try {
          const institutions = await this.getInstitutions();
          const institution = institutions.find(inst => inst.id === account.institution_id);
          const bankName = institution?.name || account.institution_id || 'Unknown Bank';
          
          bank = await prisma.bank.create({
            data: { name: bankName },
          });
        } catch {
          bank = await prisma.bank.create({
            data: { name: account.institution_id || 'Unknown Bank' },
          });
        }
      }

      // Determine origin based on account owner or default to 'Comum'
      let origin = await prisma.origin.findFirst({
        where: {
          name: { contains: account.owner_name || accountDetails.name || 'Comum', mode: 'insensitive' },
        },
      });

      if (!origin) {
        origin = await prisma.origin.findFirst({
          where: { name: 'Comum' },
        });
      }

      if (!origin) {
        throw new Error('No origin found and Comum origin not available');
      }

      // Determine transaction flow (ENTRADA/SAIDA) based on amount
      const amount = parseFloat(gcTransaction.amount);
      const flow = amount >= 0 ? 'ENTRADA' : 'SAIDA';
      const absoluteAmount = Math.abs(amount);

      // Create description from available information
      const description = gcTransaction.remittance_information_unstructured ||
                         gcTransaction.remittance_information_structured ||
                         gcTransaction.creditor_name ||
                         gcTransaction.debtor_name ||
                         gcTransaction.additional_information ||
                         'Bank transaction';

      // Extract month and year from booking date
      const bookingDate = new Date(gcTransaction.booking_date);
      const monthNames = [
        'JANEIRO', 'FEVEREIRO', 'MARCO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
      ];
      const month = monthNames[bookingDate.getMonth()];
      const year = bookingDate.getFullYear();

      // Use AI categorization to determine the best category
      const { aiCategorizationService } = await import('./ai-categorization');
      
      const aiResult = await aiCategorizationService.categorizeTransaction({
        description,
        amount: absoluteAmount,
        merchantName: gcTransaction.creditor_name || gcTransaction.debtor_name,
        flow: flow as any,
        date: bookingDate,
        bankName: bank.name,
      });

      let categoryId = aiResult.categoryId;
      let aiConfidence = aiResult.confidence;
      let isAiGenerated = true;

      // Fallback to unknown category if AI categorization failed
      if (!categoryId || aiResult.confidence < 0.1) {
        const unknownCategory = await prisma.category.findFirst({
          where: {
            flow: flow as any,
            category: 'Desconhecido',
            subCategory: 'Desconhecido',
          },
        });

        if (!unknownCategory) {
          throw new Error('Unknown category not found in database');
        }
        
        categoryId = unknownCategory.id;
        aiConfidence = 0.1;
        isAiGenerated = false;
      }

      return {
        date: bookingDate,
        originId: origin.id,
        bankId: bank.id,
        flow: flow as any,
        categoryId,
        description,
        incomes: flow === 'ENTRADA' ? absoluteAmount : null,
        outgoings: flow === 'SAIDA' ? absoluteAmount : null,
        notes: gcTransaction.additional_information || null,
        month: month as any,
        year,
        externalId: gcTransaction.transaction_id,
        rawData: gcTransaction,
        aiConfidence,
        isAiGenerated,
        isValidated: false,
      };

    } catch (error) {
      console.error('Error mapping GoCardless transaction:', error);
      throw error;
    }
  }

  // Sync transactions for a specific account
  async syncAccountTransactions(
    accountId: string, 
    dateFrom?: string, 
    dateTo?: string
  ): Promise<{
    processed: number;
    created: number;
    updated: number;
    errors: string[];
  }> {
    const result = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    try {
      const gcTransactions = await this.getTransactions(accountId, dateFrom, dateTo);
      
      for (const gcTransaction of gcTransactions) {
        try {
          result.processed++;

          // Check if transaction already exists
          const existingTransaction = await prisma.transaction.findUnique({
            where: { externalId: gcTransaction.transaction_id },
          });

          const mappedTransaction = await this.mapTransactionToDatabase(
            gcTransaction, 
            accountId
          );

          if (existingTransaction) {
            // Update existing transaction
            await prisma.transaction.update({
              where: { id: existingTransaction.id },
              data: {
                ...mappedTransaction,
                rawData: gcTransaction,
              },
            });
            result.updated++;
          } else {
            // Create new transaction
            await prisma.transaction.create({
              data: mappedTransaction,
            });
            result.created++;
          }

        } catch (error) {
          const errorMessage = `Transaction ${gcTransaction.transaction_id}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`;
          result.errors.push(errorMessage);
          console.error(errorMessage);
        }
      }

    } catch (error) {
      const errorMessage = `Account ${accountId}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      result.errors.push(errorMessage);
      console.error(errorMessage);
    }

    return result;
  }

  // Sync all connected accounts
  async syncAllAccounts(
    dateFrom?: string, 
    dateTo?: string
  ): Promise<{
    accountsProcessed: number;
    totalTransactions: number;
    created: number;
    updated: number;
    errors: string[];
  }> {
    const overallResult = {
      accountsProcessed: 0,
      totalTransactions: 0,
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    try {
      const accounts = await this.getAccounts();
      
      for (const account of accounts) {
        try {
          overallResult.accountsProcessed++;
          
          const accountResult = await this.syncAccountTransactions(
            account.id, 
            dateFrom, 
            dateTo
          );
          
          overallResult.totalTransactions += accountResult.processed;
          overallResult.created += accountResult.created;
          overallResult.updated += accountResult.updated;
          overallResult.errors.push(...accountResult.errors);

        } catch (error) {
          const errorMessage = `Failed to sync account ${account.id}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`;
          overallResult.errors.push(errorMessage);
        }
      }

    } catch (error) {
      const errorMessage = `Failed to fetch accounts: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      overallResult.errors.push(errorMessage);
    }

    return overallResult;
  }

  // Get account summary with balance and recent transactions
  async getAccountSummary(accountId: string) {
    try {
      const [account, accountDetails, balances, recentTransactions] = await Promise.all([
        this.getAccount(accountId),
        this.getAccountDetails(accountId),
        this.getBalances(accountId),
        this.getTransactions(accountId, undefined, undefined),
      ]);

      return {
        account: { ...account, details: accountDetails },
        balances,
        recentTransactions: recentTransactions.slice(0, 10),
        transactionCount: recentTransactions.length,
      };
    } catch (error) {
      console.error(`Error getting account summary for ${accountId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const gocardlessApiService = new GoCardlessApiService();