import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

// GET /api/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flow = searchParams.get('flow');
    const majorCategory = searchParams.get('majorCategory');

    const where: any = {};
    if (flow) where.flow = flow;
    if (majorCategory) where.majorCategory = majorCategory;

    const categories = await prisma.category.findMany({
      where,
      orderBy: [
        { flow: 'asc' },
        { majorCategory: 'asc' },
        { category: 'asc' },
        { subCategory: 'asc' },
      ],
    });

    // Group categories by flow and majorCategory for easier frontend consumption
    const grouped = categories.reduce((acc, cat) => {
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
      data: {
        categories,
        grouped,
      },
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}