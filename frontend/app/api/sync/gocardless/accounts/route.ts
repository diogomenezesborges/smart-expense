import { NextRequest, NextResponse } from 'next/server';
import { gocardlessService } from '@/lib/services/gocardless';

// GET /api/sync/gocardless/accounts - List all connected GoCardless accounts
export async function GET() {
  try {
    const accounts = await gocardlessService.getAccounts();
    
    const enrichedAccounts = await Promise.all(
      accounts.map(async (account) => {
        try {
          const [balances, recentTransactions] = await Promise.all([
            gocardlessService.getBalances(account.id),
            gocardlessService.getTransactions(account.id, undefined, undefined)
          ]);

          return {
            ...account,
            currentBalance: balances[0]?.balance_amount || null,
            availableBalance: balances.find(b => b.balance_type === 'available')?.balance_amount || null,
            transactionCount: recentTransactions.length,
            lastTransactionDate: recentTransactions[0]?.booking_date || null,
            isActive: account.status === 'READY',
          };
        } catch (error) {
          console.error(`Error enriching account ${account.id}:`, error);
          return {
            ...account,
            error: 'Failed to load account details',
            isActive: false,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedAccounts,
    });

  } catch (error) {
    console.error('Error fetching GoCardless accounts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}