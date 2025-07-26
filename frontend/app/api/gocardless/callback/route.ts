import { NextRequest, NextResponse } from 'next/server';
import { updateRequisitionStatus } from '../requisitions/route';

// GoCardless Bank Account Data OAuth Callback Handler
// Handles the redirect after user completes bank authentication
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref'); // Requisition reference
    const error = searchParams.get('error');
    const requisitionId = searchParams.get('req'); // Requisition ID

    // Handle error cases
    if (error) {
      console.error('GoCardless OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/banking/connection-failed?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!ref && !requisitionId) {
      console.error('Missing requisition reference or ID in callback');
      return NextResponse.redirect(
        new URL('/banking/connection-failed?error=missing_reference', request.url)
      );
    }

    // Process the successful connection
    const result = await processSuccessfulConnection(ref || requisitionId);

    if (result.success) {
      // Redirect to success page with connection details
      const successUrl = new URL('/banking/connection-success', request.url);
      successUrl.searchParams.set('requisitionId', result.requisitionId);
      successUrl.searchParams.set('accounts', result.accounts.length.toString());
      
      return NextResponse.redirect(successUrl);
    } else {
      // Handle processing failure
      return NextResponse.redirect(
        new URL(`/banking/connection-failed?error=${encodeURIComponent(result.error)}`, request.url)
      );
    }
  } catch (error) {
    console.error('OAuth callback processing error:', error);
    return NextResponse.redirect(
      new URL('/banking/connection-failed?error=processing_failed', request.url)
    );
  }
}

async function processSuccessfulConnection(requisitionRef: string) {
  try {
    const GOCARDLESS_SECRET_ID = process.env.GOCARDLESS_SECRET_ID;
    const GOCARDLESS_SECRET_KEY = process.env.GOCARDLESS_SECRET_KEY;
    const GOCARDLESS_ENVIRONMENT = process.env.GOCARDLESS_ENVIRONMENT || 'sandbox';

    if (!GOCARDLESS_SECRET_ID || !GOCARDLESS_SECRET_KEY) {
      console.warn('GoCardless credentials not found, using mock processing');
      return processMockConnection(requisitionRef);
    }

    const baseUrl = GOCARDLESS_ENVIRONMENT === 'live' 
      ? 'https://bankaccountdata.gocardless.com' 
      : 'https://bankaccountdata.sandbox.gocardless.com';

    // Get access token
    const tokenResponse = await fetch(`${baseUrl}/api/v2/token/new/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret_id: GOCARDLESS_SECRET_ID,
        secret_key: GOCARDLESS_SECRET_KEY,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get GoCardless access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access;

    // Fetch the requisition to get account IDs
    const requisitionResponse = await fetch(`${baseUrl}/api/v2/requisitions/${requisitionRef}/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!requisitionResponse.ok) {
      throw new Error('Failed to fetch requisition details');
    }

    const requisitionData = await requisitionResponse.json();

    // Check if requisition is linked (user completed authentication)
    if (requisitionData.status !== 'LN') { // LN = Linked
      return {
        success: false,
        error: 'Bank connection not completed',
        requisitionId: requisitionRef
      };
    }

    // Process each connected account
    const accountDetails = [];
    for (const accountId of requisitionData.accounts) {
      try {
        const accountInfo = await fetchAccountDetails(accountId, accessToken, baseUrl);
        accountDetails.push(accountInfo);
        
        // Store account in database
        await storeConnectedAccount({
          accountId,
          requisitionId: requisitionRef,
          institutionId: requisitionData.institution_id,
          accountDetails: accountInfo,
          userId: extractUserIdFromReference(requisitionData.reference),
          connectedAt: new Date()
        });

        // Trigger initial sync
        await triggerAccountSync(accountId);
      } catch (error) {
        console.error(`Failed to process account ${accountId}:`, error);
      }
    }

    // Update requisition status
    await updateRequisitionStatus(requisitionRef, 'linked', requisitionData.accounts);

    return {
      success: true,
      requisitionId: requisitionRef,
      accounts: accountDetails,
      institutionId: requisitionData.institution_id
    };
  } catch (error) {
    console.error('Connection processing error:', error);
    return {
      success: false,
      error: error.message || 'Processing failed',
      requisitionId: requisitionRef
    };
  }
}

