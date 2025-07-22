import { NextRequest, NextResponse } from 'next/server';
import { aiCategorizationService } from '@/lib/services/ai-categorization';
import { CategorizationRequestSchema } from '@/lib/validations';

// POST /api/ai/categorize - AI-powered transaction categorization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, amount, merchantName, flow } = CategorizationRequestSchema.parse(body);

    const result = await aiCategorizationService.categorizeTransaction({
      description,
      amount,
      merchantName,
      flow: flow || (amount >= 0 ? 'ENTRADA' : 'SAIDA'),
      date: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Error categorizing transaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}

// GET /api/ai/categorize - Get AI categorization statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const stats = await aiCategorizationService.getCategorizationStats(days);

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Error fetching categorization stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}