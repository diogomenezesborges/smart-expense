import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET() {
  try {
    console.log('🔍 Testing API endpoint...');
    
    // Test 1: Environment variables
    const hasDbUrl = !!process.env.DATABASE_URL;
    console.log('DATABASE_URL exists:', hasDbUrl);
    
    if (!hasDbUrl) {
      return NextResponse.json({
        error: 'DATABASE_URL not found',
        env: Object.keys(process.env).filter(key => key.includes('DATABASE')),
      }, { status: 500 });
    }

    // Test 2: Prisma connection
    console.log('🔄 Testing Prisma connection...');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Prisma connection successful');

    // Test 3: Check if tables exist
    console.log('🔄 Checking database tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📋 Found tables:', tables);

    // Test 4: Count transactions
    let transactionCount = 0;
    try {
      transactionCount = await prisma.transaction.count();
      console.log('📊 Transaction count:', transactionCount);
    } catch (error) {
      console.error('❌ Error counting transactions:', error);
      return NextResponse.json({
        error: 'Transaction table error',
        details: error instanceof Error ? error.message : 'Unknown error',
        tables,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'API is working!',
      data: {
        hasDatabase: hasDbUrl,
        tablesFound: Array.isArray(tables) ? tables.length : 0,
        transactionCount,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('❌ API Test Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'API test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}