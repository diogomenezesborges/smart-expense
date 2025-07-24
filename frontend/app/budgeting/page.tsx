import { BudgetOverview } from '@/components/feature/budgeting/budget-overview';
import { CategoryBudgets } from '@/components/feature/budgeting/category-budgets';
import { BudgetChart } from '@/components/feature/budgeting/budget-chart';
import { BudgetGoals } from '@/components/feature/budgeting/budget-goals';

export default function SmartBudgetingPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Smart Budgeting</h1>
        <div className="flex items-center space-x-2">
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>
        </div>
      </div>
      
      {/* Budget Overview Cards */}
      <BudgetOverview />
      
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Budget Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <BudgetChart />
        </div>
        
        {/* Budget Goals - Takes 1 column */}
        <div className="lg:col-span-1">
          <BudgetGoals />
        </div>
      </div>
      
      {/* Category Budgets */}
      <CategoryBudgets />
    </div>
  );
}