'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  CheckCircle, 
  CreditCard, 
  Building2,
  ArrowRight,
  Sync,
  Eye,
  Home
} from 'lucide-react';

interface ConnectedAccount {
  id: string;
  iban: string;
  name: string;
  currency: string;
  account_type: string;
  balances: Array<{
    balanceAmount: { amount: string; currency: string };
    balanceType: string;
  }>;
  status: string;
}

export default function ConnectionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncInProgress, setSyncInProgress] = useState(false);

  const requisitionId = searchParams.get('requisitionId');
  const accountCount = searchParams.get('accounts');

  useEffect(() => {
    if (requisitionId) {
      loadConnectedAccounts();
    }
  }, [requisitionId]);

  const loadConnectedAccounts = async () => {
    try {
      setLoading(true);
      
      // In production, fetch the actual connected accounts
      // For now, simulate based on the callback success
      const mockAccounts: ConnectedAccount[] = [
        {
          id: `account_${Date.now()}_1`,
          iban: 'PT50000700000000000000001',
          name: 'Current Account',
          currency: 'EUR',
          account_type: 'CHECKING',
          balances: [
            {
              balanceAmount: { amount: '2547.83', currency: 'EUR' },
              balanceType: 'expected'
            }
          ],
          status: 'ready'
        },
        {
          id: `account_${Date.now()}_2`,
          iban: 'PT50000700000000000000002',
          name: 'Savings Account',
          currency: 'EUR',
          account_type: 'SAVINGS',
          balances: [
            {
              balanceAmount: { amount: '8234.67', currency: 'EUR' },
              balanceType: 'expected'
            }
          ],
          status: 'ready'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAccounts(mockAccounts);
    } catch (error) {
      console.error('Failed to load connected accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerFullSync = async () => {
    try {
      setSyncInProgress(true);
      
      // Trigger sync for all connected accounts
      await Promise.all(
        accounts.map(account => 
          fetch(`/api/sync/gocardless/accounts/${account.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              fullSync: true,
              syncTransactions: true,
              syncBalances: true 
            })
          })
        )
      );

      // Simulate sync time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'CHECKING':
      case 'CURRENT':
        return <CreditCard className="h-4 w-4" />;
      case 'SAVINGS':
        return <Building2 className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getAccountTypeName = (type: string) => {
    switch (type) {
      case 'CHECKING':
      case 'CURRENT':
        return 'Current Account';
      case 'SAVINGS':
        return 'Savings Account';
      case 'CREDIT_CARD':
        return 'Credit Card';
      default:
        return 'Bank Account';
    }
  };

  const formatBalance = (balances: ConnectedAccount['balances']) => {
    if (!balances || balances.length === 0) return 'N/A';
    const mainBalance = balances.find(b => b.balanceType === 'expected') || balances[0];
    return `${parseFloat(mainBalance.balanceAmount.amount).toLocaleString('pt-PT', {
      style: 'currency',
      currency: mainBalance.balanceAmount.currency
    })}`;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-green-900 mb-2">
          Bank Connection Successful!
        </h1>
        <p className="text-muted-foreground">
          Your bank accounts have been securely connected via GoCardless
        </p>
      </div>

      {/* Connection Summary */}
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Building2 className="h-5 w-5" />
            Connection Summary
          </CardTitle>
          <CardDescription>
            Successfully connected {accountCount || accounts.length} account(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {accountCount || accounts.length}
              </div>
              <div className="text-sm text-green-700">Accounts Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">90</div>
              <div className="text-sm text-green-700">Days History</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-green-700">Secure Connection</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Your bank accounts are now ready for automatic transaction sync
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
              <span className="ml-3">Loading account details...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div 
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getAccountTypeIcon(account.account_type)}
                    </div>
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {account.iban.replace(/(.{4})/g, '$1 ').trim()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatBalance(account.balances)}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {getAccountTypeName(account.account_type)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sync className="h-5 w-5" />
            Data Synchronization
          </CardTitle>
          <CardDescription>
            Start syncing your transaction history and account balances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Initial Sync</div>
              <div className="text-sm text-muted-foreground">
                Import the last 90 days of transactions
              </div>
            </div>
            <Button 
              onClick={triggerFullSync}
              disabled={loading || syncInProgress}
              className="min-w-32"
            >
              {syncInProgress ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Syncing...
                </>
              ) : (
                <>
                  <Sync className="h-4 w-4 mr-2" />
                  Start Sync
                </>
              )}
            </Button>
          </div>

          {syncInProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <LoadingSpinner size="sm" />
                <span className="font-medium text-blue-900">Sync in Progress</span>
              </div>
              <div className="text-sm text-blue-700">
                Importing transactions and balances. This may take a few minutes...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div>
                <div className="font-medium">View Your Dashboard</div>
                <div className="text-sm text-muted-foreground">
                  See your financial overview with spending insights
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <div>
                <div className="font-medium">Review Transactions</div>
                <div className="text-sm text-muted-foreground">
                  Check and categorize your imported transactions
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <div>
                <div className="font-medium">Chat with AI Assistant</div>
                <div className="text-sm text-muted-foreground">
                  Get personalized financial advice based on your data
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" onClick={() => router.push('/dashboard')}>
          <Home className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
        
        <Button variant="outline" size="lg" onClick={() => router.push('/transactions')}>
          <Eye className="h-4 w-4 mr-2" />
          View Transactions
        </Button>
        
        <Button variant="outline" size="lg" onClick={() => router.push('/ai-assistant')}>
          <ArrowRight className="h-4 w-4 mr-2" />
          Try AI Assistant
        </Button>
      </div>
    </div>
  );
}