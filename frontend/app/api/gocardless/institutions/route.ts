import { NextRequest, NextResponse } from 'next/server';

// GoCardless Bank Account Data API - Institutions endpoint
// Based on: https://developer.gocardless.com/partners/introduction
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'PT';

    // In production, this would call the actual GoCardless API
    // For now, return mock data based on common European banks
    const institutions = getInstitutionsByCountry(country);

    return NextResponse.json({
      success: true,
      institutions,
      country,
      total: institutions.length,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
}

function getInstitutionsByCountry(countryCode: string) {
  const institutionData: Record<string, any[]> = {
    PT: [
      {
        id: 'MILLENNIUM_BCOMPTPL',
        name: 'Millennium BCP',
        bic: 'BCOMPTPL',
        transaction_total_days: '90',
        countries: ['PT'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'CAIXA_CGDIPTPL',
        name: 'Caixa Geral de Depósitos',
        bic: 'CGDIPTPL',
        transaction_total_days: '90',
        countries: ['PT'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'SANTANDER_BSCHPTPL',
        name: 'Banco Santander Totta',
        bic: 'BSCHPTPL',
        transaction_total_days: '90',
        countries: ['PT'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'NOVO_BANCO_BESCPTPL',
        name: 'Novo Banco',
        bic: 'BESCPTPL',
        transaction_total_days: '90',
        countries: ['PT'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'BPI_BBPIPTPL',
        name: 'Banco BPI',
        bic: 'BBPIPTPL',
        transaction_total_days: '90',
        countries: ['PT'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'MONTEPIO_BPNPPTPL',
        name: 'Banco Montepio',
        bic: 'BPNPPTPL',
        transaction_total_days: '90',
        countries: ['PT'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      }
    ],
    ES: [
      {
        id: 'SANTANDER_BSCHESMM',
        name: 'Banco Santander',
        bic: 'BSCHESMM',
        transaction_total_days: '90',
        countries: ['ES'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'BBVA_BBVAESMM',
        name: 'BBVA',
        bic: 'BBVAESMM',
        transaction_total_days: '90',
        countries: ['ES'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'CAIXABANK_CAIXESBB',
        name: 'CaixaBank',
        bic: 'CAIXESBB',
        transaction_total_days: '90',
        countries: ['ES'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'ABANCA_CAGLESMM',
        name: 'ABANCA',
        bic: 'CAGLESMM',
        transaction_total_days: '90',
        countries: ['ES'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      }
    ],
    FR: [
      {
        id: 'BNP_BNPAFRPP',
        name: 'BNP Paribas',
        bic: 'BNPAFRPP',
        transaction_total_days: '90',
        countries: ['FR'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'CREDIT_AGRICOLE_AGRIFRPP',
        name: 'Crédit Agricole',
        bic: 'AGRIFRPP',
        transaction_total_days: '90',
        countries: ['FR'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'SOCIETE_GENERALE_SOGEFRPP',
        name: 'Société Générale',
        bic: 'SOGEFRPP',
        transaction_total_days: '90',
        countries: ['FR'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      }
    ],
    DE: [
      {
        id: 'DEUTSCHE_BANK_DEUTDEFF',
        name: 'Deutsche Bank',
        bic: 'DEUTDEFF',
        transaction_total_days: '90',
        countries: ['DE'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'COMMERZBANK_COBADEFF',
        name: 'Commerzbank',
        bic: 'COBADEFF',
        transaction_total_days: '90',
        countries: ['DE'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'DKB_BYLADEM1001',
        name: 'DKB (Deutsche Kreditbank)',
        bic: 'BYLADEM1001',
        transaction_total_days: '90',
        countries: ['DE'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      }
    ],
    IT: [
      {
        id: 'INTESA_BCITITMM',
        name: 'Intesa Sanpaolo',
        bic: 'BCITITMM',
        transaction_total_days: '90',
        countries: ['IT'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'UNICREDIT_UNCRITMM',
        name: 'UniCredit',
        bic: 'UNCRITMM',
        transaction_total_days: '90',
        countries: ['IT'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      }
    ],
    NL: [
      {
        id: 'ING_INGBNL2A',
        name: 'ING Bank',
        bic: 'INGBNL2A',
        transaction_total_days: '90',
        countries: ['NL'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'ABN_AMRO_ABNANL2A',
        name: 'ABN AMRO',
        bic: 'ABNANL2A',
        transaction_total_days: '90',
        countries: ['NL'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      },
      {
        id: 'RABOBANK_RABONL2U',
        name: 'Rabobank',
        bic: 'RABONL2U',
        transaction_total_days: '90',
        countries: ['NL'],
        supported_payments: ['SEPA', 'Domestic'],
        supported_features: ['account_details', 'balances', 'transactions'],
        logo_url: null
      }
    ]
  };

  return institutionData[countryCode] || [];
}

// Helper function to integrate with real GoCardless API (for production)
async function fetchGoCardlessInstitutions(country: string) {
  const GOCARDLESS_SECRET_ID = process.env.GOCARDLESS_SECRET_ID;
  const GOCARDLESS_SECRET_KEY = process.env.GOCARDLESS_SECRET_KEY;
  const GOCARDLESS_ENVIRONMENT = process.env.GOCARDLESS_ENVIRONMENT || 'sandbox';

  if (!GOCARDLESS_SECRET_ID || !GOCARDLESS_SECRET_KEY) {
    throw new Error('GoCardless credentials not configured');
  }

  const baseUrl = GOCARDLESS_ENVIRONMENT === 'live' 
    ? 'https://bankaccountdata.gocardless.com' 
    : 'https://bankaccountdata.sandbox.gocardless.com';

  // Get access token first
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

  // Fetch institutions
  const institutionsResponse = await fetch(`${baseUrl}/api/v2/institutions/?country=${country}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!institutionsResponse.ok) {
    throw new Error('Failed to fetch institutions from GoCardless');
  }

  return await institutionsResponse.json();
}