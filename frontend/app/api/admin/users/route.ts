import { NextRequest, NextResponse } from 'next/server';
import { PermissionsService } from '@/lib/services/permissions-service';
import { User, UserPermissions, FeatureKey, SubscriptionTier } from '@/lib/types/permissions';

// Mock database - in real app, use actual database
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Diogo Menezes',
    email: 'diogo@example.com',
    subscriptionTier: 'premium',
    permissions: {
      userId: '1',
      subscriptionTier: 'premium',
      isAdmin: true,
      customPermissions: {}
    },
    createdAt: new Date('2024-01-01'),
    lastActiveAt: new Date(),
    isActive: true
  },
  {
    id: '2', 
    name: 'Joana Silva',
    email: 'joana@example.com',
    subscriptionTier: 'free',
    permissions: {
      userId: '2',
      subscriptionTier: 'free',
      isAdmin: false,
      customPermissions: {
        'transactions': true,
        'budgeting': false
      }
    },
    createdAt: new Date('2024-01-15'),
    lastActiveAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isActive: true
  },
  {
    id: '3',
    name: 'Carlos Santos',
    email: 'carlos@example.com', 
    subscriptionTier: 'basic',
    permissions: {
      userId: '3',
      subscriptionTier: 'basic',
      isAdmin: false,
      customPermissions: {}
    },
    createdAt: new Date('2024-02-01'),
    lastActiveAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    isActive: false
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@example.com',
    subscriptionTier: 'pro',
    permissions: {
      userId: '4',
      subscriptionTier: 'pro',
      isAdmin: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      customPermissions: {}
    },
    createdAt: new Date('2024-01-20'),
    lastActiveAt: new Date(),
    isActive: true
  }
];

// GET /api/admin/users - Get all users with permissions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    let users = [...mockUsers];
    
    if (!includeInactive) {
      users = users.filter(user => user.isActive);
    }

    // Add computed fields
    const usersWithComputed = users.map(user => ({
      ...user,
      accessibleFeatures: PermissionsService.getAccessibleFeatures(user.permissions),
      canUpgrade: PermissionsService.canUpgrade(user.subscriptionTier),
      nextTier: PermissionsService.getNextTier(user.subscriptionTier),
      isExpired: PermissionsService.isSubscriptionExpired(user.permissions)
    }));

    return NextResponse.json({
      success: true,
      users: usersWithComputed,
      total: usersWithComputed.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subscriptionTier, isAdmin, adminUserId } = body;

    // Get admin user permissions (in real app, get from JWT/session)
    const adminUser = mockUsers.find(u => u.id === adminUserId);
    if (!adminUser || !adminUser.permissions.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!name || !email || !subscriptionTier) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and subscription tier are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (mockUsers.find(u => u.email === email)) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      name,
      email,
      subscriptionTier,
      permissions: {
        userId: String(mockUsers.length + 1),
        subscriptionTier,
        isAdmin: Boolean(isAdmin),
        customPermissions: {}
      },
      createdAt: new Date(),
      isActive: true
    };

    mockUsers.push(newUser);

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}