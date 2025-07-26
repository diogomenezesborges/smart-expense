'use client';

import { useState, useEffect } from 'react';
import { FeatureKey, UserPermissions } from '@/lib/types/permissions';
import { PermissionsService } from '@/lib/services/permissions-service';

interface UsePermissionsResult {
  permissions: UserPermissions | null;
  loading: boolean;
  error: string | null;
  hasFeatureAccess: (feature: FeatureKey) => boolean;
  canUpgrade: boolean;
  nextTier: string | null;
  isExpired: boolean;
  accessibleFeatures: FeatureKey[];
}

export function usePermissions(userId?: string): UsePermissionsResult {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In a real app, get current user ID from session/context
  const currentUserId = userId || '1'; // Default to Diogo for demo

  useEffect(() => {
    async function loadPermissions() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${currentUserId}/permissions`);
        
        if (!response.ok) {
          throw new Error('Failed to load permissions');
        }

        const data = await response.json();
        setPermissions(data.permissions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load permissions');
        setPermissions(null);
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, [currentUserId]);

  const hasFeatureAccess = (feature: FeatureKey): boolean => {
    if (!permissions) return false;
    return PermissionsService.hasFeatureAccess(permissions, feature);
  };

  const accessibleFeatures = permissions 
    ? PermissionsService.getAccessibleFeatures(permissions)
    : [];

  const canUpgrade = permissions 
    ? PermissionsService.canUpgrade(permissions.subscriptionTier)
    : false;

  const nextTier = permissions 
    ? PermissionsService.getNextTier(permissions.subscriptionTier)
    : null;

  const isExpired = permissions 
    ? PermissionsService.isSubscriptionExpired(permissions)
    : false;

  return {
    permissions,
    loading,
    error,
    hasFeatureAccess,
    canUpgrade,
    nextTier,
    isExpired,
    accessibleFeatures,
  };
}