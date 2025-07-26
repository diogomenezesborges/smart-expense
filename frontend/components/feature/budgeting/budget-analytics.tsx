'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Calendar,
  Activity,
  DollarSign
} from 'lucide-react';

interface BudgetAnalyticsData {
  spendingVelocity: {
    category: string;
    currentRate: number;
    projectedMonthEnd: number;
    budget: number;
    status: 'on-track' | 'over-pace' | 'under-pace';
    daysRemaining: number;
  }[];
  varianceAnalysis: {
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
    variancePercentage: number;
    trend: 'improving' | 'worsening' | 'stable';
  }[];
  seasonalPatterns: {
    category: string;
    currentMonth: number;
    historicalAverage: number;
    seasonalFactor: number;
    recommendation: string;
  }[];
  budgetHealthScore: {
    overall: number;
    breakdown: {
      allocation: number;
      adherence: number;
      sustainability: number;
      goalAlignment: number;
    };
  };
}

export function BudgetAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [analyticsData, setAnalyticsData] = useState<BudgetAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for analytics data
    const fetchAnalytics = async () => {
      setLoading(true);
      
      // Mock data - in production this would come from API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalyticsData({
        spendingVelocity: [
          {
            category: 'Food & Dining',
            currentRate: 18.5,
            projectedMonthEnd: 555,
            budget: 600,
            status: 'on-track',
            daysRemaining: 8
          },
          {
            category: 'Transportation',
            currentRate: 32.1,
            projectedMonthEnd: 420,
            budget: 350,
            status: 'over-pace',
            daysRemaining: 8
          },
          {
            category: 'Entertainment',
            currentRate: 12.3,
            projectedMonthEnd: 185,
            budget: 250,
            status: 'under-pace',
            daysRemaining: 8
          },
          {
            category: 'Shopping',
            currentRate: 25.8,
            projectedMonthEnd: 309,
            budget: 300,
            status: 'over-pace',
            daysRemaining: 8
          }
        ],
        varianceAnalysis: [
          {
            category: 'Housing',
            budgeted: 1200,
            actual: 1180,
            variance: -20,
            variancePercentage: -1.7,
            trend: 'stable'
          },
          {
            category: 'Food & Dining',
            budgeted: 600,
            actual: 645,
            variance: 45,
            variancePercentage: 7.5,
            trend: 'worsening'
          },
          {
            category: 'Transportation',
            budgeted: 350,
            actual: 285,
            variance: -65,
            variancePercentage: -18.6,
            trend: 'improving'
          },
          {
            category: 'Utilities',
            budgeted: 180,
            actual: 195,
            variance: 15,
            variancePercentage: 8.3,
            trend: 'worsening'
          }
        ],
        seasonalPatterns: [
          {
            category: 'Food & Dining',
            currentMonth: 645,
            historicalAverage: 587,
            seasonalFactor: 1.1,
            recommendation: 'Holiday season typically increases food spending by 10%. Consider meal planning.'
          },
          {
            category: 'Utilities',
            currentMonth: 195,
            historicalAverage: 165,
            seasonalFactor: 1.18,
            recommendation: 'Winter heating costs are 18% higher. This is normal seasonal variation.'
          },
          {
            category: 'Entertainment',
            currentMonth: 185,
            historicalAverage: 220,
            seasonalFactor: 0.84,
            recommendation: 'Entertainment spending typically decreases in January. Good opportunity to save.'
          }
        ],
        budgetHealthScore: {
          overall: 82,
          breakdown: {
            allocation: 85,
            adherence: 78,
            sustainability: 88,
            goalAlignment: 77
          }
        }
      });
      
      setLoading(false);
    };

    fetchAnalytics();
  }, [selectedPeriod]);

  const getVelocityStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-50';
      case 'over-pace': return 'text-red-600 bg-red-50';
      case 'under-pace': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getVelocityIcon = (status: string) => {
    switch (status) {
      case 'on-track': return <CheckCircle className="h-4 w-4" />;
      case 'over-pace': return <AlertTriangle className="h-4 w-4" />;
      case 'under-pace': return <TrendingDown className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'worsening': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header with Period Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Budget Analytics</h3>
          <p className="text-sm text-muted-foreground">AI-powered insights and predictions</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current-month">Current Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Budget Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Budget Health Score</span>
          </CardTitle>
          <CardDescription>Overall assessment of your budget performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(analyticsData.budgetHealthScore.overall)}`}>
                  {analyticsData.budgetHealthScore.overall}
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
              <div className="flex justify-center">
                <div className="w-32 h-32 relative">
                  <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-transparent"
                    style={{
                      borderTopColor: analyticsData.budgetHealthScore.overall >= 80 ? '#10b981' : 
                                    analyticsData.budgetHealthScore.overall >= 60 ? '#f59e0b' : '#ef4444',
                      borderRightColor: analyticsData.budgetHealthScore.overall >= 80 ? '#10b981' : 
                                      analyticsData.budgetHealthScore.overall >= 60 ? '#f59e0b' : '#ef4444',
                      transform: `rotate(${(analyticsData.budgetHealthScore.overall / 100) * 360}deg)`
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {Object.entries(analyticsData.budgetHealthScore.breakdown).map(([key, score]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="velocity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="velocity">Spending Velocity</TabsTrigger>
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Patterns</TabsTrigger>
        </TabsList>

        {/* Spending Velocity Analysis */}
        <TabsContent value="velocity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Spending Velocity</span>
              </CardTitle>
              <CardDescription>
                Track how fast you're spending compared to your budget timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.spendingVelocity.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{item.category}</h4>
                        <Badge className={getVelocityStatusColor(item.status)}>
                          {getVelocityIcon(item.status)}
                          <span className="ml-1 capitalize">{item.status.replace('-', ' ')}</span>
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          €{item.projectedMonthEnd} projected
                        </div>
                        <div className="text-xs text-muted-foreground">
                          of €{item.budget} budget
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Daily rate: €{item.currentRate}</span>
                        <span>{item.daysRemaining} days remaining</span>
                      </div>
                      <Progress 
                        value={Math.min((item.projectedMonthEnd / item.budget) * 100, 100)} 
                        className="h-2"
                      />
                      {item.status === 'over-pace' && (
                        <div className="text-xs text-red-600 mt-1">
                          At current pace, you'll exceed budget by €{(item.projectedMonthEnd - item.budget).toFixed(0)}
                        </div>
                      )}
                      {item.status === 'under-pace' && (
                        <div className="text-xs text-blue-600 mt-1">
                          You'll save approximately €{(item.budget - item.projectedMonthEnd).toFixed(0)} this month
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variance Analysis */}
        <TabsContent value="variance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Budget vs Actual Analysis</span>
              </CardTitle>
              <CardDescription>
                Compare your actual spending against budgeted amounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.varianceAnalysis.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{item.category}</h4>
                        {getTrendIcon(item.trend)}
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          item.variance > 0 ? 'text-red-600' : 
                          item.variance < 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {item.variance > 0 ? '+' : ''}€{item.variance}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.variancePercentage > 0 ? '+' : ''}{item.variancePercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budgeted: €{item.budgeted}</span>
                        <span>Actual: €{item.actual}</span>
                      </div>
                      <div className="relative">
                        <Progress value={(item.actual / item.budgeted) * 100} className="h-3" />
                        {item.variance > 0 && (
                          <div className="absolute top-0 right-0 text-xs text-red-600 font-medium">
                            Over by {item.variancePercentage.toFixed(1)}%
                          </div>
                        )}
                      </div>
                      <div className="text-xs">
                        <span className="capitalize font-medium">{item.trend}</span> trend 
                        {item.trend === 'improving' && ' - Great job reducing spending!'}
                        {item.trend === 'worsening' && ' - Consider reviewing this category'}
                        {item.trend === 'stable' && ' - Consistent spending pattern'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seasonal Patterns */}
        <TabsContent value="seasonal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Seasonal Spending Patterns</span>
              </CardTitle>
              <CardDescription>
                Understand how seasonal factors affect your spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.seasonalPatterns.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{item.category}</h4>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          €{item.currentMonth} current
                        </div>
                        <div className="text-xs text-muted-foreground">
                          vs €{item.historicalAverage} average
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1">
                            Seasonal Factor: {item.seasonalFactor.toFixed(2)}x
                          </div>
                          <Progress 
                            value={Math.min(item.seasonalFactor * 50, 100)} 
                            className="h-2"
                          />
                        </div>
                        <Badge variant={item.seasonalFactor > 1 ? 'destructive' : 'secondary'}>
                          {item.seasonalFactor > 1 ? 
                            `+${((item.seasonalFactor - 1) * 100).toFixed(0)}%` : 
                            `-${((1 - item.seasonalFactor) * 100).toFixed(0)}%`
                          }
                        </Badge>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
                          <p className="text-sm text-blue-800">{item.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}