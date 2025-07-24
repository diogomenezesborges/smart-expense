'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const budgetData = {
  totalBudget: 5000,
  totalSpent: 3250,
  remaining: 1750,
  categories: {
    completed: 8,
    total: 12,
  },
};

export function BudgetOverview() {
  const spentPercentage = (budgetData.totalSpent / budgetData.totalBudget) * 100;
  const remainingPercentage = (budgetData.remaining / budgetData.totalBudget) * 100;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Budget */}
      <Card className="border-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          <div className="h-4 w-4 rounded-full bg-blue-500"></div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">${budgetData.totalBudget.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Monthly allocation</p>
        </CardContent>
      </Card>

      {/* Total Spent */}
      <Card className="border-border bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          <div className="h-4 w-4 rounded-full bg-orange-500"></div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">${budgetData.totalSpent.toLocaleString()}</div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-full rounded-full bg-orange-200">
              <div 
                className="h-2 rounded-full bg-orange-500 transition-all duration-300"
                style={{ width: `${spentPercentage}%` }}
              ></div>
            </div>
            <span className="text-xs text-muted-foreground">{spentPercentage.toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Remaining Budget */}
      <Card className="border-border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          <div className="h-4 w-4 rounded-full bg-green-500"></div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${budgetData.remaining.toLocaleString()}</div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-full rounded-full bg-green-200">
              <div 
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${remainingPercentage}%` }}
              ></div>
            </div>
            <span className="text-xs text-muted-foreground">{remainingPercentage.toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Budget Categories */}
      <Card className="border-border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
          <div className="h-4 w-4 rounded-full bg-purple-500"></div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {budgetData.categories.completed}/{budgetData.categories.total}
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round((budgetData.categories.completed / budgetData.categories.total) * 100)}% on track
          </p>
        </CardContent>
      </Card>
    </div>
  );
}