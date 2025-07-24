'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  Bell,
  Settings,
  PlusCircle,
  BarChart3,
  PieChart,
  Calendar,
  Wallet,
  Home,
  Car,
  ShoppingCart,
  Coffee,
  Briefcase,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  availableBalance: number;
  savingsRate: number;
  budgetUtilization: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  icon: React.ReactNode;
}

interface SmartInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
}

interface BudgetOverview {
  category: string;
  spent: number;
  budget: number;
  icon: React.ReactNode;
  color: string;
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data - in real app this would come from APIs
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalBalance: 12456.78,
    monthlyIncome: 4200.00,
    monthlyExpenses: 3245.67,
    availableBalance: 954.33,
    savingsRate: 22.7,
    budgetUtilization: 77.3
  });

  const quickActions: QuickAction[] = [
    {
      id: 'new-transaction',
      title: 'Add Transaction',
      description: 'Quick expense entry',
      icon: <PlusCircle className="h-5 w-5" />,
      href: '/transactions/new',
      color: 'bg-primary'
    },
    {
      id: 'view-budget',
      title: 'Budget Overview',
      description: 'Monthly budgets',
      icon: <Target className="h-5 w-5" />,
      href: '/budgeting',
      color: 'bg-success'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Spending insights',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/analytics',
      color: 'bg-info'
    },
    {
      id: 'goals',
      title: 'Financial Goals',
      description: 'Track progress',
      icon: <Briefcase className="h-5 w-5" />,
      href: '/goals',
      color: 'bg-warning'
    }
  ];

  const recentTransactions: RecentTransaction[] = [
    {
      id: '1',
      description: 'Salary Payment',
      amount: 4200.00,
      category: 'Income',
      date: '2024-01-20',
      type: 'income',
      icon: <Briefcase className="h-4 w-4" />
    },
    {
      id: '2',
      description: 'Supermarket Purchase',
      amount: -87.45,
      category: 'Groceries',
      date: '2024-01-19',
      type: 'expense',
      icon: <ShoppingCart className="h-4 w-4" />
    },
    {
      id: '3',
      description: 'Coffee Shop',
      amount: -4.50,
      category: 'Food & Dining',
      date: '2024-01-19',
      type: 'expense',
      icon: <Coffee className="h-4 w-4" />
    },
    {
      id: '4',
      description: 'Gas Station',
      amount: -65.20,
      category: 'Transportation',
      date: '2024-01-18',
      type: 'expense',
      icon: <Car className="h-4 w-4" />
    },
    {
      id: '5',
      description: 'Utility Bill',
      amount: -145.67,
      category: 'Bills',
      date: '2024-01-17',
      type: 'expense',
      icon: <Home className="h-4 w-4" />
    }
  ];

  const smartInsights: SmartInsight[] = [
    {
      id: '1',
      type: 'success',
      title: 'Great Savings Month!',
      description: 'You\'ve saved 22.7% of your income this month, exceeding your 20% goal.',
      action: 'View Savings Plan',
      actionUrl: '/goals',
      priority: 'high'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Transportation Budget Alert',
      description: 'You\'re at 94% of your transportation budget with 8 days remaining.',
      action: 'Review Expenses',
      actionUrl: '/transactions?category=transportation',
      priority: 'high'
    },
    {
      id: '3',
      type: 'info',
      title: 'Spending Pattern Detected',
      description: 'You spend 15% more on weekends. Consider setting weekend budgets.',
      action: 'Create Weekend Budget',
      actionUrl: '/budgeting/new',
      priority: 'medium'
    }
  ];

  const budgetOverview: BudgetOverview[] = [
    {
      category: 'Food & Dining',
      spent: 567.45,
      budget: 800,
      icon: <ShoppingCart className="h-4 w-4" />,
      color: 'text-success'
    },
    {
      category: 'Transportation',
      spent: 378.90,
      budget: 400,
      icon: <Car className="h-4 w-4" />,
      color: 'text-warning'
    },
    {
      category: 'Bills & Utilities',
      spent: 645.30,
      budget: 600,
      icon: <Home className="h-4 w-4" />,
      color: 'text-error'
    },
    {
      category: 'Entertainment',
      spent: 234.67,
      budget: 350,
      icon: <Coffee className="h-4 w-4" />,
      color: 'text-success'
    }
  ];

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate data refresh
      setLastUpdated(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-error" />;
      default: return <Clock className="h-4 w-4 text-info" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your finances today.
            {lastUpdated && (
              <span className="ml-2 text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Auto-refresh On
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Auto-refresh Off
              </>
            )}
          </Button>
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="h-6 w-6 p-0"
              >
                {balanceVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balanceVisible ? formatCurrency(financialSummary.totalBalance) : '••••••'}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(financialSummary.monthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">
              {formatCurrency(financialSummary.monthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              <ArrowDownRight className="inline h-3 w-3 mr-1" />
              -5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <Target className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {financialSummary.savingsRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Goal: 20% • <span className="text-success">Exceeding target!</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights */}
      {smartInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Smart Insights
            </CardTitle>
            <CardDescription>
              AI-powered recommendations based on your spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {smartInsights.map((insight) => (
                <div key={insight.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    {insight.action && insight.actionUrl && (
                      <Link href={insight.actionUrl}>
                        <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                          {insight.action} <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                  <Badge variant={insight.priority === 'high' ? 'default' : 'secondary'}>
                    {insight.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used features for faster access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href}>
                <div className="group p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{action.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Transactions */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="outline" size="sm">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={transaction.type === 'income' ? 'bg-success/10' : 'bg-muted'}>
                      {transaction.icon}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{transaction.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-success' : 'text-foreground'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>Monthly budget tracking</CardDescription>
            </div>
            <Link href="/budgeting">
              <Button variant="outline" size="sm">
                Manage <Settings className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {budgetOverview.map((budget) => {
                const percentage = (budget.spent / budget.budget) * 100;
                const isOverBudget = percentage > 100;
                
                return (
                  <div key={budget.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={budget.color}>{budget.icon}</span>
                        <span className="text-sm font-medium">{budget.category}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>{Math.round(percentage)}% used</span>
                        {isOverBudget && (
                          <span className="text-error font-medium">
                            Over by {formatCurrency(budget.spent - budget.budget)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}