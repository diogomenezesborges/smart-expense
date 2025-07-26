// User Permission System Types

export type FeatureKey = 
  | 'dashboard'
  | 'transactions'
  | 'analytics'
  | 'budgeting' 
  | 'goals'
  | 'ai_assistant'
  | 'export'
  | 'bulk_upload'
  | 'community'
  | 'notifications'
  | 'subscriptions'
  | 'advanced_charts';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'pro';

export interface Feature {
  key: FeatureKey;
  name: string;
  description: string;
  category: 'core' | 'analytics' | 'premium' | 'social';
  requiredTier: SubscriptionTier;
  icon?: string;
}

export interface UserPermissions {
  userId: string;
  subscriptionTier: SubscriptionTier;
  customPermissions?: Partial<Record<FeatureKey, boolean>>;
  expiresAt?: Date;
  isAdmin?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  permissions: UserPermissions;
  createdAt: Date;
  lastActiveAt?: Date;
  isActive: boolean;
}

export interface PermissionMatrix {
  users: User[];
  features: Feature[];
}

// Default feature definitions
export const FEATURES: Feature[] = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    description: 'Financial overview and insights',
    category: 'core',
    requiredTier: 'free',
    icon: 'LayoutDashboard'
  },
  {
    key: 'transactions',
    name: 'Transactions',
    description: 'Transaction management and search',
    category: 'core',
    requiredTier: 'free',
    icon: 'CreditCard'
  },
  {
    key: 'budgeting',
    name: 'Budgeting',
    description: 'Budget creation and tracking',
    category: 'core',
    requiredTier: 'basic',
    icon: 'Target'
  },
  {
    key: 'export',
    name: 'Data Export',
    description: 'Export data to CSV, PDF, Excel',
    category: 'core',
    requiredTier: 'basic',
    icon: 'Download'
  },
  {
    key: 'analytics',
    name: 'Advanced Analytics',
    description: 'Detailed financial analytics and reports',
    category: 'analytics',
    requiredTier: 'premium',
    icon: 'TrendingUp'
  },
  {
    key: 'goals',
    name: 'Financial Goals',
    description: 'Goal setting and progress tracking',
    category: 'analytics',
    requiredTier: 'premium',
    icon: 'Trophy'
  },
  {
    key: 'ai_assistant',
    name: 'AI Assistant',
    description: 'AI-powered financial coaching',
    category: 'premium',
    requiredTier: 'premium',
    icon: 'Bot'
  },
  {
    key: 'bulk_upload',
    name: 'Bulk Upload',
    description: 'Bulk data import and migration',
    category: 'premium',
    requiredTier: 'premium',
    icon: 'Upload'
  },
  {
    key: 'advanced_charts',
    name: 'Advanced Charts',
    description: 'Premium visualizations and charts',
    category: 'premium',
    requiredTier: 'pro',
    icon: 'BarChart3'
  },
  {
    key: 'community',
    name: 'Community',
    description: 'Social features and learning platform',
    category: 'social',
    requiredTier: 'pro',
    icon: 'Users'
  },
  {
    key: 'notifications',
    name: 'Smart Notifications',
    description: 'Advanced notification system',
    category: 'premium',
    requiredTier: 'pro',
    icon: 'Bell'
  },
  {
    key: 'subscriptions',
    name: 'Subscription Management',
    description: 'Manage recurring subscriptions',
    category: 'premium',
    requiredTier: 'pro',
    icon: 'Calendar'
  }
];

// Subscription tier feature access
export const TIER_FEATURES: Record<SubscriptionTier, FeatureKey[]> = {
  free: ['dashboard', 'transactions'],
  basic: ['dashboard', 'transactions', 'budgeting', 'export'],
  premium: ['dashboard', 'transactions', 'budgeting', 'export', 'analytics', 'goals', 'ai_assistant', 'bulk_upload'],
  pro: ['dashboard', 'transactions', 'budgeting', 'export', 'analytics', 'goals', 'ai_assistant', 'bulk_upload', 'advanced_charts', 'community', 'notifications', 'subscriptions']
};

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, { name: string; price: number; description: string }> = {
  free: {
    name: 'Free',
    price: 0,
    description: 'Basic financial tracking'
  },
  basic: {
    name: 'Basic',
    price: 9.99,
    description: 'Essential budgeting tools'
  },
  premium: {
    name: 'Premium', 
    price: 19.99,
    description: 'Advanced analytics and AI'
  },
  pro: {
    name: 'Pro',
    price: 29.99,
    description: 'All features + community'
  }
};