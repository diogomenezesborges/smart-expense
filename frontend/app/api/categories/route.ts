import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

// Mock categories for when database is not available
const mockCategories = [
  {
    id: '1',
    majorCategory: 'CUSTOS_FIXOS',
    category: 'Housing',
    subCategory: 'Rent',
    flow: 'SAIDA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    majorCategory: 'CUSTOS_FIXOS',
    category: 'Bills & Utilities',
    subCategory: 'Electricity',
    flow: 'SAIDA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    majorCategory: 'CUSTOS_FIXOS',
    category: 'Bills & Utilities',
    subCategory: 'Water',
    flow: 'SAIDA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    majorCategory: 'CUSTOS_FIXOS',
    category: 'Bills & Utilities',
    subCategory: 'Internet',
    flow: 'SAIDA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    majorCategory: 'CUSTOS_VARIAVEIS',
    category: 'Food & Dining',
    subCategory: 'Groceries',
    flow: 'SAIDA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    majorCategory: 'CUSTOS_VARIAVEIS',
    category: 'Food & Dining',
    subCategory: 'Restaurants',
    flow: 'SAIDA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '7',
    majorCategory: 'CUSTOS_VARIAVEIS',
    category: 'Transportation',
    subCategory: 'Fuel',
    flow: 'SAIDA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '8',
    majorCategory: 'CUSTOS_VARIAVEIS',
    category: 'Transportation',
    subCategory: 'Public Transport',
    flow: 'SAIDA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '9',
    majorCategory: 'CUSTOS_VARIAVEIS',
    category: 'Healthcare',
    subCategory: 'Medical',
    flow: 'SAIDA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '10',
    majorCategory: 'CUSTOS_VARIAVEIS',
    category: 'Healthcare',
    subCategory: 'Pharmacy',
    flow: 'SAIDA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '11',
    majorCategory: 'GASTOS_SEM_CULPA',
    category: 'Entertainment',
    subCategory: 'Movies',
    flow: 'SAIDA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '12',
    majorCategory: 'GASTOS_SEM_CULPA',
    category: 'Entertainment',
    subCategory: 'Sports',
    flow: 'SAIDA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '13',
    majorCategory: 'RENDIMENTO',
    category: 'Salary',
    subCategory: 'Monthly Salary',
    flow: 'ENTRADA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '14',
    majorCategory: 'RENDIMENTO',
    category: 'Investments',
    subCategory: 'Dividends',
    flow: 'ENTRADA',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '15',
    majorCategory: 'RENDIMENTO_EXTRA',
    category: 'Freelance',
    subCategory: 'Consulting',
    flow: 'ENTRADA',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// GET /api/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flow = searchParams.get('flow');
    const majorCategory = searchParams.get('majorCategory');

    let categories;
    let isUsingMockData = false;

    try {
      // Try to use database first
      const where: any = {};
      if (flow) where.flow = flow;
      if (majorCategory) where.majorCategory = majorCategory;

      categories = await prisma.category.findMany({
        where,
        orderBy: [
          { flow: 'asc' },
          { majorCategory: 'asc' },
          { category: 'asc' },
          { subCategory: 'asc' },
        ],
      });
    } catch (dbError) {
      // Fallback to mock data if database fails
      console.warn('Database unavailable, using mock data:', dbError);
      isUsingMockData = true;
      
      categories = mockCategories.filter(cat => {
        if (flow && cat.flow !== flow) return false;
        if (majorCategory && cat.majorCategory !== majorCategory) return false;
        return true;
      });
    }

    // Group categories by flow and majorCategory for easier frontend consumption
    const grouped = categories.reduce((acc: any, cat: any) => {
      const flowKey = cat.flow;
      const majorKey = cat.majorCategory;
      
      if (!acc[flowKey]) acc[flowKey] = {};
      if (!acc[flowKey][majorKey]) acc[flowKey][majorKey] = {};
      if (!acc[flowKey][majorKey][cat.category]) acc[flowKey][majorKey][cat.category] = [];
      
      acc[flowKey][majorKey][cat.category].push({
        id: cat.id,
        subCategory: cat.subCategory,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      });
      
      return acc;
    }, {} as any);

    return NextResponse.json({
      success: true,
      data: categories, // Return flat array for transaction filters
      grouped,
      isUsingMockData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Final fallback - return mock data
    return NextResponse.json({
      success: true,
      data: mockCategories,
      isUsingMockData: true,
      error: 'Database unavailable, using mock data',
      timestamp: new Date().toISOString()
    });
  }
}