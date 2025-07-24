'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  PieChart,
  BarChart3,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface AnalyticsData {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  monthlyTrends: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
  budgetPerformance: Array<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    status: 'on-track' | 'warning' | 'exceeded';
  }>;
  insights: Array<{
    type: 'positive' | 'warning' | 'info';
    title: string;
    description: string;
    action?: string;
  }>;
}

export default function AdvancedAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last-3-months');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'insights'>('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, selectedCategory]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        totalTransactions: 247,
        totalIncome: 8450.00,
        totalExpenses: 6320.75,
        netFlow: 2129.25,
        categoryBreakdown: [
          { category: 'Food & Dining', amount: 1420.50, percentage: 22.5, trend: 'up' },
          { category: 'Transportation', amount: 890.25, percentage: 14.1, trend: 'stable' },
          { category: 'Shopping', amount: 756.80, percentage: 12.0, trend: 'down' },
          { category: 'Bills & Utilities', amount: 1250.00, percentage: 19.8, trend: 'stable' },
          { category: 'Entertainment', amount: 445.60, percentage: 7.0, trend: 'up' },
          { category: 'Healthcare', amount: 325.90, percentage: 5.2, trend: 'stable' },
          { category: 'Other', amount: 1231.70, percentage: 19.4, trend: 'up' }
        ],
        monthlyTrends: [
          { month: 'Nov', income: 2850.00, expenses: 2120.25, net: 729.75 },
          { month: 'Dec', income: 2900.00, expenses: 2450.50, net: 449.50 },
          { month: 'Jan', income: 2700.00, expenses: 1750.00, net: 950.00 }
        ],
        budgetPerformance: [
          { category: 'Food & Dining', budgeted: 1200.00, spent: 1420.50, remaining: -220.50, status: 'exceeded' },
          { category: 'Transportation', budgeted: 900.00, spent: 890.25, remaining: 9.75, status: 'on-track' },
          { category: 'Shopping', budgeted: 800.00, spent: 756.80, remaining: 43.20, status: 'on-track' },
          { category: 'Entertainment', budgeted: 400.00, spent: 445.60, remaining: -45.60, status: 'warning' }
        ],
        insights: [
          {
            type: 'positive',
            title: 'Excellent Saving Rate',
            description: 'You saved 25.2% of your income this month, exceeding your 20% goal.',
            action: 'Consider increasing investment contributions'
          },
          {
            type: 'warning',
            title: 'Food Spending Above Budget',
            description: 'Food & Dining expenses are 18% above budget. Consider meal planning.',
            action: 'Review dining out frequency'
          },
          {
            type: 'info',
            title: 'Transportation Savings',
            description: 'Transportation costs decreased by 12% compared to last month.',
            action: 'Maintain current commuting patterns'
          }
        ]
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'exceeded': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      default: return <TrendingUp className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Analytics</h2>
          <p className="text-gray-600 mb-4">Unable to fetch analytics data. Please try again.</p>
          <Button onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive financial insights and trends</p>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="food">Food & Dining</SelectItem>
              <SelectItem value="transport">Transportation</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="bills">Bills & Utilities</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={viewMode === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('overview')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={viewMode === 'detailed' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('detailed')}
        >
          <PieChart className="h-4 w-4 mr-2" />
          Detailed
        </Button>
        <Button
          variant={viewMode === 'insights' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('insights')}
        >
          <Target className="h-4 w-4 mr-2" />
          Insights
        </Button>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  €{data.totalIncome.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +5% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  €{data.totalExpenses.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  -3% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  €{data.netFlow.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +15% from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Breakdown of expenses across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="font-medium">{category.category}</span>
                      <Badge variant={category.trend === 'up' ? 'default' : category.trend === 'down' ? 'secondary' : 'outline'}>
                        {category.trend === 'up' ? '↑' : category.trend === 'down' ? '↓' : '→'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">€{category.amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{category.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Detailed Mode */}
      {viewMode === 'detailed' && (
        <>
          {/* Budget Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Performance</CardTitle>
              <CardDescription>How your spending compares to your budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.budgetPerformance.map((budget, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{budget.category}</span>
                      <div className="text-right">
                        <div className="text-sm">
                          €{budget.spent.toLocaleString()} of €{budget.budgeted.toLocaleString()}
                        </div>
                        <Badge variant={budget.status === 'exceeded' ? 'default' : budget.status === 'warning' ? 'outline' : 'secondary'}>
                          {budget.status === 'exceeded' ? 'Over Budget' : budget.status === 'warning' ? 'Close to Limit' : 'On Track'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={Math.min((budget.spent / budget.budgeted) * 100, 100)} 
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">
                        {Math.round((budget.spent / budget.budgeted) * 100)}%
                      </span>
                    </div>
                    {budget.remaining < 0 && (
                      <p className="text-sm text-red-600">
                        €{Math.abs(budget.remaining).toLocaleString()} over budget
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Income vs expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.monthlyTrends.map((month, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 py-2 border-b">
                    <div className="font-medium">{month.month}</div>
                    <div className="text-right text-green-600">
                      €{month.income.toLocaleString()}
                    </div>
                    <div className="text-right text-red-600">
                      €{month.expenses.toLocaleString()}
                    </div>
                    <div className={`text-right font-medium ${month.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      €{month.net.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Insights Mode */}
      {viewMode === 'insights' && (
        <div className="space-y-6">
          {data.insights.map((insight, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                    <p className="text-muted-foreground mb-3">{insight.description}</p>
                    {insight.action && (
                      <Button variant="outline" size="sm">
                        {insight.action}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* AI-Powered Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
              <CardDescription>Personalized suggestions based on your spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Smart Saving Opportunity</h4>
                  <p className="text-blue-800 text-sm mb-3">
                    You could save €180/month by reducing dining out frequency from 12 to 8 times per month.
                  </p>
                  <Button size="sm" variant="outline">
                    Create Savings Goal
                  </Button>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">🎯 Budget Optimization</h4>
                  <p className="text-green-800 text-sm mb-3">
                    Consider reallocating €50 from shopping budget to emergency fund based on your spending patterns.
                  </p>
                  <Button size="sm" variant="outline">
                    Adjust Budget
                  </Button>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">📊 Investment Opportunity</h4>
                  <p className="text-purple-800 text-sm mb-3">
                    Your consistent savings rate suggests you're ready to increase investment contributions by €200/month.
                  </p>
                  <Button size="sm" variant="outline">
                    Explore Investments
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}