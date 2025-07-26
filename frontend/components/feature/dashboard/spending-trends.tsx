'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, BarChart } from '@/components/ui/chart';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TrendingUp, TrendingDown, Calendar, BarChart3, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface TrendData {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

interface SpendingTrendsProps {
  className?: string;
}

export function SpendingTrends({ className }: SpendingTrendsProps) {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    async function fetchTrendData() {
      setLoading(true);
      try {
        // Mock data for demonstration - in real app, this would fetch from API
        const mockData: TrendData[] = [
          { date: '2024-01-01', income: 3200, expenses: 2100, net: 1100 },
          { date: '2024-01-02', income: 0, expenses: 150, net: -150 },
          { date: '2024-01-03', income: 500, expenses: 300, net: 200 },
          { date: '2024-01-04', income: 0, expenses: 420, net: -420 },
          { date: '2024-01-05', income: 200, expenses: 180, net: 20 },
          { date: '2024-01-06', income: 0, expenses: 90, net: -90 },
          { date: '2024-01-07', income: 0, expenses: 250, net: -250 },
          { date: '2024-01-08', income: 1200, expenses: 350, net: 850 },
          { date: '2024-01-09', income: 0, expenses: 200, net: -200 },
          { date: '2024-01-10', income: 300, expenses: 180, net: 120 },
          { date: '2024-01-11', income: 0, expenses: 320, net: -320 },
          { date: '2024-01-12', income: 0, expenses: 150, net: -150 },
          { date: '2024-01-13', income: 800, expenses: 240, net: 560 },
          { date: '2024-01-14', income: 0, expenses: 180, net: -180 },
          { date: '2024-01-15', income: 3200, expenses: 2100, net: 1100 },
        ];

        // Filter based on time range
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        setTrendData(mockData.slice(-days));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchTrendData();
  }, [timeRange]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Spending Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner text="Loading trends..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals and trends
  const totalIncome = trendData.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = trendData.reduce((sum, item) => sum + item.expenses, 0);
  const netTotal = totalIncome - totalExpenses;
  const avgDaily = netTotal / trendData.length;

  // Prepare chart data
  const incomeChartData = trendData.map(item => ({
    x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    y: item.income
  }));

  const expensesChartData = trendData.map(item => ({
    x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    y: item.expenses
  }));

  const netChartData = trendData.map(item => ({
    x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    y: item.net
  }));

  // Bar chart data for daily comparison
  const dailyBarData = trendData.map(item => ({
    label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Math.abs(item.net),
    color: item.net >= 0 ? 'hsl(var(--success))' : 'hsl(var(--error))'
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Spending Trends
          </CardTitle>
          <div className="flex items-center space-x-2">
            {['7d', '30d', '90d'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range as '7d' | '30d' | '90d')}
              >
                {range.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-success">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                  <p className="text-lg font-bold text-success">{formatCurrency(totalIncome)}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-error">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                  <p className="text-lg font-bold text-error">{formatCurrency(totalExpenses)}</p>
                </div>
                <TrendingDown className="h-5 w-5 text-error" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={`border-l-4 ${netTotal >= 0 ? 'border-l-success' : 'border-l-warning'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Flow</p>
                  <p className={`text-lg font-bold ${netTotal >= 0 ? 'text-success' : 'text-warning'}`}>
                    {formatCurrency(netTotal)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avg: {formatCurrency(avgDaily)}/day
                  </p>
                </div>
                <Activity className={`h-5 w-5 ${netTotal >= 0 ? 'text-success' : 'text-warning'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="line" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="line" className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Line Chart
            </TabsTrigger>
            <TabsTrigger value="bar" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Daily Net
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="line" className="mt-4">
            <div className="space-y-4">
              <LineChart
                title="Income vs Expenses"
                data={incomeChartData}
                color="hsl(var(--success))"
                size="lg"
              />
              <LineChart
                data={expensesChartData}
                color="hsl(var(--error))"
                size="lg"
              />
              <LineChart
                data={netChartData}
                color="hsl(var(--primary))"
                size="lg"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="bar" className="mt-4">
            <BarChart
              title="Daily Net Flow"
              description="Positive values show net savings, negative values show net spending"
              data={dailyBarData}
              size="lg"
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Period Summary</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </p>
            </div>
            <Badge variant={netTotal >= 0 ? 'secondary' : 'destructive'}>
              {netTotal >= 0 ? 'Positive' : 'Negative'} Cash Flow
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}