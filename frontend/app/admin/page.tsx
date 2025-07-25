'use client';

import { useState, useEffect } from 'react';
import { User, Feature, FeatureKey } from '@/lib/types/permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

interface AdminPageState {
  users: User[];
  features: Feature[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  changes: Record<string, Record<FeatureKey, boolean>>;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [state, setState] = useState<AdminPageState>({
    users: [],
    features: [],
    loading: true,
    saving: false,
    error: null,
    changes: {}
  });

  // Load users and features
  useEffect(() => {
    async function loadData() {
      try {
        const [usersResponse, featuresResponse] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/features')
        ]);

        if (!usersResponse.ok || !featuresResponse.ok) {
          throw new Error('Failed to load data');
        }

        const usersData = await usersResponse.json();
        const featuresData = await featuresResponse.json();

        setState(prev => ({
          ...prev,
          users: usersData.users,
          features: featuresData.features,
          loading: false
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to load admin data',
          loading: false
        }));
      }
    }

    loadData();
  }, []);

  // Check if user has access to a feature
  const hasFeatureAccess = (user: User, featureKey: FeatureKey): boolean => {
    // Check if there's a pending change
    if (state.changes[user.id]?.[featureKey] !== undefined) {
      return state.changes[user.id][featureKey];
    }

    // Check user's current access
    return user.accessibleFeatures?.includes(featureKey) || false;
  };

  // Handle permission change
  const handlePermissionChange = (userId: string, featureKey: FeatureKey, hasAccess: boolean) => {
    setState(prev => ({
      ...prev,
      changes: {
        ...prev.changes,
        [userId]: {
          ...prev.changes[userId],
          [featureKey]: hasAccess
        }
      }
    }));
  };

  // Save all changes
  const saveChanges = async () => {
    setState(prev => ({ ...prev, saving: true }));

    try {
      const updatePromises = Object.entries(state.changes).map(async ([userId, permissions]) => {
        const response = await fetch(`/api/admin/users/${userId}/permissions`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customPermissions: permissions,
            adminUserId: '1' // In real app, get from session
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update permissions for user ${userId}`);
        }

        return response.json();
      });

      await Promise.all(updatePromises);

      // Reload data to reflect changes
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();

      setState(prev => ({
        ...prev,
        users: usersData.users,
        changes: {},
        saving: false
      }));

      toast({
        title: 'Success',
        description: 'User permissions updated successfully',
      });
    } catch (error) {
      setState(prev => ({ ...prev, saving: false }));
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    }
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = Object.keys(state.changes).length > 0;

  if (state.loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Permissions</h1>
          <p className="text-muted-foreground">
            Manage user access to features and subscription tiers
          </p>
        </div>
        {hasUnsavedChanges && (
          <Button 
            onClick={saveChanges} 
            disabled={state.saving}
            className="min-w-[120px]"
          >
            {state.saving ? <LoadingSpinner size="sm" /> : 'Save Changes'}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Access Matrix</CardTitle>
          <CardDescription>
            Configure which features each user can access. Green indicates enabled, gray indicates disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium min-w-[200px] sticky left-0 bg-background">
                    User
                  </th>
                  {state.features.map((feature) => (
                    <th 
                      key={feature.key} 
                      className="text-center p-4 font-medium min-w-[120px]"
                      title={feature.description}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm">{feature.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {feature.requiredTier}
                        </Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 sticky left-0 bg-background">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {user.subscriptionTier}
                          </Badge>
                          {user.permissions.isAdmin && (
                            <Badge variant="destructive" className="text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    {state.features.map((feature) => {
                      const hasAccess = hasFeatureAccess(user, feature.key);
                      const isChanged = state.changes[user.id]?.[feature.key] !== undefined;
                      
                      return (
                        <td key={feature.key} className="p-4 text-center">
                          <RadioGroup
                            value={hasAccess ? 'enabled' : 'disabled'}
                            onValueChange={(value) => 
                              handlePermissionChange(user.id, feature.key, value === 'enabled')
                            }
                            className="flex items-center justify-center gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value="enabled" 
                                id={`${user.id}-${feature.key}-enabled`}
                                className={isChanged ? 'ring-2 ring-blue-500' : ''}
                              />
                              <Label 
                                htmlFor={`${user.id}-${feature.key}-enabled`}
                                className="text-green-600 font-medium"
                              >
                                ✓
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value="disabled" 
                                id={`${user.id}-${feature.key}-disabled`}
                                className={isChanged ? 'ring-2 ring-blue-500' : ''}
                              />
                              <Label 
                                htmlFor={`${user.id}-${feature.key}-disabled`}
                                className="text-gray-400 font-medium"
                              >
                                ✗
                              </Label>
                            </div>
                          </RadioGroup>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {hasUnsavedChanges && (
        <Alert>
          <AlertDescription>
            You have unsaved changes. Click "Save Changes" to apply them.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}