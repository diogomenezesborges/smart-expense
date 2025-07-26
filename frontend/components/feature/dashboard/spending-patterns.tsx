'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  MapPin,
  CreditCard,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  BarChart3
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { SpendingPattern, dashboardInsightsService } from '@/lib/services/dashboard-insights-service';

interface HabitPattern {
  habit: string;
  description: string;
  frequency: string;
  impact: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  suggestion: string;
}

interface SpendingPatternsProps {
  className?: string;
}

export function SpendingPatterns({ className }: SpendingPatternsProps) {
  const [patterns, setPatterns] = useState<SpendingPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('patterns');

  useEffect(() => {
    async function loadSpendingPatterns() {
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
          goals: [],
          timeframe: '1month' as const
        };

        const identifiedPatterns = await dashboardInsightsService.identifySpendingPatterns(mockContext);
        setPatterns(identifiedPatterns);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadSpendingPatterns();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Spending Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner text="Analyzing spending patterns..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Spending Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  const getPatternIcon = (pattern: SpendingPattern) => {
    if (pattern.pattern.toLowerCase().includes('weekend')) return <Calendar className="h-4 w-4" />;
    if (pattern.pattern.toLowerCase().includes('subscription')) return <CreditCard className="h-4 w-4" />;
    if (pattern.pattern.toLowerCase().includes('bulk')) return <BarChart3 className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getImpactColor = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return 'text-green-700 bg-green-50 border-green-200';
      case 'negative': return 'text-red-700 bg-red-50 border-red-200';
      case 'neutral': return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-3 w-3 text-green-500" />;
      case 'stable': return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  // Mock data for time-based and location-based patterns
  const timePatterns = [
    {
      time: 'Monday Morning',
      avgSpend: 45.20,
      category: 'Coffee & Breakfast',
      trend: 'increasing' as const,
      impact: 'Weekly work routine'
    },
    {
      time: 'Friday Evening',
      avgSpend: 89.50,
      category: 'Dining & Entertainment',
      trend: 'stable' as const,
      impact: 'Weekend celebration'
    },
    {
      time: 'Sunday Afternoon',
      avgSpend: 120.30,
      category: 'Groceries',
      trend: 'decreasing' as const,
      impact: 'Weekly shopping'
    }
  ];

  const locationPatterns = [
    {
      location: 'City Center',
      avgSpend: 67.80,
      frequency: 12,
      category: 'Dining & Shopping',
      suggestion: 'Consider meal prep to reduce city center dining'
    },
    {
      location: 'Near Office',
      avgSpend: 25.40,
      frequency: 22,
      category: 'Coffee & Snacks',
      suggestion: 'Bring coffee from home 2-3 days per week'
    },
    {
      location: 'Supermarket Chain A',
      avgSpend: 89.20,
      frequency: 8,
      category: 'Groceries',
      suggestion: 'Compare prices with other supermarkets'
    }
  ];

  const habitPatterns: HabitPattern[] = [
    {
      habit: 'Impulse Online Shopping',
      description: 'Late evening purchases (8-11 PM) average €45 higher',
      frequency: '3-4 times per week',
      impact: -180.50,
      trend: 'increasing',
      suggestion: 'Use a 24-hour waiting period for non-essential purchases'
    },
    {
      habit: 'Subscription Accumulation',
      description: 'New subscriptions added without canceling unused ones',
      frequency: 'Monthly',
      impact: -23.99,
      trend: 'increasing',
      suggestion: 'Review and audit all subscriptions quarterly'
    },
    {
      habit: 'Bulk Purchase Savings',
      description: 'Buying household items in bulk saves 15% on average',
      frequency: 'Bi-weekly',
      impact: 34.20,
      trend: 'stable',
      suggestion: 'Continue bulk buying for non-perishables'
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Spending Patterns
          </div>
          <Badge variant="outline">
            AI Insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
          </TabsList>

          <TabsContent value="patterns" className="mt-4 space-y-4">
            {patterns.map((pattern, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getImpactColor(pattern.impact)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getPatternIcon(pattern)}
                    <span className="font-medium text-sm">{pattern.pattern}</span>
                    {getTrendIcon(pattern.trend)}
                  </div>
                  <Badge variant={pattern.impact === 'positive' ? 'secondary' : 'destructive'}>
                    {formatCurrency(Math.abs(pattern.averageAmount))}
                  </Badge>
                </div>
                <p className="text-sm mb-3">{pattern.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span>Frequency: {pattern.frequency}× per month</span>
                  <span className="capitalize">Trend: {pattern.trend}</span>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="time" className="mt-4 space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Spending patterns by time of day and week
            </div>
            {timePatterns.map((pattern, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium text-sm">{pattern.time}</span>
                    {getTrendIcon(pattern.trend)}
                  </div>
                  <Badge variant="outline">
                    {formatCurrency(pattern.avgSpend)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div>Category: {pattern.category}</div>
                  <div className="mt-1">Impact: {pattern.impact}</div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="location" className="mt-4 space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Spending patterns by location
            </div>
            {locationPatterns.map((pattern, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium text-sm">{pattern.location}</span>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-medium">{formatCurrency(pattern.avgSpend)}</div>
                    <div className="text-muted-foreground">{pattern.frequency}× /month</div>
                  </div>
                </div>
                <div className="text-xs mb-2">
                  Category: {pattern.category}
                </div>
                <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                  💡 {pattern.suggestion}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="habits" className="mt-4 space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Behavioral spending patterns and recommendations
            </div>
            {habitPatterns.map((habit, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {habit.impact > 0 ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> : 
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    }
                    <span className="font-medium text-sm">{habit.habit}</span>
                    {getTrendIcon(habit.trend)}
                  </div>
                  <Badge variant={habit.impact > 0 ? 'secondary' : 'destructive'}>
                    {habit.impact > 0 ? '+' : ''}{formatCurrency(habit.impact)}
                  </Badge>
                </div>
                
                <p className="text-sm mb-3">{habit.description}</p>
                
                <div className="flex items-center justify-between text-xs mb-3">
                  <span>Frequency: {habit.frequency}</span>
                  <span className="capitalize">Trend: {habit.trend}</span>
                </div>

                <div className={`text-xs p-2 rounded ${
                  habit.impact > 0 ? 'text-green-700 bg-green-50' : 'text-blue-700 bg-blue-50'
                }`}>
                  💡 {habit.suggestion}
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Detailed Habit Analysis
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}