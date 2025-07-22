import { Prisma } from '@prisma/client';

// Type helpers for database operations
export type DbTransaction = Prisma.TransactionDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>;
export type DbCategory = Prisma.CategoryDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>;
export type DbOrigin = Prisma.OriginDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>;
export type DbBank = Prisma.BankDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>;
export type DbUser = Prisma.UserDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>;

// Full models with all relations
export type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: {
    origin: true;
    bank: true;
    category: true;
  };
}>;

export type CategoryWithTransactions = Prisma.CategoryGetPayload<{
  include: {
    transactions: true;
  };
}>;

export type OriginWithTransactions = Prisma.OriginGetPayload<{
  include: {
    transactions: true;
  };
}>;

export type BankWithTransactions = Prisma.BankGetPayload<{
  include: {
    transactions: true;
  };
}>;

// Database pagination
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Database query options
export interface QueryOptions extends PaginationOptions {
  include?: Prisma.TransactionInclude;
  where?: Prisma.TransactionWhereInput;
  orderBy?: Prisma.TransactionOrderByWithRelationInput;
}

// Aggregation results
export interface TransactionAggregation {
  _sum: {
    incomes: number | null;
    outgoings: number | null;
  };
  _count: {
    _all: number;
  };
  _avg: {
    incomes: number | null;
    outgoings: number | null;
  };
}

// Database connection settings
export interface DatabaseConfig {
  url: string;
  ssl?: boolean;
  poolSize?: number;
  timeout?: number;
  retries?: number;
}