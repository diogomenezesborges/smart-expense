import { NextRequest, NextResponse } from 'next/server';

// GoCardless Bank Account Data API - Requisitions endpoint
// Based on: https://developer.gocardless.com/partners/introduction
export async function POST(request: NextRequest) {
  try {
    const { institutionId, userId, redirectUrl } = await request.json();

    if (!institutionId || !userId) {
      return NextResponse.json(
        { error: 'Institution ID and User ID are required' },
        { status: 400 }
      );
    }

    // Create requisition with GoCardless
    const requisition = await createRequisition({
      institutionId,
      userId,
      redirectUrl: redirectUrl || `${process.env.NEXTAUTH_URL}/banking/callback`
    });

    return NextResponse.json({
      success: true,
      requisition,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating requisition:', error);
    return NextResponse.json(
      { error: 'Failed to create bank connection requisition' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const requisitionId = searchParams.get('requisitionId');

    if (requisitionId) {
      // Get specific requisition
      const requisition = await getRequisition(requisitionId);
      return NextResponse.json({
        success: true,
        requisition,
        fetchedAt: new Date().toISOString()
      });
    }

    if (userId) {
      // Get user's requisitions
      const requisitions = await getUserRequisitions(userId);
      return NextResponse.json({
        success: true,
        requisitions,
        total: requisitions.length,
        fetchedAt: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Either userId or requisitionId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requisitions' },
      { status: 500 }
    );
  }
}

interface CreateRequisitionParams {
  institutionId: string;
  userId: string;
  redirectUrl: string;
}

async function createRequisition({ institutionId, userId, redirectUrl }: CreateRequisitionParams) {
  const GOCARDLESS_SECRET_ID = process.env.GOCARDLESS_SECRET_ID;
  const GOCARDLESS_SECRET_KEY = process.env.GOCARDLESS_SECRET_KEY;
  const GOCARDLESS_ENVIRONMENT = process.env.GOCARDLESS_ENVIRONMENT || 'sandbox';

  if (!GOCARDLESS_SECRET_ID || !GOCARDLESS_SECRET_KEY) {
    console.warn('GoCardless credentials not found, returning mock requisition');
    return createMockRequisition(institutionId, userId, redirectUrl);
  }

  try {
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

    // Create requisition
    const requisitionResponse = await fetch(`${baseUrl}/api/v2/requisitions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        redirect: redirectUrl,
        institution_id: institutionId,
        reference: `user_${userId}_${Date.now()}`, // Unique reference
        agreement: undefined, // Optional: End User Agreement ID
        user_language: 'EN', // User's language preference
      }),
    });

    if (!requisitionResponse.ok) {
      const errorData = await requisitionResponse.json();
      throw new Error(`Failed to create requisition: ${JSON.stringify(errorData)}`);
    }

    const requisitionData = await requisitionResponse.json();
    
    // Store requisition in database for tracking
    await storeRequisition({
      id: requisitionData.id,
      userId,
      institutionId,
      status: 'created',
      redirectUrl,
      link: requisitionData.link,
      reference: requisitionData.reference,
      createdAt: new Date(),
    });

    return requisitionData;
  } catch (error) {
    console.error('GoCardless API error:', error);
    // Fallback to mock for development
    return createMockRequisition(institutionId, userId, redirectUrl);
  }
}

function createMockRequisition(institutionId: string, userId: string, redirectUrl: string) {
  const requisitionId = `req_${institutionId}_${userId}_${Date.now()}`;
  const mockRequisition = {
    id: requisitionId,
    created: new Date().toISOString(),
    redirect: redirectUrl,
    status: 'CR', // Created
    institution_id: institutionId,
    agreement: null,
    reference: `user_${userId}_${Date.now()}`,
    accounts: [],
    user_language: 'EN',
    link: `https://bankaccountdata.sandbox.gocardless.com/psd2/start/${requisitionId}/${institutionId}/`,
    ssn: null
  };

  // Store in mock database (in production, this would go to real database)
  storeMockRequisition(requisitionId, {
    ...mockRequisition,
    userId,
    createdAt: new Date()
  });

  return mockRequisition;
}

async function getRequisition(requisitionId: string) {
  // In production, fetch from GoCardless API and database
  // For now, return mock data
  return getMockRequisition(requisitionId);
}

async function getUserRequisitions(userId: string) {
  // In production, fetch from database
  // For now, return mock data
  return getMockUserRequisitions(userId);
}

// Mock database functions (replace with real database operations)
const mockRequisitions = new Map();

function storeMockRequisition(id: string, requisition: any) {
  mockRequisitions.set(id, requisition);
}

function getMockRequisition(id: string) {
  return mockRequisitions.get(id) || null;
}

function getMockUserRequisitions(userId: string) {
  const userRequisitions = [];
  for (const [id, requisition] of mockRequisitions.entries()) {
    if (requisition.userId === userId) {
      userRequisitions.push(requisition);
    }
  }
  return userRequisitions;
}

// Database storage function (implement with your database)
async function storeRequisition(requisitionData: any) {
  // In production, store in your database
  console.log('Storing requisition:', requisitionData);
  
  // Example implementation with Prisma:
  /*
  await prisma.bankRequisition.create({
    data: {
      id: requisitionData.id,
      userId: requisitionData.userId,
      institutionId: requisitionData.institutionId,
      status: requisitionData.status,
      redirectUrl: requisitionData.redirectUrl,
      link: requisitionData.link,
      reference: requisitionData.reference,
      createdAt: requisitionData.createdAt,
    }
  });
  */
}

// Update requisition status (called from callback handler)
export async function updateRequisitionStatus(requisitionId: string, status: string, accounts?: string[]) {
  // In production, update in database and sync with GoCardless
  console.log('Updating requisition status:', { requisitionId, status, accounts });
  
  const requisition = mockRequisitions.get(requisitionId);
  if (requisition) {
    requisition.status = status;
    requisition.accounts = accounts || [];
    requisition.updatedAt = new Date();
    mockRequisitions.set(requisitionId, requisition);
  }
}