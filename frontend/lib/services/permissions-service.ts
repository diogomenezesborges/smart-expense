import { FeatureKey, SubscriptionTier, UserPermissions, TIER_FEATURES, FEATURES } from '@/lib/types/permissions';

export class PermissionsService {
  /**
   * Check if user has access to a specific feature
   */
  static hasFeatureAccess(userPermissions: UserPermissions, feature: FeatureKey): boolean {
    // Admin users have access to everything
    if (userPermissions.isAdmin) {
      return true;
    }

    // Check custom permissions first (overrides)
    if (userPermissions.customPermissions && userPermissions.customPermissions[feature] !== undefined) {
      return userPermissions.customPermissions[feature]!;
    }

    // Check if subscription has expired
    if (userPermissions.expiresAt && userPermissions.expiresAt < new Date()) {
      // Expired users only get free tier access
      return TIER_FEATURES.free.includes(feature);
    }

    // Check tier-based permissions
    return TIER_FEATURES[userPermissions.subscriptionTier].includes(feature);
  }

  /**
   * Get all features accessible to user
   */
  static getAccessibleFeatures(userPermissions: UserPermissions): FeatureKey[] {
    if (userPermissions.isAdmin) {
      return FEATURES.map(f => f.key);
    }

    const tierFeatures = userPermissions.expiresAt && userPermissions.expiresAt < new Date()
      ? TIER_FEATURES.free
      : TIER_FEATURES[userPermissions.subscriptionTier];

    // Apply custom permission overrides
    if (userPermissions.customPermissions) {
      const result = [...tierFeatures];
      
      Object.entries(userPermissions.customPermissions).forEach(([feature, hasAccess]) => {
        const featureKey = feature as FeatureKey;
        if (hasAccess && !result.includes(featureKey)) {
          result.push(featureKey);
        } else if (!hasAccess && result.includes(featureKey)) {
          const index = result.indexOf(featureKey);
          if (index > -1) result.splice(index, 1);
        }
      });
      
      return result;
    }

    return tierFeatures;
  }

  /**
   * Check if user can upgrade to a higher tier
   */
  static canUpgrade(currentTier: SubscriptionTier): boolean {
    const tiers: SubscriptionTier[] = ['free', 'basic', 'premium', 'pro'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1;
  }

  /**
   * Get next available tier for upgrade
   */
  static getNextTier(currentTier: SubscriptionTier): SubscriptionTier | null {
    const tiers: SubscriptionTier[] = ['free', 'basic', 'premium', 'pro'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  }

  /**
   * Get features that would be unlocked with tier upgrade
   */
  static getUpgradeFeatures(currentTier: SubscriptionTier, targetTier: SubscriptionTier): FeatureKey[] {
    const currentFeatures = TIER_FEATURES[currentTier];
    const targetFeatures = TIER_FEATURES[targetTier];
    
    return targetFeatures.filter(feature => !currentFeatures.includes(feature));
  }

  /**
   * Check if subscription is expired
   */
  static isSubscriptionExpired(userPermissions: UserPermissions): boolean {
    return !!(userPermissions.expiresAt && userPermissions.expiresAt < new Date());
  }

  /**
   * Get feature details by key
   */
  static getFeatureDetails(featureKey: FeatureKey) {
    return FEATURES.find(f => f.key === featureKey);
  }

  /**
   * Validate permission update request
   */
  static validatePermissionUpdate(
    targetUserId: string,
    adminUserId: string,
    adminPermissions: UserPermissions,
    newPermissions: Partial<UserPermissions>
  ): { valid: boolean; error?: string } {
    // Only admins can update permissions
    if (!adminPermissions.isAdmin) {
      return { valid: false, error: 'Only administrators can update user permissions' };
    }

    // Admins cannot remove their own admin status (prevent lockout)
    if (targetUserId === adminUserId && newPermissions.isAdmin === false) {
      return { valid: false, error: 'Cannot remove your own administrator privileges' };
    }

    // Validate subscription tier
    if (newPermissions.subscriptionTier) {
      const validTiers: SubscriptionTier[] = ['free', 'basic', 'premium', 'pro'];
      if (!validTiers.includes(newPermissions.subscriptionTier)) {
        return { valid: false, error: 'Invalid subscription tier' };
      }
    }

    // Validate custom permissions
    if (newPermissions.customPermissions) {
      const validFeatures = FEATURES.map(f => f.key);
      for (const feature of Object.keys(newPermissions.customPermissions)) {
        if (!validFeatures.includes(feature as FeatureKey)) {
          return { valid: false, error: `Invalid feature: ${feature}` };
        }
      }
    }

    return { valid: true };
  }
}