async function fetchAccountDetails(accountId: string, accessToken: string, baseUrl: string) {
  // Fetch account metadata
  const accountResponse = await fetch(`${baseUrl}/api/v2/accounts/${accountId}/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!accountResponse.ok) {
    throw new Error('Failed to fetch account details');
  }

  const accountData = await accountResponse.json();

  // Fetch account balances
  const balancesResponse = await fetch(`${baseUrl}/api/v2/accounts/${accountId}/balances/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  let balances = [];
  if (balancesResponse.ok) {
    const balancesData = await balancesResponse.json();
    balances = balancesData.balances || [];
  }

  return {
    id: accountId,
    iban: accountData.iban,
    name: accountData.name || 'Bank Account',
    currency: accountData.currency,
    account_type: accountData.account_type,
    balances,
    status: accountData.status || 'ready',
    institution_id: accountData.institution_id
  };
}

function processMockConnection(requisitionRef: string) {
  // Mock successful connection for development
  const mockAccounts = [
    {
      id: `account_${Date.now()}_1`,
      iban: 'PT50000700000000000000001',
      name: 'Current Account',
      currency: 'EUR',
      account_type: 'CHECKING',
      balances: [
        {
          balanceAmount: { amount: '2547.83', currency: 'EUR' },
          balanceType: 'expected'
        }
      ],
      status: 'ready',
      institution_id: 'MILLENNIUM_BCOMPTPL'
    },
    {
      id: `account_${Date.now()}_2`,
      iban: 'PT50000700000000000000002',
      name: 'Savings Account',
      currency: 'EUR',
      account_type: 'SAVINGS',
      balances: [
        {
          balanceAmount: { amount: '8234.67', currency: 'EUR' },
          balanceType: 'expected'
        }
      ],
      status: 'ready',
      institution_id: 'MILLENNIUM_BCOMPTPL'
    }
  ];

  // Store mock accounts
  mockAccounts.forEach(account => {
    storeMockConnectedAccount({
      accountId: account.id,
      requisitionId: requisitionRef,
      institutionId: account.institution_id,
      accountDetails: account,
      userId: extractUserIdFromReference(requisitionRef),
      connectedAt: new Date()
    });
  });

  return {
    success: true,
    requisitionId: requisitionRef,
    accounts: mockAccounts,
    institutionId: 'MILLENNIUM_BCOMPTPL'
  };
}

function extractUserIdFromReference(reference: string): string {
  // Extract user ID from reference format: "user_{userId}_{timestamp}"
  const match = reference.match(/^user_([^_]+)_/);
  return match ? match[1] : 'unknown';
}

// Database operations (implement with your database)
async function storeConnectedAccount(accountData: any) {
  console.log('Storing connected account:', accountData);
  
  // Example implementation with Prisma:
  /*
  await prisma.connectedAccount.create({
    data: {
      id: accountData.accountId,
      requisitionId: accountData.requisitionId,
      institutionId: accountData.institutionId,
      userId: accountData.userId,
      iban: accountData.accountDetails.iban,
      name: accountData.accountDetails.name,
      currency: accountData.accountDetails.currency,
      accountType: accountData.accountDetails.account_type,
      status: 'active',
      connectedAt: accountData.connectedAt,
      lastSyncAt: null,
      metadata: JSON.stringify(accountData.accountDetails)
    }
  });
  */
}

// Mock storage for development
const mockConnectedAccounts = new Map();

function storeMockConnectedAccount(accountData: any) {
  mockConnectedAccounts.set(accountData.accountId, accountData);
}

// Trigger initial account sync
async function triggerAccountSync(accountId: string) {
  try {
    // Call the existing GoCardless sync API
    await fetch('/api/sync/gocardless/accounts/' + accountId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        initialSync: true,
        syncTransactions: true,
        syncBalances: true
      })
    });
  } catch (error) {
    console.error('Failed to trigger account sync:', error);
  }
}