import { NextRequest, NextResponse } from 'next/server';
import { PermissionsService } from '@/lib/services/permissions-service';
import { UserPermissions, FeatureKey, SubscriptionTier } from '@/lib/types/permissions';

// Mock users data (in real app, use database)
const mockUsers = [
  {
    id: '1',
    name: 'Diogo Menezes',
    permissions: {
      userId: '1',
      subscriptionTier: 'premium' as SubscriptionTier,
      isAdmin: true,
      customPermissions: {}
    }
  },
  {
    id: '2',
    name: 'Joana Silva',
    permissions: {
      userId: '2',
      subscriptionTier: 'free' as SubscriptionTier,
      isAdmin: false,
      customPermissions: {}
    }
  }
];

// PUT /api/admin/users/[userId]/permissions - Update user permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();
    const { 
      subscriptionTier, 
      customPermissions, 
      isAdmin, 
      expiresAt,
      adminUserId 
    } = body;

    // Get admin user (in real app, extract from JWT/session)
    const adminUser = mockUsers.find(u => u.id === adminUserId);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Get target user
    const targetUser = mockUsers.find(u => u.id === userId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare new permissions
    const newPermissions: Partial<UserPermissions> = {
      subscriptionTier,
      customPermissions,
      isAdmin,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    };

    // Validate permission update
    const validation = PermissionsService.validatePermissionUpdate(
      userId,
      adminUserId,
      adminUser.permissions,
      newPermissions
    );

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Update permissions
    targetUser.permissions = {
      ...targetUser.permissions,
      ...newPermissions
    };

    // Get updated accessible features
    const accessibleFeatures = PermissionsService.getAccessibleFeatures(targetUser.permissions);

    return NextResponse.json({
      success: true,
      permissions: targetUser.permissions,
      accessibleFeatures,
      message: 'Permissions updated successfully'
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update permissions' },
      { status: 500 }
    );
  }
}

// GET /api/admin/users/[userId]/permissions - Get user permissions
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const accessibleFeatures = PermissionsService.getAccessibleFeatures(user.permissions);
    const canUpgrade = PermissionsService.canUpgrade(user.permissions.subscriptionTier);
    const nextTier = PermissionsService.getNextTier(user.permissions.subscriptionTier);
    const isExpired = PermissionsService.isSubscriptionExpired(user.permissions);

    return NextResponse.json({
      success: true,
      permissions: user.permissions,
      accessibleFeatures,
      canUpgrade,
      nextTier,
      isExpired
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}