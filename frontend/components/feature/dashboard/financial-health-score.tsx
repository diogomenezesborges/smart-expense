'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Target, 
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { FinancialMetrics, dashboardInsightsService } from '@/lib/services/dashboard-insights-service';

interface HealthScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  icon: React.ReactNode;
}

interface FinancialHealthScoreProps {
  className?: string;
}

export function FinancialHealthScore({ className }: FinancialHealthScoreProps) {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHealthMetrics() {
      try {
        // Mock financial context - in real app would fetch from API
        const mockContext = {
          userId: 'current-user',
          totalIncome: 3500,
          totalExpenses: 2650,
          categories: {
            'Bills & Utilities': 950,
            'Food & Dining': 520,
            'Groceries': 460,
            'Shopping': 340,
            'Entertainment': 200,
            'Transportation': 180
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

        const calculatedMetrics = dashboardInsightsService.calculateFinancialMetrics(mockContext);
        setMetrics(calculatedMetrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadHealthMetrics();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            Financial Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner text="Calculating health score..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Financial Health Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  const getHealthStatus = (score: number): { label: string; color: string; bgColor: string } => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-700', bgColor: 'bg-green-100' };
    if (score >= 70) return { label: 'Good', color: 'text-blue-700', bgColor: 'bg-blue-100' };
    if (score >= 50) return { label: 'Fair', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    return { label: 'Needs Improvement', color: 'text-red-700', bgColor: 'bg-red-100' };
  };

  const healthStatus = getHealthStatus(metrics.financialHealthScore);

  const healthBreakdown: HealthScoreBreakdown[] = [
    {
      category: 'Savings Rate',
      score: Math.min(metrics.savingsRate * 1.5, 30),
      maxScore: 30,
      status: metrics.savingsRate >= 20 ? 'excellent' : metrics.savingsRate >= 15 ? 'good' : metrics.savingsRate >= 10 ? 'fair' : 'poor',
      description: `${metrics.savingsRate.toFixed(1)}% of income saved monthly`,
      icon: <Target className="h-4 w-4" />
    },
    {
      category: 'Budget Control',
      score: Math.min(metrics.budgetAdherence * 0.25, 25),
      maxScore: 25,
      status: metrics.budgetAdherence >= 90 ? 'excellent' : metrics.budgetAdherence >= 80 ? 'good' : metrics.budgetAdherence >= 70 ? 'fair' : 'poor',
      description: `${metrics.budgetAdherence.toFixed(1)}% budget adherence`,
      icon: <Activity className="h-4 w-4" />
    },
    {
      category: 'Emergency Fund',
      score: Math.min(metrics.emergencyFundMonths * 5, 25),
      maxScore: 25,
      status: metrics.emergencyFundMonths >= 6 ? 'excellent' : metrics.emergencyFundMonths >= 3 ? 'good' : metrics.emergencyFundMonths >= 1 ? 'fair' : 'poor',
      description: `${metrics.emergencyFundMonths.toFixed(1)} months of expenses covered`,
      icon: <Shield className="h-4 w-4" />
    },
    {
      category: 'Cash Flow Trend',
      score: metrics.cashFlowTrend === 'improving' ? 20 : metrics.cashFlowTrend === 'stable' ? 15 : 5,
      maxScore: 20,
      status: metrics.cashFlowTrend === 'improving' ? 'excellent' : metrics.cashFlowTrend === 'stable' ? 'good' : 'poor',
      description: `Cash flow is ${metrics.cashFlowTrend}`,
      icon: metrics.cashFlowTrend === 'improving' ? <TrendingUp className="h-4 w-4" /> : 
           metrics.cashFlowTrend === 'declining' ? <TrendingDown className="h-4 w-4" /> : <Activity className="h-4 w-4" />
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'fair': return <Info className="h-4 w-4 text-yellow-600" />;
      case 'poor': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-700 bg-green-50 border-green-200';
      case 'good': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'fair': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // Top expense categories for quick overview
  const topCategories = Object.entries(metrics.expenseRatio)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            Financial Health Score
          </CardTitle>
          <Badge className={`${healthStatus.bgColor} ${healthStatus.color}`}>
            {healthStatus.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Score Circle */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{Math.round(metrics.financialHealthScore)}</div>
                  <div className="text-sm text-muted-foreground">/ 100</div>
                </div>
              </div>
              <div 
                className="absolute top-0 left-0 w-32 h-32 rounded-full border-8 border-transparent"
                style={{
                  background: `conic-gradient(hsl(var(--primary)) ${metrics.financialHealthScore * 3.6}deg, transparent 0deg)`,
                  clipPath: 'circle(50% at 50% 50%)',
                  mask: 'radial-gradient(circle at center, transparent 60%, black 60%)'
                }}
              />
            </div>
          </div>

          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="recommendations">Tips</TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown" className="mt-4 space-y-4">
              {healthBreakdown.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <span className="font-medium text-sm">{item.category}</span>
                      {getStatusIcon(item.status)}
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(item.score)}/{item.maxScore}
                    </span>
                  </div>
                  <Progress 
                    value={(item.score / item.maxScore) * 100} 
                    className="h-2 mb-2"
                  />
                  <p className="text-xs opacity-80">{item.description}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="recommendations" className="mt-4 space-y-4">
              <div className="space-y-3">
                {metrics.savingsRate < 15 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Target className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-yellow-800">Increase Savings Rate</div>
                        <div className="text-xs text-yellow-700 mt-1">
                          Aim for 20% savings rate. Consider the 50/30/20 budget rule.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {metrics.emergencyFundMonths < 3 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-red-800">Build Emergency Fund</div>
                        <div className="text-xs text-red-700 mt-1">
                          Aim for 3-6 months of expenses. Start with €100/month.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {topCategories.length > 0 && topCategories[0][1] > 35 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Activity className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-blue-800">Review Top Expense</div>
                        <div className="text-xs text-blue-700 mt-1">
                          {topCategories[0][0]} is {topCategories[0][1].toFixed(1)}% of expenses. Consider optimization.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-green-800">Track Progress</div>
                      <div className="text-xs text-green-700 mt-1">
                        Review your health score monthly to see improvements.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" size="sm">
                <ArrowRight className="h-4 w-4 mr-2" />
                Get Personalized Financial Plan
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}