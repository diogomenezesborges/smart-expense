import { SummaryCards } from '@/components/feature/dashboard/summary-cards';
import { TransactionList } from '@/components/feature/dashboard/transaction-list';
import { CategoryBreakdown } from '@/components/feature/dashboard/category-breakdown';

export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Test</h1>
      
      <div className="space-y-8">
        {/* Summary Cards */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Summary Cards</h2>
          <SummaryCards />
        </section>
        
        {/* Transaction List and Category Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <section>
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <TransactionList />
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
            <CategoryBreakdown />
          </section>
        </div>
      </div>
    </div>
  );
}