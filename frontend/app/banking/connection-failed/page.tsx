'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  RefreshCw, 
  Home, 
  HelpCircle,
  ShieldAlert,
  Clock,
  XCircle
} from 'lucide-react';

export default function ConnectionFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const error = searchParams.get('error');
  const requisitionId = searchParams.get('requisitionId');

  const getErrorDetails = (errorCode: string | null) => {
    switch (errorCode) {
      case 'user_cancelled':
        return {
          title: 'Connection Cancelled',
          description: 'You cancelled the bank connection process.',
          icon: <XCircle className="h-8 w-8 text-orange-600" />,
          color: 'orange',
          canRetry: true,
          suggestions: [
            'Try connecting again when you\'re ready',
            'Make sure you have your online banking credentials available',
            'The connection process is completely secure via GoCardless'
          ]
        };
      
      case 'authentication_failed':
        return {
          title: 'Authentication Failed',
          description: 'Unable to authenticate with your bank.',
          icon: <ShieldAlert className="h-8 w-8 text-red-600" />,
          color: 'red',
          canRetry: true,
          suggestions: [
            'Double-check your online banking username and password',
            'Make sure your bank account is not locked or suspended',
            'Some banks require additional verification steps',
            'Try again in a few minutes if you entered incorrect credentials'
          ]
        };
      
      case 'bank_unavailable':
        return {
          title: 'Bank Service Unavailable',
          description: 'Your bank\'s systems are currently unavailable.',
          icon: <Clock className="h-8 w-8 text-yellow-600" />,
          color: 'yellow',
          canRetry: true,
          suggestions: [
            'This is usually temporary - try again in a few minutes',
            'Check if your bank is undergoing maintenance',
            'Peak usage times may cause temporary unavailability',
            'Your bank\'s mobile app may have similar issues right now'
          ]
        };
      
      case 'connection_timeout':
        return {
          title: 'Connection Timeout',
          description: 'The connection to your bank timed out.',
          icon: <Clock className="h-8 w-8 text-yellow-600" />,
          color: 'yellow',
          canRetry: true,
          suggestions: [
            'This often happens during peak banking hours',
            'Try again with a stable internet connection',
            'Make sure you complete the process within the time limit',
            'Clear your browser cache and cookies'
          ]
        };
      
      case 'missing_reference':
      case 'processing_failed':
        return {
          title: 'Connection Processing Failed',
          description: 'There was a technical issue processing your connection.',
          icon: <AlertCircle className="h-8 w-8 text-red-600" />,
          color: 'red',
          canRetry: true,
          suggestions: [
            'This is likely a temporary technical issue',
            'Try connecting again in a few minutes',
            'If the problem persists, please contact support',
            'Your banking credentials were not stored or compromised'
          ]
        };
      
      default:
        return {
          title: 'Connection Failed',
          description: 'Unable to connect to your bank account.',
          icon: <AlertCircle className="h-8 w-8 text-red-600" />,
          color: 'red',
          canRetry: true,
          suggestions: [
            'Try the connection process again',
            'Make sure you have a stable internet connection',
            'Check that your bank supports Open Banking connections',
            'Contact support if the issue persists'
          ]
        };
    }
  };

  const errorDetails = getErrorDetails(error);

  const handleRetryConnection = () => {
    router.push('/banking/connect');
  };

  const handleContactSupport = () => {
    // In production, this would open a support chat or redirect to help
    window.open('mailto:support@yourapp.com?subject=Bank Connection Issue&body=Error: ' + error, '_blank');
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Error Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 bg-${errorDetails.color}-100 rounded-full flex items-center justify-center`}>
            {errorDetails.icon}
          </div>
        </div>
        <h1 className={`text-3xl font-bold text-${errorDetails.color}-900 mb-2`}>
          {errorDetails.title}
        </h1>
        <p className="text-muted-foreground">
          {errorDetails.description}
        </p>
      </div>

      {/* Error Details */}
      <Card className={`mb-6 border-${errorDetails.color}-200 bg-${errorDetails.color}-50`}>
        <CardHeader>
          <CardTitle className={`text-${errorDetails.color}-900 flex items-center gap-2`}>
            <HelpCircle className="h-5 w-5" />
            What went wrong?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className={`space-y-2 text-sm text-${errorDetails.color}-700`}>
            {errorDetails.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-xs mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Technical Details */}
      {(error || requisitionId) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {error && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Error Code:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {error}
                </Badge>
              </div>
            )}
            {requisitionId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reference ID:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {requisitionId}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Time:</span>
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Your Data is Safe</h3>
              <p className="text-sm text-blue-700">
                No banking credentials were stored during this failed connection attempt. 
                All connections are processed securely through GoCardless's regulated infrastructure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {errorDetails.canRetry && (
          <Button size="lg" onClick={handleRetryConnection}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        
        <Button variant="outline" size="lg" onClick={() => router.push('/dashboard')}>
          <Home className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
        
        <Button variant="outline" size="lg" onClick={handleContactSupport}>
          <HelpCircle className="h-4 w-4 mr-2" />
          Contact Support
        </Button>
      </div>

      {/* Common Issues */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Common Issues & Solutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">Browser Issues</h4>
              <p className="text-sm text-muted-foreground">
                Try using a different browser or clearing your cache and cookies.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium">Bank Maintenance</h4>
              <p className="text-sm text-muted-foreground">
                Banks often perform maintenance during nights and weekends.
              </p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-medium">Additional Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Some banks require SMS codes or mobile app confirmation.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium">Account Access</h4>
              <p className="text-sm text-muted-foreground">
                Make sure your online banking account is active and not locked.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}