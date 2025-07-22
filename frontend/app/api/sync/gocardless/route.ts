import { NextRequest, NextResponse } from 'next/server';
import { gocardlessApiService } from '@/lib/services/gocardless-api';
import { z } from 'zod';

// Validation schema for sync request
const SyncRequestSchema = z.object({
  accountId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  forceSync: z.boolean().default(false),
});

// POST /api/sync/gocardless - Sync transactions from GoCardless
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, dateFrom, dateTo, forceSync } = SyncRequestSchema.parse(body);

    // If no date range provided, sync last 30 days
    const defaultDateFrom = new Date();
    defaultDateFrom.setDate(defaultDateFrom.getDate() - 30);
    
    const actualDateFrom = dateFrom || defaultDateFrom.toISOString().split('T')[0];
    const actualDateTo = dateTo || new Date().toISOString().split('T')[0];

    let result;

    if (accountId) {
      // Sync specific account
      result = await gocardlessApiService.syncAccountTransactions(
        accountId,
        actualDateFrom,
        actualDateTo
      );
      
      return NextResponse.json({
        success: true,
        data: {
          accountId,
          ...result,
          dateRange: {
            from: actualDateFrom,
            to: actualDateTo,
          },
        },
        message: `Synced ${result.created} new and ${result.updated} updated transactions`,
      });
    } else {
      // Sync all accounts
      result = await gocardlessApiService.syncAllAccounts(
        actualDateFrom,
        actualDateTo
      );
      
      return NextResponse.json({
        success: true,
        data: {
          ...result,
          dateRange: {
            from: actualDateFrom,
            to: actualDateTo,
          },
        },
        message: `Synced ${result.created} new and ${result.updated} updated transactions across ${result.accountsProcessed} accounts`,
      });
    }

  } catch (error) {
    console.error('Error syncing GoCardless transactions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}

// GET /api/sync/gocardless - Get sync status and connected accounts
export async function GET() {
  try {
    const accounts = await gocardlessApiService.getAccounts();
    
    // Get summaries for all accounts
    const accountSummaries = await Promise.all(
      accounts.map(async (account) => {
        try {
          const summary = await gocardlessApiService.getAccountSummary(account.id);
          return {
            id: account.id,
            name: account.name,
            iban: account.iban,
            currency: account.currency,
            status: account.status,
            institution: account.institution_id,
            balance: summary.balances[0]?.balance_amount || null,
            recentTransactionCount: summary.transactionCount,
            lastTransaction: summary.recentTransactions[0] || null,
          };
        } catch (error) {
          console.error(`Error getting summary for account ${account.id}:`, error);
          return {
            id: account.id,
            name: account.name,
            iban: account.iban,
            currency: account.currency,
            status: account.status,
            institution: account.institution_id,
            error: 'Failed to load summary',
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        connectedAccounts: accounts.length,
        accounts: accountSummaries,
        lastSyncCheck: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error fetching GoCardless account status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}