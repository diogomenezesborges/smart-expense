import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIService } from '@/lib/services/gemini-ai-service';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json({
        error: 'GEMINI_API_KEY not found in environment variables',
        hasKey: false,
        keyPreview: 'Not set'
      });
    }

    // Show key preview (first/last 4 characters)
    const keyPreview = geminiApiKey.length > 8 
      ? `${geminiApiKey.substring(0, 4)}...${geminiApiKey.substring(geminiApiKey.length - 4)}`
      : 'Key too short';

    // Test Gemini AI service
    const geminiService = new GeminiAIService({
      apiKey: geminiApiKey,
      model: 'gemini-1.5-flash'
    });

    // Simple test query
    const testContext = {
      userId: 'test-user',
      totalIncome: 3000,
      totalExpenses: 2200,
      categories: {
        'Food & Dining': 450,
        'Transportation': 200,
        'Shopping': 300,
        'Bills & Utilities': 800,
        'Entertainment': 150
      },
      goals: [],
      timeframe: '1month' as const
    };

    const testQuery = "What's my spending summary?";
    
    console.log('Testing Gemini with query:', testQuery);
    const response = await geminiService.processFinancialQuery(testQuery, testContext);
    
    return NextResponse.json({
      success: true,
      hasKey: true,
      keyPreview,
      testQuery,
      geminiResponse: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gemini test error:', error);
    
    return NextResponse.json({
      error: error.message || 'Unknown error',
      hasKey: !!process.env.GEMINI_API_KEY,
      keyPreview: process.env.GEMINI_API_KEY ? 
        `${process.env.GEMINI_API_KEY.substring(0, 4)}...${process.env.GEMINI_API_KEY.substring(process.env.GEMINI_API_KEY.length - 4)}` : 
        'Not set',
      stack: error.stack
    }, { status: 500 });
  }
}