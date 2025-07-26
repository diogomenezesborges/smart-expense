import { NextRequest, NextResponse } from 'next/server';
import { FinancialContext, AIResponse } from '@/lib/services/ai-service';
import { GeminiAIService } from '@/lib/services/gemini-ai-service';

export async function POST(request: NextRequest) {
  try {
    const { query, context, timestamp } = await request.json();

    if (!query || !context) {
      return NextResponse.json(
        { error: 'Query and context are required' },
        { status: 400 }
      );
    }

    // Check for Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { 
          error: 'Gemini AI is not configured. Please add GEMINI_API_KEY to environment variables.',
          code: 'MISSING_API_KEY'
        },
        { status: 503 }
      );
    }

    // Initialize Gemini AI service
    const geminiService = new GeminiAIService({
      apiKey: geminiApiKey,
      model: 'gemini-1.5-flash' // Fast and efficient model
    });

    // Process query with Gemini AI
    const response = await geminiService.processFinancialQuery(query, context);

    return NextResponse.json({
      success: true,
      ...response,
      provider: 'gemini',
      processedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini AI error:', error);
    
    return NextResponse.json({
      error: error.message || 'Failed to process AI query with Gemini',
      code: 'GEMINI_ERROR',
      details: error.toString()
    }, { status: 500 });
  }
}

