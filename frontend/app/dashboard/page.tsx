import { SummaryCards } from '@/components/feature/dashboard/summary-cards';
import { TransactionList } from '@/components/feature/dashboard/transaction-list';
import { CategoryBreakdown } from '@/components/feature/dashboard/category-breakdown';

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      {/* Summary Cards */}
      <SummaryCards />
      
      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Transactions List */}
        <div className="col-span-4">
          <TransactionList />
        </div>
        
        {/* Category Breakdown */}
        <div className="col-span-3">
          <CategoryBreakdown />
        </div>
      </div>
    </div>
  );
}