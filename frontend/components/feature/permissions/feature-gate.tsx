import { ReactNode } from 'react';
import { FeatureKey } from '@/lib/types/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap } from 'lucide-react';

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  showUpgrade = true 
}: FeatureGateProps) {
  const { hasFeatureAccess, permissions, canUpgrade, nextTier } = usePermissions();

  if (hasFeatureAccess(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  // Default upgrade prompt
  return (
    <Card className="border-dashed border-2">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          Feature Locked
          <Badge variant="outline">
            {getFeatureDisplayName(feature)}
          </Badge>
        </CardTitle>
        <CardDescription>
          This feature requires a {getRequiredTier(feature)} subscription or higher.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="text-sm text-muted-foreground">
          Current Plan: <Badge variant="secondary">{permissions?.subscriptionTier}</Badge>
        </div>
        {canUpgrade && nextTier && (
          <Button className="w-full" variant="default">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to {nextTier}
          </Button>
        )}
        {!canUpgrade && (
          <div className="text-sm text-muted-foreground">
            Contact admin for access
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getFeatureDisplayName(feature: FeatureKey): string {
  const displayNames: Record<FeatureKey, string> = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    analytics: 'Analytics',
    budgeting: 'Budgeting',
    goals: 'Goals',
    ai_assistant: 'AI Assistant',
    export: 'Export',
    bulk_upload: 'Bulk Upload',
    community: 'Community',
    notifications: 'Notifications',
    subscriptions: 'Subscriptions',
    advanced_charts: 'Advanced Charts'
  };
  return displayNames[feature] || feature;
}

function getRequiredTier(feature: FeatureKey): string {
  const tierMap: Record<FeatureKey, string> = {
    dashboard: 'Free',
    transactions: 'Free',
    budgeting: 'Basic',
    export: 'Basic',
    analytics: 'Premium',
    goals: 'Premium',
    ai_assistant: 'Premium',
    bulk_upload: 'Premium',
    advanced_charts: 'Pro',
    community: 'Pro',
    notifications: 'Pro',
    subscriptions: 'Pro'
  };
  return tierMap[feature] || 'Premium';
}