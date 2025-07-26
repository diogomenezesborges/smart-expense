import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request: NextRequest) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json({
        error: 'GEMINI_API_KEY not found',
        success: false
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Simple test prompt
    const prompt = "Hello! This is a test. Please respond with a brief confirmation that you are working as a financial AI assistant.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      geminiResponse: text,
      prompt,
      model: 'gemini-1.5-flash',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Simple Gemini test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      details: error.toString()
    }, { status: 500 });
  }
}