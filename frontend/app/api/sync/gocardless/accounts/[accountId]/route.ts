import { NextRequest, NextResponse } from 'next/server';
import { gocardlessService } from '@/lib/services/gocardless';

interface RouteParams {
  params: {
    accountId: string;
  };
}

// GET /api/sync/gocardless/accounts/[accountId] - Get detailed account information
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { accountId } = params;
    const summary = await gocardlessService.getAccountSummary(accountId);

    return NextResponse.json({
      success: true,
      data: summary,
    });

  } catch (error) {
    console.error(`Error fetching account details for ${params.accountId}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/sync/gocardless/accounts/[accountId] - Sync specific account
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { accountId } = params;
    const body = await request.json();
    
    const dateFrom = body.dateFrom || (() => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date.toISOString().split('T')[0];
    })();
    
    const dateTo = body.dateTo || new Date().toISOString().split('T')[0];

    const result = await gocardlessService.syncAccountTransactions(
      accountId,
      dateFrom,
      dateTo
    );

    return NextResponse.json({
      success: true,
      data: {
        accountId,
        ...result,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
      },
      message: `Account sync completed: ${result.created} new, ${result.updated} updated transactions`,
    });

  } catch (error) {
    console.error(`Error syncing account ${params.accountId}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}