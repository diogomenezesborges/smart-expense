'use client';

import { useState } from 'react';
import { SubscriptionTier, SUBSCRIPTION_TIERS, TIER_FEATURES, FEATURES } from '@/lib/types/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';

interface TierUpgradeProps {
  currentTier?: SubscriptionTier;
  onUpgrade?: (tier: SubscriptionTier) => void;
  showComparison?: boolean;
}

export function TierManagement({ 
  currentTier, 
  onUpgrade,
  showComparison = true 
}: TierUpgradeProps) {
  const { permissions, canUpgrade, nextTier } = usePermissions();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

  const userTier = currentTier || permissions?.subscriptionTier || 'free';

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free': return null;
      case 'basic': return <Star className="h-5 w-5 text-blue-600" />;
      case 'premium': return <Crown className="h-5 w-5 text-purple-600" />;
      case 'pro': return <Zap className="h-5 w-5 text-orange-600" />;
    }
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free': return 'border-gray-200';
      case 'basic': return 'border-blue-200';
      case 'premium': return 'border-purple-200';
      case 'pro': return 'border-orange-200';
    }
  };

  const getFeaturesByTier = (tier: SubscriptionTier) => {
    return TIER_FEATURES[tier].map(featureKey => 
      FEATURES.find(f => f.key === featureKey)
    ).filter(Boolean);
  };

  const tiers: SubscriptionTier[] = ['free', 'basic', 'premium', 'pro'];

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTierIcon(userTier)}
            Current Plan: {SUBSCRIPTION_TIERS[userTier].name}
          </CardTitle>
          <CardDescription>
            You have access to {TIER_FEATURES[userTier].length} features
            {permissions?.isAdmin && " (plus admin privileges)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                €{SUBSCRIPTION_TIERS[userTier].price}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {SUBSCRIPTION_TIERS[userTier].description}
              </p>
            </div>
            {canUpgrade && nextTier && (
              <Button 
                variant="outline" 
                onClick={() => setSelectedTier(nextTier as SubscriptionTier)}
              >
                Upgrade to {nextTier}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tier Comparison */}
      {showComparison && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const tierInfo = SUBSCRIPTION_TIERS[tier];
            const tierFeatures = getFeaturesByTier(tier);
            const isCurrent = tier === userTier;
            const isUpgrade = tiers.indexOf(tier) > tiers.indexOf(userTier);
            
            return (
              <Card 
                key={tier}
                className={`relative ${getTierColor(tier)} ${
                  isCurrent ? 'ring-2 ring-blue-500' : ''
                } ${selectedTier === tier ? 'ring-2 ring-purple-500' : ''}`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="default">Current Plan</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getTierIcon(tier)}
                    <CardTitle className="text-xl">{tierInfo.name}</CardTitle>
                  </div>
                  <div className="text-3xl font-bold">
                    €{tierInfo.price}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>{tierInfo.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Features included:</h4>
                    <ul className="space-y-1">
                      {tierFeatures.map((feature) => (
                        <li key={feature?.key} className="flex items-center gap-2 text-sm">
                          <Check className="h-3 w-3 text-green-600" />
                          <span>{feature?.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4">
                    {isCurrent ? (
                      <Button variant="outline" disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : isUpgrade ? (
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedTier(tier);
                          onUpgrade?.(tier);
                        }}
                      >
                        Upgrade to {tierInfo.name}
                      </Button>
                    ) : (
                      <Button variant="ghost" disabled className="w-full">
                        Downgrade
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upgrade Confirmation */}
      {selectedTier && selectedTier !== userTier && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-900">
              Upgrade to {SUBSCRIPTION_TIERS[selectedTier].name}?
            </CardTitle>
            <CardDescription className="text-purple-700">
              You'll get access to {TIER_FEATURES[selectedTier].length - TIER_FEATURES[userTier].length} additional features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-purple-900">
                  €{SUBSCRIPTION_TIERS[selectedTier].price}/month
                </div>
                <p className="text-sm text-purple-700">
                  Billed monthly, cancel anytime
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTier(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Handle upgrade logic
                    onUpgrade?.(selectedTier);
                    setSelectedTier(null);
                  }}
                >
                  Confirm Upgrade
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}