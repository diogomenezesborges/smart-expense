'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const monthlyData = [
  { month: 'Jan', budget: 5000, spent: 4200, saved: 800 },
  { month: 'Feb', budget: 5000, spent: 3800, saved: 1200 },
  { month: 'Mar', budget: 5000, spent: 4500, saved: 500 },
  { month: 'Apr', budget: 5000, spent: 3200, saved: 1800 },
  { month: 'May', budget: 5000, spent: 4100, saved: 900 },
  { month: 'Jun', budget: 5000, spent: 3900, saved: 1100 },
  { month: 'Jul', budget: 5000, spent: 3250, saved: 1750 },
];

export function BudgetChart() {
  const maxValue = Math.max(...monthlyData.map(d => Math.max(d.budget, d.spent)));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Budget vs Spending Trend</CardTitle>
        <p className="text-sm text-muted-foreground">Compare your monthly budget against actual spending</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-muted-foreground">Budget</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
              <span className="text-muted-foreground">Spent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Saved</span>
            </div>
          </div>
          
          {/* Chart */}
          <div className="relative h-64">
            <div className="flex h-full items-end justify-between space-x-2">
              {monthlyData.map((data, index) => {
                const budgetHeight = (data.budget / maxValue) * 100;
                const spentHeight = (data.spent / maxValue) * 100;
                
                return (
                  <div key={data.month} className="flex flex-col items-center space-y-2 flex-1">
                    {/* Bars */}
                    <div className="flex items-end space-x-1 h-48 w-full justify-center">
                      {/* Budget Bar */}
                      <div className="relative w-6 bg-muted rounded-t">
                        <div 
                          className="absolute bottom-0 w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600"
                          style={{ height: `${budgetHeight}%` }}
                          title={`Budget: $${data.budget}`}
                        ></div>
                      </div>
                      
                      {/* Spent Bar */}
                      <div className="relative w-6 bg-muted rounded-t">
                        <div 
                          className="absolute bottom-0 w-full bg-orange-500 rounded-t transition-all duration-500 hover:bg-orange-600"
                          style={{ height: `${spentHeight}%` }}
                          title={`Spent: $${data.spent}`}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Month Label */}
                    <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
                    
                    {/* Values */}
                    <div className="text-center text-xs space-y-1">
                      <div className="text-muted-foreground">
                        <span className="text-green-600 font-medium">+${data.saved}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground -ml-12">
              <span>${(maxValue / 1000).toFixed(0)}k</span>
              <span>${((maxValue * 0.75) / 1000).toFixed(0)}k</span>
              <span>${((maxValue * 0.5) / 1000).toFixed(0)}k</span>
              <span>${((maxValue * 0.25) / 1000).toFixed(0)}k</span>
              <span>$0</span>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${monthlyData[monthlyData.length - 1].budget.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Current Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ${monthlyData[monthlyData.length - 1].spent.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${monthlyData.reduce((sum, d) => sum + d.saved, 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Saved</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}