import { NextRequest, NextResponse } from 'next/server';
import { gocardlessApiService } from '@/lib/services/gocardless-api';

// GET /api/test/gocardless - Test GoCardless integration
export async function GET() {
  try {
    // Test connection by fetching accounts
    const accounts = await gocardlessApiService.getAccounts();
    
    const testResults = {
      connectionTest: 'PASSED',
      accountsFound: accounts.length,
      accounts: accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        iban: acc.iban?.substring(0, 8) + '****', // Mask IBAN for security
        currency: acc.currency,
        status: acc.status,
        institution: acc.institution_id,
      })),
    };

    // Test fetching transactions for first account (if available)
    if (accounts.length > 0) {
      try {
        const transactions = await gocardlessApiService.getTransactions(
          accounts[0].id,
          undefined,
          undefined
        );
        
        testResults.transactionTest = 'PASSED';
        testResults.sampleTransactions = transactions.slice(0, 3).map(t => ({
          id: t.transaction_id,
          date: t.booking_date,
          amount: t.amount,
          description: t.remittance_information_unstructured?.substring(0, 50) + '...',
        }));
      } catch (error) {
        testResults.transactionTest = 'FAILED';
        testResults.transactionError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    return NextResponse.json({
      success: true,
      data: testResults,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('GoCardless test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}