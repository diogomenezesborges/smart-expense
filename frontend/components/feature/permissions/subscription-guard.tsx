import { ReactNode } from 'react';
import { SubscriptionTier } from '@/lib/types/permissions';
import { usePermissions } from '@/hooks/use-permissions';

interface SubscriptionGuardProps {
  requiredTier: SubscriptionTier;
  children: ReactNode;
  fallback?: ReactNode;
}

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  basic: 1,
  premium: 2,
  pro: 3
};

export function SubscriptionGuard({ 
  requiredTier, 
  children, 
  fallback = null 
}: SubscriptionGuardProps) {
  const { permissions } = usePermissions();

  if (!permissions) {
    return <>{fallback}</>;
  }

  const userTierLevel = TIER_HIERARCHY[permissions.subscriptionTier];
  const requiredTierLevel = TIER_HIERARCHY[requiredTier];

  if (permissions.isAdmin || userTierLevel >= requiredTierLevel) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}