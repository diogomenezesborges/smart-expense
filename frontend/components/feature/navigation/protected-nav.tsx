import Link from 'next/link';
import { useState } from 'react';
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
  BarChart3,
  ChevronDown,
  ChevronRight,
  Zap,
  Sparkles
} from 'lucide-react';

interface NavItem {
  feature: FeatureKey;
  href: string;
  label: string;
  icon: React.ReactNode;
  tier: string;
  category: 'mvp' | 'future';
}

// MVP Core Features - Essential for first release
const MVP_ITEMS: NavItem[] = [
  {
    feature: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    tier: 'Free',
    category: 'mvp'
  },
  {
    feature: 'transactions',
    href: '/transactions',
    label: 'Transactions',
    icon: <CreditCard className="h-4 w-4" />,
    tier: 'Free',
    category: 'mvp'
  },
  {
    feature: 'ai_assistant',
    href: '/ai-assistant',
    label: 'AI Assistant',
    icon: <Bot className="h-4 w-4" />,
    tier: 'Free',
    category: 'mvp'
  }
];

// Future Features - Coming in later releases
const FUTURE_ITEMS: NavItem[] = [
  {
    feature: 'budgeting',
    href: '/budgeting',
    label: 'Budgeting',
    icon: <Target className="h-4 w-4" />,
    tier: 'Basic',
    category: 'future'
  },
  {
    feature: 'goals',
    href: '/goals',
    label: 'Goals',
    icon: <Target className="h-4 w-4" />,
    tier: 'Premium',
    category: 'future'
  },
  {
    feature: 'analytics',
    href: '/analytics',
    label: 'Advanced Analytics',
    icon: <TrendingUp className="h-4 w-4" />,
    tier: 'Premium',
    category: 'future'
  },
  {
    feature: 'export',
    href: '/export',
    label: 'Export Data',
    icon: <Download className="h-4 w-4" />,
    tier: 'Basic',
    category: 'future'
  },
  {
    feature: 'bulk_upload',
    href: '/bulk-upload',
    label: 'Bulk Upload',
    icon: <Upload className="h-4 w-4" />,
    tier: 'Premium',
    category: 'future'
  },
  {
    feature: 'community',
    href: '/community',
    label: 'Community',
    icon: <Users className="h-4 w-4" />,
    tier: 'Pro',
    category: 'future'
  },
  {
    feature: 'notifications',
    href: '/notifications',
    label: 'Smart Notifications',
    icon: <Bell className="h-4 w-4" />,
    tier: 'Pro',
    category: 'future'
  },
  {
    feature: 'advanced_charts',
    href: '/analytics/advanced',
    label: 'Advanced Charts',
    icon: <BarChart3 className="h-4 w-4" />,
    tier: 'Pro',
    category: 'future'
  }
];

export function ProtectedNav() {
  const { hasFeatureAccess, permissions, canUpgrade, nextTier } = usePermissions();
  const [showFutureFeatures, setShowFutureFeatures] = useState(false);

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

  const accessibleMvpItems = MVP_ITEMS.filter(item => hasFeatureAccess(item.feature));
  const accessibleFutureItems = FUTURE_ITEMS.filter(item => hasFeatureAccess(item.feature));
  const restrictedFutureItems = FUTURE_ITEMS.filter(item => !hasFeatureAccess(item.feature));

  return (
    <nav className="space-y-4">
      {/* MVP Core Features */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-foreground">Core Features</h3>
        </div>
        <div className="space-y-1">
          {accessibleMvpItems.map((item) => (
            <Link
              key={item.feature}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group"
            >
              <div className="text-blue-600 group-hover:text-blue-700">
                {item.icon}
              </div>
              <span className="flex-1 font-medium">{item.label}</span>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                {item.tier}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Bank Connection - Special MVP item */}
      <div className="px-3 py-2.5 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Bank Connection</span>
          <Badge variant="default" className="text-xs bg-green-600 text-white">
            Available
          </Badge>
        </div>
        <p className="text-xs text-green-700 mb-2">
          Connect your bank accounts securely via GoCardless API
        </p>
        <a href="/banking/connect">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-7 border-green-300 text-green-700 hover:bg-green-100"
          >
            Setup Bank Sync
          </Button>
        </a>
      </div>

      {/* Future Features Dropdown */}
      <div>
        <button
          onClick={() => setShowFutureFeatures(!showFutureFeatures)}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          <span className="flex-1 text-left font-medium">Future Features</span>
          <Badge variant="outline" className="text-xs">
            {FUTURE_ITEMS.length} planned
          </Badge>
          {showFutureFeatures ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>

        {showFutureFeatures && (
          <div className="mt-2 ml-6 space-y-1 border-l border-muted pl-4">
            {/* Accessible Future Features */}
            {accessibleFutureItems.map((item) => (
              <Link
                key={item.feature}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors opacity-75"
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {item.tier}
                </Badge>
              </Link>
            ))}

            {/* Restricted Future Features */}
            {restrictedFutureItems.map((item) => (
              <div
                key={item.feature}
                className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground opacity-50"
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                <Badge variant="outline" className="text-xs">
                  {item.tier}
                </Badge>
              </div>
            ))}

            <div className="pt-2 mt-3 border-t border-muted">
              <p className="text-xs text-muted-foreground mb-2">
                These features are in development and will be released in future updates.
              </p>
              {canUpgrade && nextTier && (
                <Button variant="outline" size="sm" className="w-full text-xs h-7">
                  Upgrade to {nextTier} for Early Access
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Current Status */}
      <div className="p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">MVP Status</span>
          <Badge variant="default" className="bg-blue-600">
            {permissions.subscriptionTier}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {accessibleMvpItems.length} of {MVP_ITEMS.length} core features available
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {FUTURE_ITEMS.length} features planned for future releases
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