'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PieChart, BarChart } from '@/components/ui/chart';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CategoryData {
  majorCategory: string;
  category: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

export function CategoryBreakdown() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategoryBreakdown() {
      try {
        const response = await fetch('/api/analytics/categories-simple');
        if (!response.ok) {
          throw new Error('Failed to fetch category breakdown');
        }
        const data = await response.json();
        setCategories(data.breakdown || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryBreakdown();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChartIcon className="h-5 w-5 mr-2" />
            Expense Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner text="Loading categories..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group by major category and sum totals
  const majorCategories = categories.reduce((acc, item) => {
    const existing = acc.find(cat => cat.majorCategory === item.majorCategory);
    if (existing) {
      existing.total += item.total;
      existing.transactionCount += item.transactionCount;
    } else {
      acc.push({
        majorCategory: item.majorCategory,
        total: item.total,
        transactionCount: item.transactionCount,
        percentage: 0, // Will calculate after grouping
      });
    }
    return acc;
  }, [] as { majorCategory: string; total: number; transactionCount: number; percentage: number }[]);

  // Calculate percentages
  const totalAmount = majorCategories.reduce((sum, cat) => sum + cat.total, 0);
  majorCategories.forEach(cat => {
    cat.percentage = totalAmount > 0 ? (cat.total / totalAmount) * 100 : 0;
  });

  // Sort by total amount descending
  majorCategories.sort((a, b) => b.total - a.total);

  // Prepare chart data
  const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
  const pieChartData = majorCategories.map((category, index) => ({
    label: category.majorCategory,
    value: category.total,
    color: chartColors[index % chartColors.length]
  }));

  const barChartData = majorCategories.map((category, index) => ({
    label: category.majorCategory.replace('_', ' '),
    value: category.total,
    color: chartColors[index % chartColors.length]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Expense Categories
          </div>
          {totalAmount > 0 && (
            <Badge variant="secondary">
              {formatCurrency(totalAmount)} total
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {majorCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No expense data available
          </div>
        ) : (
          <Tabs defaultValue="pie" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pie" className="flex items-center">
                <PieChartIcon className="h-4 w-4 mr-2" />
                Pie Chart
              </TabsTrigger>
              <TabsTrigger value="bar" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Bar Chart
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pie" className="mt-4">
              <PieChart
                data={pieChartData}
                size="default"
                showLabels={true}
              />
            </TabsContent>
            
            <TabsContent value="bar" className="mt-4">
              <BarChart
                data={barChartData}
                size="default"
              />
              
              {/* Detailed breakdown */}
              <div className="mt-6 space-y-3">
                {majorCategories.map((category, index) => (
                  <div key={category.majorCategory} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      />
                      <div>
                        <div className="font-medium text-sm">{category.majorCategory.replace('_', ' ')}</div>
                        <div className="text-xs text-muted-foreground">
                          {category.transactionCount} transaction{category.transactionCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">{formatCurrency(category.total)}</div>
                      <div className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}