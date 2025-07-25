import { FeatureKey } from '@/lib/types/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { Badge } from '@/components/ui/badge';
import { Lock, Check } from 'lucide-react';

interface PermissionBadgeProps {
  feature: FeatureKey;
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
}

export function PermissionBadge({ 
  feature, 
  showIcon = true, 
  variant = 'outline' 
}: PermissionBadgeProps) {
  const { hasFeatureAccess } = usePermissions();
  const hasAccess = hasFeatureAccess(feature);

  return (
    <Badge 
      variant={hasAccess ? 'default' : 'secondary'} 
      className={hasAccess ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
    >
      {showIcon && (
        hasAccess ? (
          <Check className="mr-1 h-3 w-3" />
        ) : (
          <Lock className="mr-1 h-3 w-3" />
        )
      )}
      {hasAccess ? 'Enabled' : 'Disabled'}
    </Badge>
  );
}