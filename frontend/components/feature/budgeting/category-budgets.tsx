'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const categoryBudgets = [
  { name: 'Food & Dining', budget: 800, spent: 620, color: 'bg-blue-500', icon: '🍽️' },
  { name: 'Transportation', budget: 400, spent: 285, color: 'bg-green-500', icon: '🚗' },
  { name: 'Entertainment', budget: 300, spent: 180, color: 'bg-purple-500', icon: '🎬' },
  { name: 'Shopping', budget: 600, spent: 520, color: 'bg-pink-500', icon: '🛍️' },
  { name: 'Bills & Utilities', budget: 900, spent: 850, color: 'bg-orange-500', icon: '⚡' },
  { name: 'Healthcare', budget: 200, spent: 120, color: 'bg-red-500', icon: '🏥' },
  { name: 'Education', budget: 250, spent: 180, color: 'bg-indigo-500', icon: '📚' },
  { name: 'Travel', budget: 400, spent: 150, color: 'bg-cyan-500', icon: '✈️' },
];

function ProgressRing({ percentage, size = 60, strokeWidth = 6, color = 'blue' }: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`text-${color}-500 transition-all duration-500 ease-in-out`}
        />
      </svg>
      <span className="absolute text-sm font-semibold">
        {Math.round(percentage)}%
      </span>
    </div>
  );
}

export function CategoryBudgets() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Category Budgets</CardTitle>
        <p className="text-sm text-muted-foreground">Track your spending across different categories</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categoryBudgets.map((category) => {
            const percentage = (category.spent / category.budget) * 100;
            const remaining = category.budget - category.spent;
            const isOverBudget = percentage > 100;
            
            return (
              <Card key={category.name} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <h3 className="font-medium text-sm">{category.name}</h3>
                    </div>
                    <ProgressRing 
                      percentage={Math.min(percentage, 100)} 
                      size={50} 
                      strokeWidth={4}
                      color={isOverBudget ? 'red' : percentage > 80 ? 'orange' : 'blue'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent:</span>
                      <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-foreground'}`}>
                        ${category.spent}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">${category.budget}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isOverBudget ? 'Over:' : 'Left:'}
                      </span>
                      <span className={`font-medium ${
                        isOverBudget ? 'text-red-600' : remaining < 50 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        ${isOverBudget ? Math.abs(remaining) : remaining}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}