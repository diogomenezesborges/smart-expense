'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Bot, 
  Send, 
  TestTube, 
  AlertCircle,
  CheckCircle,
  Eye,
  RefreshCw
} from 'lucide-react';

interface TestResult {
  success: boolean;
  hasKey: boolean;
  keyPreview: string;
  geminiResponse?: any;
  error?: string;
  warning?: string;
}

export default function TestAIPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [queryResponse, setQueryResponse] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  const runGeminiTest = async () => {
    try {
      setLoading(true);
      setTestResult(null);
      
      const response = await fetch('/api/test/gemini');
      const data = await response.json();
      
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        hasKey: false,
        keyPreview: 'Error',
        error: error.message || 'Test failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const testCustomQuery = async () => {
    if (!customQuery.trim()) return;
    
    try {
      setQueryLoading(true);
      setQueryResponse(null);
      
      // Mock financial context for testing
      const mockContext = {
        userId: 'test-user',
        totalIncome: 3500,
        totalExpenses: 2800,
        categories: {
          'Food & Dining': 520,
          'Transportation': 180,
          'Shopping': 340,
          'Bills & Utilities': 950,
          'Entertainment': 200,
          'Healthcare': 150,
          'Groceries': 460
        },
        goals: [
          {
            id: '1',
            name: 'Emergency Fund',
            target: 5000,
            current: 3200,
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          }
        ],
        timeframe: '1month' as const
      };
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: customQuery,
          context: mockContext,
          timestamp: new Date().toISOString()
        }),
      });
      
      const data = await response.json();
      setQueryResponse(data);
    } catch (error) {
      setQueryResponse({
        success: false,
        error: error.message || 'Query failed'
      });
    } finally {
      setQueryLoading(false);
    }
  };

  const sampleQueries = [
    "What's my spending summary?",
    "How can I reduce my food expenses?",
    "Am I saving enough money?",
    "What's my biggest expense category?",
    "Give me advice on my emergency fund goal",
    "How does my transportation spending compare to recommendations?",
    "Should I increase my savings rate?",
    "What patterns do you see in my spending?"
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <TestTube className="h-8 w-8 text-blue-600" />
          Gemini AI Test Page
        </h1>
        <p className="text-muted-foreground">
          Test the Gemini AI integration and see if it's working properly
        </p>
      </div>

      {/* API Key & Connection Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Connection Test
          </CardTitle>
          <CardDescription>
            Test if Gemini AI is properly configured and working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runGeminiTest} disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Run Connection Test
              </>
            )}
          </Button>

          {testResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">API Key Status:</span>
                  <Badge variant={testResult.hasKey ? 'default' : 'destructive'} className="ml-2">
                    {testResult.hasKey ? 'Found' : 'Missing'}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Key Preview:</span>
                  <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                    {testResult.keyPreview}
                  </code>
                </div>
              </div>

              {testResult.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm font-medium text-red-900 mb-1">Error:</div>
                  <div className="text-sm text-red-700">{testResult.error}</div>
                </div>
              )}

              {testResult.geminiResponse && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-900 mb-2">Gemini Response:</div>
                  <div className="text-sm text-green-700 space-y-1">
                    <div><strong>Message:</strong> {testResult.geminiResponse.message}</div>
                    <div><strong>Type:</strong> {testResult.geminiResponse.type}</div>
                    <div><strong>Confidence:</strong> {testResult.geminiResponse.confidence}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Query Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Custom Query Test
          </CardTitle>
          <CardDescription>
            Test custom queries with mock financial data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Question:</label>
            <Textarea
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Ask any financial question..."
              className="min-h-[80px]"
            />
          </div>

          <Button onClick={testCustomQuery} disabled={queryLoading || !customQuery.trim()}>
            {queryLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Query
              </>
            )}
          </Button>

          {queryResponse && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {queryResponse.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {queryResponse.success ? 'Query Successful' : 'Query Failed'}
                </span>
                {queryResponse.warning && (
                  <Badge variant="outline" className="text-yellow-700">
                    Using Fallback
                  </Badge>
                )}
              </div>

              {queryResponse.success && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 mb-2">AI Response:</div>
                  <div className="text-sm text-blue-800 whitespace-pre-wrap">
                    {queryResponse.message}
                  </div>
                  
                  {queryResponse.followUpQuestions && queryResponse.followUpQuestions.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-blue-900 mb-1">Follow-up Questions:</div>
                      <div className="space-y-1">
                        {queryResponse.followUpQuestions.map((q: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => setCustomQuery(q)}
                            className="block text-xs text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            • {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {queryResponse.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm font-medium text-red-900 mb-1">Error:</div>
                  <div className="text-sm text-red-700">{queryResponse.error}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Sample Queries
          </CardTitle>
          <CardDescription>
            Try these sample financial questions to test the AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sampleQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => setCustomQuery(query)}
                className="text-left p-3 text-sm border rounded-lg hover:bg-muted transition-colors"
              >
                "{query}"
              </button>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm font-medium text-yellow-900 mb-1">Mock Data Used:</div>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>• Income: €3,500 | Expenses: €2,800 | Savings Rate: 20%</div>
              <div>• Top categories: Bills (€950), Food (€520), Groceries (€460)</div>
              <div>• Emergency Fund Goal: €3,200 / €5,000 (64% complete)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}