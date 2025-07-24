'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading categories...</div>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {majorCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No expense data available
            </div>
          ) : (
            majorCategories.map((category, index) => (
              <div key={category.majorCategory} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{category.majorCategory}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(category.total)} ({category.percentage.toFixed(1)}%)
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(category.percentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {category.transactionCount} transaction{category.transactionCount !== 1 ? 's' : ''}
                </div>
              </div>
            ))
          )}
        </div>
        {categories.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Total expenses: {formatCurrency(totalAmount)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}