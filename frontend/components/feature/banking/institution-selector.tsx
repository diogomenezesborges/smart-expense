'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Search, 
  MapPin, 
  Shield, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface Institution {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: string;
  countries: string[];
  logo?: string;
  supported_payments?: string[];
  supported_features?: string[];
}

interface InstitutionSelectorProps {
  onInstitutionSelect: (institution: Institution) => void;
  selectedCountry?: string;
  className?: string;
}

export function InstitutionSelector({ 
  onInstitutionSelect, 
  selectedCountry = 'PT', 
  className = '' 
}: InstitutionSelectorProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [country, setCountry] = useState(selectedCountry);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  useEffect(() => {
    loadInstitutions();
  }, [country]);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gocardless/institutions?country=${country}`);
      
      if (!response.ok) {
        throw new Error('Failed to load institutions');
      }

      const data = await response.json();
      setInstitutions(data.institutions || []);
    } catch (error) {
      console.error('Failed to load institutions:', error);
      // Mock data for development
      setInstitutions(getMockInstitutions());
    } finally {
      setLoading(false);
    }
  };

  const getMockInstitutions = (): Institution[] => [
    {
      id: 'MILLENNIUM_BCOMPTPL',
      name: 'Millennium BCP',
      bic: 'BCOMPTPL',
      transaction_total_days: '90',
      countries: ['PT'],
      supported_payments: ['SEPA', 'Domestic'],
      supported_features: ['account_details', 'balances', 'transactions']
    },
    {
      id: 'CAIXA_CGDIPTPL',
      name: 'Caixa Geral de Depósitos',
      bic: 'CGDIPTPL',
      transaction_total_days: '90',
      countries: ['PT'],
      supported_payments: ['SEPA', 'Domestic'],
      supported_features: ['account_details', 'balances', 'transactions']
    },
    {
      id: 'SANTANDER_BSCHPTPL',
      name: 'Banco Santander Totta',
      bic: 'BSCHPTPL',
      transaction_total_days: '90',
      countries: ['PT'],
      supported_payments: ['SEPA', 'Domestic'],
      supported_features: ['account_details', 'balances', 'transactions']
    },
    {
      id: 'NOVO_BANCO_BESCPTPL',
      name: 'Novo Banco',
      bic: 'BESCPTPL',
      transaction_total_days: '90',
      countries: ['PT'],
      supported_payments: ['SEPA', 'Domestic'],
      supported_features: ['account_details', 'balances', 'transactions']
    },
    {
      id: 'BPI_BBPIPTPL',
      name: 'Banco BPI',
      bic: 'BBPIPTPL',
      transaction_total_days: '90',
      countries: ['PT'],
      supported_payments: ['SEPA', 'Domestic'],
      supported_features: ['account_details', 'balances', 'transactions']
    },
    {
      id: 'ABANCA_CAGLESMM',
      name: 'ABANCA',
      bic: 'CAGLESMM',
      transaction_total_days: '90',
      countries: ['ES'],
      supported_payments: ['SEPA', 'Domestic'],
      supported_features: ['account_details', 'balances', 'transactions']
    }
  ];

  const filteredInstitutions = institutions.filter(institution =>
    institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.bic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInstitutionSelect = (institution: Institution) => {
    setSelectedInstitution(institution);
    onInstitutionSelect(institution);
  };

  const getCountryName = (code: string) => {
    const countries: Record<string, string> = {
      'PT': 'Portugal',
      'ES': 'Spain',
      'FR': 'France',
      'DE': 'Germany',
      'IT': 'Italy',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'AT': 'Austria'
    };
    return countries[code] || code;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          Select Your Bank
        </h2>
        <p className="text-muted-foreground">
          Choose your bank to securely connect your accounts via GoCardless Bank Account Data API
        </p>
      </div>

      {/* Security Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900 mb-1">Secure Connection</h3>
              <p className="text-sm text-green-700">
                Your banking credentials are never stored by our application. All connections are made directly 
                with your bank through GoCardless's secure, regulated infrastructure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search banks or BIC codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PT">🇵🇹 Portugal</SelectItem>
              <SelectItem value="ES">🇪🇸 Spain</SelectItem>
              <SelectItem value="FR">🇫🇷 France</SelectItem>
              <SelectItem value="DE">🇩🇪 Germany</SelectItem>
              <SelectItem value="IT">🇮🇹 Italy</SelectItem>
              <SelectItem value="NL">🇳🇱 Netherlands</SelectItem>
              <SelectItem value="BE">🇧🇪 Belgium</SelectItem>
              <SelectItem value="AT">🇦🇹 Austria</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Institution List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
          <span className="ml-3">Loading banks...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInstitutions.map((institution) => (
            <Card 
              key={institution.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedInstitution?.id === institution.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => handleInstitutionSelect(institution)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{institution.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {institution.countries.map(getCountryName).join(', ')}
                      </CardDescription>
                    </div>
                  </div>
                  {selectedInstitution?.id === institution.id && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">BIC:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">{institution.bic}</code>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transaction History:</span>
                  <span className="font-medium">{institution.transaction_total_days} days</span>
                </div>

                {institution.supported_features && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Supported Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {institution.supported_features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredInstitutions.length === 0 && !loading && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
            <h3 className="font-medium text-yellow-900 mb-2">No Banks Found</h3>
            <p className="text-sm text-yellow-700 mb-4">
              No banks match your search criteria. Try adjusting your search or selecting a different country.
            </p>
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">What happens next?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• You'll be redirected to your bank's secure login page</li>
                <li>• Authenticate using your normal online banking credentials</li>
                <li>• Grant permission to access your account data</li>
                <li>• Your accounts will be automatically synced</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      {selectedInstitution && (
        <div className="flex justify-center pt-4">
          <Button 
            size="lg" 
            className="px-8"
            onClick={() => onInstitutionSelect(selectedInstitution)}
          >
            Continue with {selectedInstitution.name}
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}