'use client';

import { useState, useEffect } from 'react';
import { FeatureGate } from '@/components/feature/permissions/feature-gate';
import { ChatInterface } from '@/components/feature/ai/chat-interface';
import { InsightCards } from '@/components/feature/ai/insight-cards';
import { RecommendationPanel } from '@/components/feature/ai/recommendation-panel';
import { FinancialContext, AIService } from '@/lib/services/ai-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Brain, 
  Target, 
  TrendingUp, 
  MessageSquare,
  Lightbulb,
  Activity,
  Settings
} from 'lucide-react';

export default function AIAssistantPage() {
  const [financialContext, setFinancialContext] = useState<FinancialContext | null>(null);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock user ID - in real app, get from auth context
  const userId = '1';

  useEffect(() => {
    loadFinancialContext();
    loadHealthScore();
  }, []);

  const loadFinancialContext = async () => {
    try {
      // In a real app, fetch actual financial data from API
      const mockContext: FinancialContext = {
        userId: userId,
        totalIncome: 8450.00,
        totalExpenses: 6320.75,
        categories: {
          'Food & Dining': 1420.50,
          'Transportation': 890.25,
          'Shopping': 756.80,
          'Bills & Utilities': 1250.00,
          'Entertainment': 445.60,
          'Healthcare': 325.90,
          'Other': 1231.70
        },
        goals: [
          {
            id: '1',
            name: 'Emergency Fund',
            target: 5000,
            current: 3900,
            deadline: new Date('2024-12-31')
          },
          {
            id: '2',
            name: 'Vacation Fund',
            target: 2500,
            current: 850,
            deadline: new Date('2024-08-15')
          }
        ],
        timeframe: '3months'
      };
      
      setFinancialContext(mockContext);
    } catch (error) {
      console.error('Failed to load financial context:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHealthScore = async () => {
    try {
      const report = await AIService.generateHealthReport(userId);
      setHealthScore(report.score);
    } catch (error) {
      console.error('Failed to load health score:', error);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreGrade = (score: number) => {
    if (score >= 9) return 'A+';
    if (score >= 8) return 'A';
    if (score >= 7) return 'B+';
    if (score >= 6) return 'B';
    if (score >= 5) return 'C+';
    if (score >= 4) return 'C';
    return 'D';
  };

  if (loading || !financialContext) {
    return (
      <FeatureGate feature="ai_assistant">
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </FeatureGate>
    );
  }

  return (
    <FeatureGate feature="ai_assistant">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Bot className="h-8 w-8 text-purple-600" />
              AI Financial Assistant
            </h1>
            <p className="text-muted-foreground">
              Get personalized insights, recommendations, and financial coaching powered by AI
            </p>
          </div>
          <div className="flex items-center gap-4">
            {healthScore && (
              <Card className="p-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore)}`}>
                    {healthScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Financial Health Score
                  </div>
                  <Badge variant="outline" className="mt-1">
                    Grade {getHealthScoreGrade(healthScore)}
                  </Badge>
                </div>
              </Card>
            )}
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              AI Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div className="text-sm font-medium">Monthly Savings</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                €{(financialContext.totalIncome - financialContext.totalExpenses).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round(((financialContext.totalIncome - financialContext.totalExpenses) / financialContext.totalIncome) * 100)}% savings rate
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <div className="text-sm font-medium">Goals Progress</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {financialContext.goals.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Active financial goals
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <div className="text-sm font-medium">AI Insights</div>
              </div>
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-xs text-muted-foreground">
                Generated this month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-600" />
                <div className="text-sm font-medium">Optimization</div>
              </div>
              <div className="text-2xl font-bold text-orange-600">€245</div>
              <div className="text-xs text-muted-foreground">
                Potential monthly savings
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat Assistant
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChatInterface 
                  userId={userId}
                  financialContext={financialContext}
                />
              </div>
              <div>
                <InsightCards 
                  userId={userId}
                  limit={3}
                  showActions={false}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <InsightCards 
              userId={userId}
              limit={10}
              showActions={true}
            />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <RecommendationPanel 
              financialContext={financialContext}
              onRecommendationAction={(rec, action) => {
                console.log(`${action} recommendation:`, rec.title);
              }}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Financial Health Report</CardTitle>
                <CardDescription>
                  AI-generated comprehensive analysis of your financial status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Detailed Reports Coming Soon
                    </h3>
                    <p className="text-gray-600">
                      We're working on comprehensive AI-powered financial health reports 
                      with personalized recommendations and trend analysis.
                    </p>
                    <Button className="mt-4" variant="outline">
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Preview Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FeatureGate>
  );
}