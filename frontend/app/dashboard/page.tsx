'use client';

import { useState, useEffect } from 'react';
import { SummaryCards } from '@/components/feature/dashboard/summary-cards';
import { TransactionList } from '@/components/feature/dashboard/transaction-list';
import { CategoryBreakdown } from '@/components/feature/dashboard/category-breakdown';
import { SpendingTrends } from '@/components/feature/dashboard/spending-trends';
import { FinancialHealthScore } from '@/components/feature/dashboard/financial-health-score';
import { SpendingPatterns } from '@/components/feature/dashboard/spending-patterns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  TrendingUp,
  CreditCard,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface DashboardInsight {
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
}

interface BudgetAlert {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
  status: 'good' | 'warning' | 'danger';
}

export default function DashboardPage() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<DashboardInsight[]>([
    {
      type: 'success',
      title: 'Excellent Savings This Month',
      description: 'You\'ve saved 25.2% of your income, exceeding your 20% goal.',
      action: 'View Savings Plan',
      actionUrl: '/analytics'
    },
    {
      type: 'warning',
      title: 'Transportation Budget Alert',
      description: 'You\'re at 95% of your transportation budget with 8 days remaining.',
      action: 'Review Expenses',
      actionUrl: '/transactions?category=transport'
    },
    {
      type: 'info',
      title: 'New GoCardless Sync Available',
      description: '23 new transactions are ready to be synced from your bank.',
      action: 'Sync Now',
      actionUrl: '/working-dashboard'
    }
  ]);

  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([
    {
      category: 'Alimentação',
      spent: 567.45,
      budget: 800,
      percentage: 70.9,
      status: 'good'
    },
    {
      category: 'Transportes',
      spent: 378.90,
      budget: 400,
      percentage: 94.7,
      status: 'warning'
    },
    {
      category: 'Casa',
      spent: 645.30,
      budget: 600,
      percentage: 107.6,
      status: 'danger'
    }
  ]);

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
      
      // Update insights with fresh data
      const freshInsights: DashboardInsight[] = [
        {
          type: 'success',
          title: 'New Income Detected',
          description: 'Salary payment of €2,500 has been processed and categorized.',
          action: 'View Transaction',
          actionUrl: '/transactions'
        },
        ...insights.slice(1)
      ];
      setInsights(freshInsights);
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshDashboard();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Dashboard</h2>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Eye className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDashboard}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <SummaryCards />
      
      {/* Smart Insights Row */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Smart Insights
          </CardTitle>
          <CardDescription>AI-powered financial recommendations and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {insights.map((insight, index) => (
              <Alert 
                key={index} 
                variant={
                  insight.type === 'success' ? 'success' :
                  insight.type === 'warning' ? 'warning' :
                  insight.type === 'error' ? 'destructive' : 'info'
                }
                className="transition-all duration-200 hover:shadow-sm"
              >
                {getInsightIcon(insight.type)}
                <div className="ml-2">
                  <AlertTitle className="text-sm font-medium">{insight.title}</AlertTitle>
                  <AlertDescription className="text-sm mt-1">
                    {insight.description}
                  </AlertDescription>
                  {insight.action && insight.actionUrl && (
                    <div className="mt-3">
                      <Link href={insight.actionUrl}>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          {insight.action}
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Enhanced Analytics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Financial Health Score */}
        <FinancialHealthScore />
        
        {/* Spending Patterns */}
        <SpendingPatterns />
        
        {/* Spending Trends */}
        <SpendingTrends className="md:col-span-2 lg:col-span-1" />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Transactions List */}
        <div className="col-span-4">
          <TransactionList />
        </div>
        
        {/* Enhanced Right Column */}
        <div className="col-span-3 space-y-4">
          {/* Category Breakdown */}
          <CategoryBreakdown />
          
          {/* Budget Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Budget Alerts</CardTitle>
              <Link href="/budgeting">
                <Button variant="outline" size="sm">
                  Manage Budget
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgetAlerts.map((budget, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{budget.category}</span>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getBudgetStatusColor(budget.status)}`}>
                        €{budget.spent.toLocaleString()} / €{budget.budget.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {budget.percentage >= 100 ? 'Over' : 'Remaining'}: €{Math.abs(budget.budget - budget.spent).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={Math.min(budget.percentage, 100)} 
                      className={`flex-1 h-2 ${
                        budget.status === 'danger' ? '[&>div]:bg-red-500' :
                        budget.status === 'warning' ? '[&>div]:bg-yellow-500' : ''
                      }`}
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {budget.percentage.toFixed(0)}%
                    </span>
                  </div>
                  {budget.status === 'danger' && (
                    <div className="flex items-center space-x-1 text-xs text-red-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Budget exceeded by €{(budget.spent - budget.budget).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link href="/transactions/new">
              <Button variant="outline" className="w-full h-16 flex-col">
                <CreditCard className="h-5 w-5 mb-2" />
                <span className="text-sm">Add Transaction</span>
              </Button>
            </Link>
            <Link href="/working-dashboard">
              <Button variant="outline" className="w-full h-16 flex-col">
                <RefreshCw className="h-5 w-5 mb-2" />
                <span className="text-sm">Sync Bank</span>
              </Button>
            </Link>
            <Link href="/analytics/advanced">
              <Button variant="outline" className="w-full h-16 flex-col">
                <TrendingUp className="h-5 w-5 mb-2" />
                <span className="text-sm">Advanced Analytics</span>
              </Button>
            </Link>
            <Link href="/budgeting">
              <Button variant="outline" className="w-full h-16 flex-col">
                <Target className="h-5 w-5 mb-2" />
                <span className="text-sm">Budget Manager</span>
              </Button>
            </Link>
            <Link href="/export">
              <Button variant="outline" className="w-full h-16 flex-col">
                <ArrowUpRight className="h-5 w-5 mb-2" />
                <span className="text-sm">Export Data</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}