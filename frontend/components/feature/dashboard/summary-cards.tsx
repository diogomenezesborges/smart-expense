'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  thisMonth: {
    income: number;
    expenses: number;
    net: number;
  };
  trends?: {
    income: { value: number; direction: 'up' | 'down' | 'stable' };
    expenses: { value: number; direction: 'up' | 'down' | 'stable' };
    net: { value: number; direction: 'up' | 'down' | 'stable' };
    transactions: { value: number; direction: 'up' | 'down' | 'stable' };
  };
}

export function SummaryCards() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch('/api/analytics/summary-simple');
        if (!response.ok) {
          throw new Error('Failed to fetch summary');
        }
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-error" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable', isPositive: boolean = true) => {
    if (direction === 'stable') return 'text-muted-foreground';
    const isGood = isPositive ? direction === 'up' : direction === 'down';
    return isGood ? 'text-success' : 'text-error';
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <LoadingSpinner size="sm" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-destructive">Error loading summary: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Income Card */}
      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-success">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <div className="p-2 bg-success/10 rounded-full">
            <DollarSign className="h-4 w-4 text-success" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success animate-in fade-in-50 duration-500">
            {formatCurrency(summary.totalIncome)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              This month: {formatCurrency(summary.thisMonth.income)}
            </p>
            {summary.trends?.income && (
              <div className="flex items-center space-x-1">
                {getTrendIcon(summary.trends.income.direction)}
                <span className={`text-xs font-medium ${getTrendColor(summary.trends.income.direction, true)}`}>
                  {summary.trends.income.value.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses Card */}
      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-error">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <div className="p-2 bg-error/10 rounded-full">
            <CreditCard className="h-4 w-4 text-error" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-error animate-in fade-in-50 duration-500">
            {formatCurrency(summary.totalExpenses)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              This month: {formatCurrency(summary.thisMonth.expenses)}
            </p>
            {summary.trends?.expenses && (
              <div className="flex items-center space-x-1">
                {getTrendIcon(summary.trends.expenses.direction)}
                <span className={`text-xs font-medium ${getTrendColor(summary.trends.expenses.direction, false)}`}>
                  {summary.trends.expenses.value.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Net Amount Card */}
      <Card className={`hover:shadow-md transition-all duration-200 border-l-4 ${
        summary.netAmount >= 0 ? 'border-l-success' : 'border-l-warning'
      }`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
          <div className={`p-2 rounded-full ${
            summary.netAmount >= 0 ? 'bg-success/10' : 'bg-warning/10'
          }`}>
            <PiggyBank className={`h-4 w-4 ${
              summary.netAmount >= 0 ? 'text-success' : 'text-warning'
            }`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold animate-in fade-in-50 duration-500 ${
            summary.netAmount >= 0 ? 'text-success' : 'text-warning'
          }`}>
            {formatCurrency(summary.netAmount)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              This month: {formatCurrency(summary.thisMonth.net)}
            </p>
            {summary.trends?.net && (
              <div className="flex items-center space-x-1">
                {getTrendIcon(summary.trends.net.direction)}
                <span className={`text-xs font-medium ${getTrendColor(summary.trends.net.direction, true)}`}>
                  {summary.trends.net.value.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          {summary.netAmount >= 0 && (
            <Badge variant="secondary" className="mt-2 text-xs">
              Savings Goal: {((summary.netAmount / (summary.totalIncome || 1)) * 100).toFixed(1)}%
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Total Transactions Card */}
      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          <div className="p-2 bg-primary/10 rounded-full">
            <Activity className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary animate-in fade-in-50 duration-500">
            {summary.transactionCount.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              All tracked transactions
            </p>
            {summary.trends?.transactions && (
              <div className="flex items-center space-x-1">
                {getTrendIcon(summary.trends.transactions.direction)}
                <span className={`text-xs font-medium ${getTrendColor(summary.trends.transactions.direction, true)}`}>
                  {summary.trends.transactions.value.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}