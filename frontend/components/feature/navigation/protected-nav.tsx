import Link from 'next/link';
import { usePermissions } from '@/hooks/use-permissions';
import { FeatureKey } from '@/lib/types/permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  CreditCard, 
  TrendingUp, 
  Target, 
  Bot, 
  Download, 
  Upload, 
  Users, 
  Bell, 
  Calendar,
  BarChart3
} from 'lucide-react';

interface NavItem {
  feature: FeatureKey;
  href: string;
  label: string;
  icon: React.ReactNode;
  tier: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    feature: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    tier: 'Free'
  },
  {
    feature: 'transactions',
    href: '/transactions',
    label: 'Transactions',
    icon: <CreditCard className="h-4 w-4" />,
    tier: 'Free'
  },
  {
    feature: 'budgeting',
    href: '/budgeting',
    label: 'Budgeting',
    icon: <Target className="h-4 w-4" />,
    tier: 'Basic'
  },
  {
    feature: 'export',
    href: '/export',
    label: 'Export',
    icon: <Download className="h-4 w-4" />,
    tier: 'Basic'
  },
  {
    feature: 'analytics',
    href: '/analytics',
    label: 'Analytics',
    icon: <TrendingUp className="h-4 w-4" />,
    tier: 'Premium'
  },
  {
    feature: 'goals',
    href: '/goals',
    label: 'Goals',
    icon: <Target className="h-4 w-4" />,
    tier: 'Premium'
  },
  {
    feature: 'ai_assistant',
    href: '/ai-assistant',
    label: 'AI Assistant',
    icon: <Bot className="h-4 w-4" />,
    tier: 'Premium'
  },
  {
    feature: 'bulk_upload',
    href: '/bulk-upload',
    label: 'Bulk Upload',
    icon: <Upload className="h-4 w-4" />,
    tier: 'Premium'
  },
  {
    feature: 'advanced_charts',
    href: '/analytics/advanced',
    label: 'Advanced Charts',
    icon: <BarChart3 className="h-4 w-4" />,
    tier: 'Pro'
  },
  {
    feature: 'community',
    href: '/community',
    label: 'Community',
    icon: <Users className="h-4 w-4" />,
    tier: 'Pro'
  },
  {
    feature: 'notifications',
    href: '/notifications',
    label: 'Notifications',
    icon: <Bell className="h-4 w-4" />,
    tier: 'Pro'
  },
  {
    feature: 'subscriptions',
    href: '/subscriptions',
    label: 'Subscriptions',
    icon: <Calendar className="h-4 w-4" />,
    tier: 'Pro'
  }
];

export function ProtectedNav() {
  const { hasFeatureAccess, permissions, canUpgrade, nextTier } = usePermissions();

  if (!permissions) {
    return (
      <nav className="space-y-2">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </nav>
    );
  }

  const accessibleItems = NAV_ITEMS.filter(item => hasFeatureAccess(item.feature));
  const restrictedItems = NAV_ITEMS.filter(item => !hasFeatureAccess(item.feature));

  return (
    <nav className="space-y-6">
      {/* Accessible Features */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Available Features</h3>
        <div className="space-y-1">
          {accessibleItems.map((item) => (
            <Link
              key={item.feature}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              <Badge variant="secondary" className="text-xs">
                {item.tier}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Restricted Features */}
      {restrictedItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Locked Features</h3>
          <div className="space-y-1">
            {restrictedItems.map((item) => (
              <div
                key={item.feature}
                className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground opacity-60"
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                <Badge variant="outline" className="text-xs">
                  {item.tier}
                </Badge>
              </div>
            ))}
          </div>
          
          {canUpgrade && nextTier && (
            <Button variant="outline" size="sm" className="w-full mt-3">
              Upgrade to {nextTier} 
            </Button>
          )}
        </div>
      )}

      {/* Current Plan */}
      <div className="p-3 bg-muted rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Current Plan</span>
          <Badge variant="default">
            {permissions.subscriptionTier}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {accessibleItems.length} of {NAV_ITEMS.length} features available
        </div>
        {permissions.isAdmin && (
          <Badge variant="destructive" className="text-xs mt-2">
            Admin Access
          </Badge>
        )}
      </div>
    </nav>
  );
}