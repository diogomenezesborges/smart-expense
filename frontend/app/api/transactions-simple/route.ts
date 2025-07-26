import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching transactions...');
    
    const searchParams = request.nextUrl.searchParams;
    
    // Extract search parameters
    const searchTerm = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryIds = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const originIds = searchParams.get('origins')?.split(',').filter(Boolean) || [];
    const bankIds = searchParams.get('banks')?.split(',').filter(Boolean) || [];
    const flow = searchParams.get('flow');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const validationStatus = searchParams.get('validationStatus');
    const minConfidence = searchParams.get('minConfidence');
    const maxConfidence = searchParams.get('maxConfidence');
    const hasNotes = searchParams.get('hasNotes');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '1000'); // Default to high limit for client-side filtering
    
    // Build where clause
    const whereClause: any = {};
    
    // Search term - search across multiple fields
    if (searchTerm) {
      whereClause.OR = [
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { notes: { contains: searchTerm, mode: 'insensitive' } },
        { category: { category: { contains: searchTerm, mode: 'insensitive' } } },
        { category: { subCategory: { contains: searchTerm, mode: 'insensitive' } } },
        { origin: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { bank: { name: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }
    
    // Category filter
    if (categoryIds.length > 0) {
      whereClause.categoryId = { in: categoryIds };
    }
    
    // Origin filter
    if (originIds.length > 0) {
      whereClause.originId = { in: originIds };
    }
    
    // Bank filter
    if (bankIds.length > 0) {
      whereClause.bankId = { in: bankIds };
    }
    
    // Flow filter
    if (flow && flow !== 'all') {
      whereClause.flow = flow;
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      const amountConditions = [];
      if (minAmount) {
        amountConditions.push(
          { incomes: { gte: parseFloat(minAmount) } },
          { outgoings: { gte: parseFloat(minAmount) } }
        );
      }
      if (maxAmount) {
        amountConditions.push(
          { incomes: { lte: parseFloat(maxAmount) } },
          { outgoings: { lte: parseFloat(maxAmount) } }
        );
      }
      if (amountConditions.length > 0) {
        whereClause.OR = whereClause.OR 
          ? [...whereClause.OR, ...amountConditions]
          : amountConditions;
      }
    }
    
    // Validation status filter
    if (validationStatus && validationStatus !== 'all') {
      whereClause.isValidated = validationStatus === 'validated';
    }
    
    // AI confidence filter
    if (minConfidence || maxConfidence) {
      whereClause.aiConfidence = {};
      if (minConfidence) whereClause.aiConfidence.gte = parseFloat(minConfidence) / 100;
      if (maxConfidence) whereClause.aiConfidence.lte = parseFloat(maxConfidence) / 100;
    }
    
    // Notes filter
    if (hasNotes && hasNotes !== 'all') {
      if (hasNotes === 'with_notes') {
        whereClause.notes = { not: null };
      } else if (hasNotes === 'without_notes') {
        whereClause.OR = [
          { notes: null },
          { notes: '' }
        ];
      }
    }
    
    // Build order by clause
    let orderBy: any = { date: 'desc' }; // Default
    
    switch (sortBy) {
      case 'date':
        orderBy = { date: sortOrder };
        break;
      case 'description':
        orderBy = { description: sortOrder };
        break;
      case 'aiConfidence':
        orderBy = { aiConfidence: sortOrder };
        break;
      // Note: amount sorting will be handled client-side since it involves two fields
    }
    
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true,
        origin: true,
        bank: true,
      },
      orderBy,
      // Don't limit here for better client-side filtering performance
    });

    console.log(`✅ Found ${transactions.length} transactions`);

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
      filters: {
        searchTerm,
        startDate,
        endDate,
        categoryIds,
        originIds,
        bankIds,
        flow,
        minAmount,
        maxAmount,
        validationStatus,
        minConfidence,
        maxConfidence,
        hasNotes,
        sortBy,
        sortOrder,
      },
    });

  } catch (error) {
    console.error('❌ Transactions API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch transactions',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}