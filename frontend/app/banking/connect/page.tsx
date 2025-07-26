'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InstitutionSelector } from '@/components/feature/banking/institution-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  ArrowLeft,
  Shield,
  Zap,
  RefreshCw,
  Eye,
  Lock
} from 'lucide-react';

interface Institution {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: string;
  countries: string[];
}

export default function BankConnectPage() {
  const router = useRouter();
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm' | 'redirect'>('select');

  const handleInstitutionSelect = (institution: Institution) => {
    setSelectedInstitution(institution);
    setStep('confirm');
  };

  const handleConfirmConnection = async () => {
    if (!selectedInstitution) return;

    try {
      setConnecting(true);
      setStep('redirect');

      // Create requisition with GoCardless
      const response = await fetch('/api/gocardless/requisitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          institutionId: selectedInstitution.id,
          userId: 'current-user', // In production, get from auth context
          redirectUrl: `${window.location.origin}/api/gocardless/callback`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create bank connection');
      }

      const data = await response.json();
      
      if (data.success && data.requisition?.link) {
        // Redirect to bank's authentication page
        window.location.href = data.requisition.link;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnecting(false);
      setStep('confirm');
      
      // Show error to user
      router.push('/banking/connection-failed?error=processing_failed');
    }
  };

  const handleBackToSelection = () => {
    setSelectedInstitution(null);
    setStep('select');
  };

  if (step === 'redirect') {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold mb-2">Redirecting to Your Bank</h1>
            <p className="text-muted-foreground">
              You're being redirected to {selectedInstitution?.name} to complete the secure authentication.
            </p>
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <h3 className="font-medium text-blue-900 mb-1">What happens next?</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• You'll see your bank's official login page</li>
                    <li>• Login with your normal online banking credentials</li>
                    <li>• Grant permission to access your account data</li>
                    <li>• You'll be redirected back to complete the setup</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            If you're not redirected automatically, please check if popups are blocked.
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirm' && selectedInstitution) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBackToSelection}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bank Selection
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Confirm Bank Connection</h1>
          <p className="text-muted-foreground">
            Review the details before connecting to your bank
          </p>
        </div>

        {/* Selected Bank Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              {selectedInstitution.name}
            </CardTitle>
            <CardDescription>
              {selectedInstitution.bic} • {selectedInstitution.countries.join(', ')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  {selectedInstitution.transaction_total_days} days of transaction history
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Read-only access to your data</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What We'll Access */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">What we'll access</CardTitle>
            <CardDescription>
              We'll only access the following information from your bank
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Account Details</div>
                  <div className="text-sm text-muted-foreground">
                    Account names, types, and IBAN numbers
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Transaction History</div>
                  <div className="text-sm text-muted-foreground">
                    Past {selectedInstitution.transaction_total_days} days of transactions with descriptions and amounts
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">Account Balances</div>
                  <div className="text-sm text-muted-foreground">
                    Current and available balances for each account
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900 mb-1">Bank-Grade Security</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Your login credentials are never stored by our app</li>
                  <li>• All connections use GoCardless's regulated infrastructure</li>
                  <li>• Data is encrypted and transmitted securely</li>
                  <li>• You can revoke access at any time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleConfirmConnection}
            disabled={connecting}
            className="px-8"
          >
            {connecting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Connect to {selectedInstitution.name}
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-3">
            By connecting, you agree to share the specified account data with our application
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <InstitutionSelector onInstitutionSelect={handleInstitutionSelect} />
    </div>
  );
}