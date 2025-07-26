import { NextRequest, NextResponse } from 'next/server';
import { FEATURES, SUBSCRIPTION_TIERS } from '@/lib/types/permissions';

// GET /api/admin/features - Get all available features and subscription tiers
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      features: FEATURES,
      subscriptionTiers: SUBSCRIPTION_TIERS,
      categories: {
        core: FEATURES.filter(f => f.category === 'core'),
        analytics: FEATURES.filter(f => f.category === 'analytics'),
        premium: FEATURES.filter(f => f.category === 'premium'),
        social: FEATURES.filter(f => f.category === 'social')
      }
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch features' },
      { status: 500 }
    );
  }
}