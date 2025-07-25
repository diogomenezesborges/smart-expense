'use client';

import { FeatureGate } from '@/components/feature/permissions/feature-gate';
import { TierManagement } from '@/components/feature/subscription/tier-management';
import { usePermissions } from '@/hooks/use-permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CreditCard, Settings, History } from 'lucide-react';

export default function SubscriptionsPage() {
  const { permissions } = usePermissions();

  const handleUpgrade = (tier: string) => {
    // In a real app, integrate with payment processor
    console.log('Upgrading to:', tier);
    // Redirect to payment flow or show payment modal
  };

  return (
    <FeatureGate feature="subscriptions">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
            <p className="text-muted-foreground">
              Manage your plan, billing, and feature access
            </p>
          </div>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Button>
        </div>

        {/* Billing Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Next billing date</span>
                  <span className="text-sm font-medium">Feb 15, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment method</span>
                  <span className="text-sm font-medium">•••• 4242</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-sm font-medium">
                    €{permissions?.subscriptionTier ? 
                      ({ free: 0, basic: 9.99, premium: 19.99, pro: 29.99 })[permissions.subscriptionTier] 
                      : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">API calls this month</span>
                  <span className="text-sm font-medium">2,847 / 10,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Storage used</span>
                  <span className="text-sm font-medium">1.2 GB / 5 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Export downloads</span>
                  <span className="text-sm font-medium">15 / 50</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Active</Badge>
                  <span className="text-sm">Account in good standing</span>
                </div>
                {permissions?.isAdmin && (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Admin</Badge>
                    <span className="text-sm">Administrator privileges</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Member since Jan 1, 2024
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tier Management */}
        <TierManagement onUpgrade={handleUpgrade} />

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              Your recent transactions and invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: 'Jan 15, 2024', amount: 19.99, status: 'Paid', invoice: 'INV-001' },
                { date: 'Dec 15, 2023', amount: 19.99, status: 'Paid', invoice: 'INV-002' },
                { date: 'Nov 15, 2023', amount: 9.99, status: 'Paid', invoice: 'INV-003' },
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <div className="font-medium">{transaction.invoice}</div>
                    <div className="text-sm text-muted-foreground">{transaction.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">€{transaction.amount}</div>
                    <Badge variant={transaction.status === 'Paid' ? 'default' : 'outline'}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureGate>
  );
}