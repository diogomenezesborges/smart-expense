import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { 
  TransactionQuerySchema, 
  CreateTransactionSchema,
  validateRequest 
} from '@/lib/validations';
import { Prisma } from '@prisma/client';

// GET /api/transactions - List transactions with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const { 
      page, 
      limit, 
      sortBy, 
      sortOrder, 
      dateFrom,
      dateTo,
      originId,
      bankId,
      categoryId,
      flow,
      majorCategory,
      minAmount,
      maxAmount,
      description,
      month,
      year,
      isValidated,
      isAiGenerated
    } = validateRequest(queryParams, TransactionQuerySchema);

    // Build where clause
    const where: Prisma.TransactionWhereInput = {};
    
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }
    
    if (originId) where.originId = originId;
    if (bankId) where.bankId = bankId;
    if (categoryId) where.categoryId = categoryId;
    if (flow) where.flow = flow;
    if (month) where.month = month;
    if (year) where.year = year;
    if (typeof isValidated === 'boolean') where.isValidated = isValidated;
    if (typeof isAiGenerated === 'boolean') where.isAiGenerated = isAiGenerated;
    
    if (majorCategory) {
      where.category = {
        majorCategory: majorCategory,
      };
    }
    
    if (minAmount || maxAmount) {
      where.OR = [];
      if (minAmount) {
        where.OR.push(
          { incomes: { gte: minAmount } },
          { outgoings: { gte: minAmount } }
        );
      }
      if (maxAmount) {
        where.OR.push(
          { incomes: { lte: maxAmount } },
          { outgoings: { lte: maxAmount } }
        );
      }
    }
    
    if (description) {
      where.description = {
        contains: description,
        mode: 'insensitive',
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build order by
    const orderBy: Prisma.TransactionOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute queries in parallel
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          origin: true,
          bank: true,
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    });

  } catch (error) {
    const { logError } = await import('@/lib/utils/logger');
    logError('Error fetching transactions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateRequest(body, CreateTransactionSchema);
    
    // Auto-set month and year from date if not provided
    const date = new Date(validatedData.date);
    const monthNames = [
      'JANEIRO', 'FEVEREIRO', 'MARCO', 'ABRIL', 'MAIO', 'JUNHO',
      'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];
    
    const transactionData = {
      ...validatedData,
      month: validatedData.month || monthNames[date.getMonth()] as 'JANEIRO' | 'FEVEREIRO' | 'MARCO' | 'ABRIL' | 'MAIO' | 'JUNHO' | 'JULHO' | 'AGOSTO' | 'SETEMBRO' | 'OUTUBRO' | 'NOVEMBRO' | 'DEZEMBRO',
      year: validatedData.year || date.getFullYear(),
    };

    const transaction = await prisma.transaction.create({
      data: transactionData,
      include: {
        origin: true,
        bank: true,
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Transaction created successfully',
    }, { status: 201 });

  } catch (error) {
    const { logError } = await import('@/lib/utils/logger');
    logError('Error creating transaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}