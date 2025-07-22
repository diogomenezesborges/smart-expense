import { z } from 'zod';

// Enum schemas matching Prisma enums
export const TransactionFlowSchema = z.enum(['ENTRADA', 'SAIDA']);

export const MajorCategorySchema = z.enum([
  'RENDIMENTO',
  'RENDIMENTO_EXTRA',
  'ECONOMIA_INVESTIMENTOS',
  'CUSTOS_FIXOS',
  'CUSTOS_VARIAVEIS',
  'GASTOS_SEM_CULPA',
]);

export const MonthSchema = z.enum([
  'JANEIRO',
  'FEVEREIRO',
  'MARCO',
  'ABRIL',
  'MAIO',
  'JUNHO',
  'JULHO',
  'AGOSTO',
  'SETEMBRO',
  'OUTUBRO',
  'NOVEMBRO',
  'DEZEMBRO',
]);

export const UserRoleSchema = z.enum(['ADMIN', 'USER']);

// Base validation schemas
export const OriginSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, 'Origin name is required').max(50),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const BankSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, 'Bank name is required').max(100),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CategorySchema = z.object({
  id: z.string().cuid().optional(),
  flow: TransactionFlowSchema,
  majorCategory: MajorCategorySchema,
  category: z.string().min(1, 'Category is required').max(100),
  subCategory: z.string().min(1, 'SubCategory is required').max(100),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Transaction validation schema
export const TransactionSchema = z.object({
  id: z.string().cuid().optional(),
  date: z.coerce.date({
    errorMap: () => ({ message: 'Valid date is required' })
  }),
  originId: z.string().cuid('Invalid origin ID'),
  bankId: z.string().cuid('Invalid bank ID'),
  flow: TransactionFlowSchema,
  categoryId: z.string().cuid('Invalid category ID'),
  description: z.string().min(1, 'Description is required').max(500),
  incomes: z.coerce.number().positive().optional().nullable(),
  outgoings: z.coerce.number().positive().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  month: MonthSchema,
  year: z.number().int().min(2020).max(2030),
  externalId: z.string().optional().nullable(),
  rawData: z.record(z.unknown()).optional().nullable(),
  aiConfidence: z.number().min(0).max(1).optional().nullable(),
  isAiGenerated: z.boolean().default(false),
  isValidated: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).refine(
  (data) => {
    // Ensure that incomes is set for ENTRADA and outgoings for SAIDA
    if (data.flow === 'ENTRADA') {
      return data.incomes !== null && data.incomes !== undefined && data.incomes > 0;
    } else {
      return data.outgoings !== null && data.outgoings !== undefined && data.outgoings > 0;
    }
  },
  {
    message: 'Amount must be provided and positive for the transaction flow',
    path: ['amount'],
  }
);

// Create transaction schema (for API endpoints)
export const CreateTransactionSchema = TransactionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update transaction schema (all fields optional except ID)
export const UpdateTransactionSchema = TransactionSchema.partial().extend({
  id: z.string().cuid('Transaction ID is required'),
});

// Transaction filters schema
export const TransactionFiltersSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  originId: z.string().cuid().optional(),
  bankId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  flow: TransactionFlowSchema.optional(),
  majorCategory: MajorCategorySchema.optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
  description: z.string().optional(),
  month: MonthSchema.optional(),
  year: z.coerce.number().int().min(2020).max(2030).optional(),
  isValidated: z.boolean().optional(),
  isAiGenerated: z.boolean().optional(),
}).refine(
  (data) => {
    // Ensure dateFrom is before dateTo
    if (data.dateFrom && data.dateTo) {
      return data.dateFrom <= data.dateTo;
    }
    return true;
  },
  {
    message: 'dateFrom must be before dateTo',
    path: ['dateTo'],
  }
).refine(
  (data) => {
    // Ensure minAmount is less than maxAmount
    if (data.minAmount && data.maxAmount) {
      return data.minAmount <= data.maxAmount;
    }
    return true;
  },
  {
    message: 'minAmount must be less than or equal to maxAmount',
    path: ['maxAmount'],
  }
);

// Pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Combined query schema for API endpoints
export const TransactionQuerySchema = TransactionFiltersSchema.merge(PaginationSchema);

// User schema
export const UserSchema = z.object({
  id: z.string().cuid().optional(),
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: UserRoleSchema.default('USER'),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Login schema
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Register schema
export const RegisterSchema = UserSchema.pick({
  email: true,
  name: true,
  password: true,
}).extend({
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

// Bulk operations schema
export const BulkTransactionSchema = z.object({
  transactions: z.array(CreateTransactionSchema).min(1, 'At least one transaction is required'),
});

export const BulkUpdateSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, 'At least one ID is required'),
  updates: UpdateTransactionSchema.omit({ id: true }),
});

export const BulkDeleteSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, 'At least one ID is required'),
});

// Import validation schema
export const ImportTransactionSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  origin: z.string().min(1),
  bank: z.string().min(1),
  flow: z.string().refine((val) => ['ENTRADA', 'SAIDA'].includes(val), 'Invalid flow'),
  majorCategory: z.string().min(1),
  category: z.string().min(1),
  subCategory: z.string().min(1),
  description: z.string().min(1),
  incomes: z.string().optional(),
  outgoings: z.string().optional(),
  notes: z.string().optional(),
  month: z.string().min(1),
  year: z.string().refine((val) => !isNaN(parseInt(val)), 'Invalid year'),
});

// CSV import schema
export const CSVImportSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' }),
  mapping: z.record(z.string(), z.string()).optional(),
  skipFirstRow: z.boolean().default(true),
});

// AI categorization schema
export const CategorizationRequestSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  merchantName: z.string().optional(),
  flow: TransactionFlowSchema.optional(),
});

export const CategorizationResponseSchema = z.object({
  categoryId: z.string().cuid(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  alternatives: z.array(z.object({
    categoryId: z.string().cuid(),
    confidence: z.number().min(0).max(1),
  })),
});

// Export types derived from schemas
export type TransactionInput = z.infer<typeof TransactionSchema>;
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
export type TransactionFilters = z.infer<typeof TransactionFiltersSchema>;
export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;
export type UserInput = z.infer<typeof UserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ImportTransactionInput = z.infer<typeof ImportTransactionSchema>;
export type CategorizationRequest = z.infer<typeof CategorizationRequestSchema>;
export type CategorizationResponse = z.infer<typeof CategorizationResponseSchema>;