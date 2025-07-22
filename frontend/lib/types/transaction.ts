import { Prisma } from '@prisma/client';

// Re-export Prisma enums for convenience
export {
  TransactionFlow,
  MajorCategory,
  Month,
  UserRole,
} from '@prisma/client';

// Base transaction type from Prisma
export type Transaction = Prisma.TransactionGetPayload<{
  include: {
    origin: true;
    bank: true;
    category: true;
  };
}>;

// Transaction without relations (for forms/API)
export type TransactionData = Prisma.TransactionGetPayload<{}>;

// Transaction creation input
export type CreateTransactionInput = Prisma.TransactionCreateInput;

// Transaction update input
export type UpdateTransactionInput = Prisma.TransactionUpdateInput;

// Transaction filters for search/listing
export interface TransactionFilters {
  dateFrom?: Date;
  dateTo?: Date;
  originId?: string;
  bankId?: string;
  categoryId?: string;
  flow?: 'ENTRADA' | 'SAIDA';
  majorCategory?: string;
  minAmount?: number;
  maxAmount?: number;
  description?: string;
  month?: string;
  year?: number;
  isValidated?: boolean;
  isAiGenerated?: boolean;
}

// Transaction summary for analytics
export interface TransactionSummary {
  totalIncome: number;
  totalOutgoings: number;
  netAmount: number;
  transactionCount: number;
  period: {
    from: Date;
    to: Date;
  };
}

// Category breakdown for analytics
export interface CategoryBreakdown {
  categoryId: string;
  category: string;
  subCategory: string;
  majorCategory: string;
  flow: 'ENTRADA' | 'SAIDA';
  amount: number;
  percentage: number;
  transactionCount: number;
}

// Monthly summary
export interface MonthlySummary {
  month: string;
  year: number;
  totalIncome: number;
  totalOutgoings: number;
  netAmount: number;
  transactionCount: number;
  categories: CategoryBreakdown[];
}

// Transaction import result
export interface ImportResult {
  successful: number;
  failed: number;
  duplicates: number;
  errors: string[];
}

// AI categorization suggestion
export interface CategorizationSuggestion {
  categoryId: string;
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    categoryId: string;
    confidence: number;
  }>;
}

// Bank connection status
export interface BankConnection {
  bankId: string;
  bankName: string;
  isConnected: boolean;
  lastSync: Date | null;
  accountsCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  error?: string;
}

// GoCardless transaction data
export interface GoCardlessTransaction {
  id: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  reference?: string;
  merchantName?: string;
  category?: string;
  account: {
    id: string;
    name: string;
    bank: string;
  };
}

// Bulk operations
export interface BulkOperationResult {
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

// User preferences for categorization
export interface UserCategorization {
  merchantName: string;
  description: string;
  categoryId: string;
  confidence: number;
  frequency: number; // How many times this mapping was used
  lastUsed: Date;
}

// Transaction validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}