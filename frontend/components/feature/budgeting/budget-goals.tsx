'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const budgetGoals = [
  {
    id: 1,
    title: 'Emergency Fund',
    target: 10000,
    current: 6500,
    deadline: '2024-12-31',
    color: 'bg-blue-500',
    icon: '🛡️'
  },
  {
    id: 2,
    title: 'Vacation Fund',
    target: 3000,
    current: 1200,
    deadline: '2024-06-30',
    color: 'bg-green-500',
    icon: '✈️'
  },
  {
    id: 3,
    title: 'New Car Down Payment',
    target: 15000,
    current: 8500,
    deadline: '2025-03-31',
    color: 'bg-purple-500',
    icon: '🚗'
  }
];

export function BudgetGoals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Budget Goals</CardTitle>
        <p className="text-sm text-muted-foreground">Track your financial objectives</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgetGoals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          const remaining = goal.target - goal.current;
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={goal.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{goal.icon}</span>
                  <h3 className="font-medium">{goal.title}</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress.toFixed(1)}%</span>
                </div>
                
                <div className="h-2 w-full rounded-full bg-muted">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${goal.color}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}
                  </span>
                  <span className="font-medium text-blue-600">
                    ${remaining.toLocaleString()} left
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Add Funds
                </Button>
              </div>
            </div>
          );
        })}
        
        <Button variant="outline" className="w-full mt-4">
          + Create New Goal
        </Button>
      </CardContent>
    </Card>
  );
}