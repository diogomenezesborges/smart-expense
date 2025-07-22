import { Client, Environment } from 'gocardless-nodejs';
import { prisma } from '@/lib/database/client';

// GoCardless client configuration
const gocardlessClient = new Client({
  access_token: process.env.GOCARDLESS_ACCESS_TOKEN!,
  environment: process.env.GOCARDLESS_ENVIRONMENT === 'live' 
    ? Environment.Live 
    : Environment.Sandbox,
});

// Types for GoCardless API responses
export interface GoCardlessAccount {
  id: string;
  created_at: string;
  institution_id: string;
  iban: string;
  bban: string;
  currency: string;
  owner_name: string;
  name: string;
  product: string;
  status: string;
  usage: string;
}

export interface GoCardlessTransaction {
  transaction_id: string;
  booking_date: string;
  value_date: string;
  booking_date_time?: string;
  value_date_time?: string;
  amount: string;
  currency: string;
  exchange_rate?: string;
  creditor_name?: string;
  creditor_account?: {
    iban?: string;
    bban?: string;
  };
  debtor_name?: string;
  debtor_account?: {
    iban?: string;
    bban?: string;
  };
  remittance_information_unstructured?: string;
  remittance_information_structured?: string;
  purpose_code?: string;
  bank_transaction_code?: string;
  merchant_category_code?: string;
  proprietary_bank_transaction_code?: string;
  entry_reference?: string;
  end_to_end_id?: string;
  mandate_id?: string;
  check_id?: string;
  creditor_id?: string;
  additional_information?: string;
  internal_transaction_id?: string;
}

export interface GoCardlessBalance {
  balance_amount: {
    amount: string;
    currency: string;
  };
  balance_type: string;
  credit_limit_included?: boolean;
  last_change_date_time?: string;
  reference_date: string;
}

export class GoCardlessService {
  private client = gocardlessClient;

  // Get all connected accounts
  async getAccounts(): Promise<GoCardlessAccount[]> {
    try {
      const response = await this.client.accounts.list();
      return response.results || [];
    } catch (error) {
      console.error('Error fetching GoCardless accounts:', error);
      throw error;
    }
  }

  // Get account details by ID
  async getAccount(accountId: string): Promise<GoCardlessAccount> {
    try {
      return await this.client.accounts.get(accountId);
    } catch (error) {
      console.error(`Error fetching account ${accountId}:`, error);
      throw error;
    }
  }

  // Get transactions for a specific account
  async getTransactions(
    accountId: string, 
    dateFrom?: string, 
    dateTo?: string
  ): Promise<GoCardlessTransaction[]> {
    try {
      const params: any = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await this.client.accounts.transactions(accountId, params);
      return response.transactions.booked || [];
    } catch (error) {
      console.error(`Error fetching transactions for account ${accountId}:`, error);
      throw error;
    }
  }

  // Get account balances
  async getBalances(accountId: string): Promise<GoCardlessBalance[]> {
    try {
      const response = await this.client.accounts.balances(accountId);
      return response.balances || [];
    } catch (error) {
      console.error(`Error fetching balances for account ${accountId}:`, error);
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
      
      // Find or create bank in our database
      let bank = await prisma.bank.findFirst({
        where: {
          OR: [
            { name: { contains: account.institution_id, mode: 'insensitive' } },
            { name: { contains: account.name, mode: 'insensitive' } },
          ],
        },
      });

      if (!bank) {
        bank = await prisma.bank.create({
          data: {
            name: account.institution_id || account.name || 'Unknown Bank',
          },
        });
      }

      // Determine origin based on account owner or default to 'Comum'
      let origin = await prisma.origin.findFirst({
        where: {
          name: { contains: account.owner_name || 'Comum', mode: 'insensitive' },
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
                         gcTransaction.creditor_name ||
                         gcTransaction.debtor_name ||
                         gcTransaction.additional_information ||
                         'Transaction from bank';

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
        bankName: account.institution_id,
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
      const [account, balances, recentTransactions] = await Promise.all([
        this.getAccount(accountId),
        this.getBalances(accountId),
        this.getTransactions(accountId, undefined, undefined), // Get all recent transactions
      ]);

      return {
        account,
        balances,
        recentTransactions: recentTransactions.slice(0, 10), // Last 10 transactions
        transactionCount: recentTransactions.length,
      };
    } catch (error) {
      console.error(`Error getting account summary for ${accountId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const gocardlessService = new GoCardlessService();