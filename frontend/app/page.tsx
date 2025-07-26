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
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  PlusCircle,
  BarChart3,
  Wallet,
  Home,
  Car,
  ShoppingCart,
  Coffee,
  Briefcase,
  ArrowRight,
  ChevronRight,
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
  responsiblePerson: 'Diogo' | 'Joana' | 'Comum';
}

interface BudgetOverview {
  category: string;
  spent: number;
  budget: number;
  icon: React.ReactNode;
  color: string;
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentUser] = useState<'Diogo' | 'Joana' | 'Comum'>('Diogo'); // This would come from auth context
  const [activeTimeframe, setActiveTimeframe] = useState<'7d' | '30d' | '3m'>('30d');

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
      icon: <Briefcase className="h-4 w-4" />,
      responsiblePerson: 'Diogo'
    },
    {
      id: '2',
      description: 'Supermarket Purchase',
      amount: -87.45,
      category: 'Groceries',
      date: '2024-01-19',
      type: 'expense',
      icon: <ShoppingCart className="h-4 w-4" />,
      responsiblePerson: 'Comum'
    },
    {
      id: '3',
      description: 'Coffee Shop',
      amount: -4.50,
      category: 'Food & Dining',
      date: '2024-01-19',
      type: 'expense',
      icon: <Coffee className="h-4 w-4" />,
      responsiblePerson: 'Joana'
    },
    {
      id: '4',
      description: 'Gas Station',
      amount: -65.20,
      category: 'Transportation',
      date: '2024-01-18',
      type: 'expense',
      icon: <Car className="h-4 w-4" />,
      responsiblePerson: 'Diogo'
    },
    {
      id: '5',
      description: 'Utility Bill',
      amount: -145.67,
      category: 'Bills',
      date: '2024-01-17',
      type: 'expense',
      icon: <Home className="h-4 w-4" />,
      responsiblePerson: 'Comum'
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

  // Disable auto-refresh for better performance - can be enabled later if needed
  // useEffect(() => {
  //   if (!autoRefresh) return;
  //   const interval = setInterval(() => {
  //     setLastUpdated(new Date());
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, [autoRefresh]);

  const refreshData = () => {
    setLastUpdated(new Date());
    // No loading state needed for instant refresh
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getPersonBadgeColor = (person: string) => {
    switch (person) {
      case 'Diogo': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md border-0';
      case 'Joana': return 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md border-0';
      case 'Comum': return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md border-0';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md border-0';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Top Row - Account Balance and Expenses (Like Imagem1.png) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Balance Widget - Blue card like in image */}
        <Card className="bg-primary text-primary-foreground shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary-foreground/80">Account Balance</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
              >
                {balanceVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {balanceVisible ? formatCurrency(financialSummary.totalBalance) : '••••••••'}
            </div>
            <div className="flex items-center text-primary-foreground/80 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+2.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Widget - Like in image */}
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1 text-black">
              {formatCurrency(financialSummary.monthlyExpenses)}
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
              <span>-5.2% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Budget Overview - 2x2 layout as originally requested */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions - Left side, 2x2 matrix */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features for faster access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2">
              {quickActions.map((action) => (
                <Link key={action.id} href={action.href}>
                  <div className="group p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{action.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview - Right side */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>Monthly budget tracking</CardDescription>
            </div>
            <Link href="/budgeting">
              <Button variant="outline" size="sm">
                <Settings className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetOverview.slice(0, 3).map((budget) => {
                const percentage = (budget.spent / budget.budget) * 100;
                const isOverBudget = percentage > 100;
                
                return (
                  <div key={budget.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={budget.color}>{budget.icon}</span>
                        <span className="text-sm font-medium">{budget.category}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2"
                    />
                    {isOverBudget && (
                      <span className="text-xs text-error">
                        Over by {formatCurrency(budget.spent - budget.budget)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions - Full width as originally requested */}
      <Card className="shadow-lg">
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
              <div key={transaction.id} className="flex items-center space-x-4 py-2">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className={transaction.type === 'income' ? 'bg-success/10' : 'bg-muted'}>
                    {transaction.icon}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">{transaction.category}</p>
                </div>
                <div className="flex flex-col items-end text-right min-w-[80px]">
                  <Badge className={`text-xs mb-1 px-3 py-1 rounded-full font-medium ${getPersonBadgeColor(transaction.responsiblePerson)}`}>
                    {transaction.responsiblePerson}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{transaction.date}</span>
                </div>
                <div className="text-right min-w-[100px] flex-shrink-0">
                  <p className={`text-sm font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}