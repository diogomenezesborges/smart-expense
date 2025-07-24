'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Transaction {
  id: string;
  date: string;
  description: string;
  incomes: string | null;
  outgoings: string | null;
  category: {
    majorCategory: string;
    category: string;
    subCategory: string;
  };
  origin: {
    name: string;
  };
  bank: {
    name: string;
  };
  flow: 'ENTRADA' | 'SAIDA';
  isValidated: boolean;
  aiConfidence: number;
}

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
}

export default function WorkingDashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [transactionsRes, summaryRes] = await Promise.all([
          fetch('/api/transactions-simple'),
          fetch('/api/analytics/summary-simple')
        ]);

        const transactionsData = await transactionsRes.json();
        const summaryData = await summaryRes.json();

        setTransactions(transactionsData.transactions || []);
        setSummary(summaryData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
        <h1>Loading dashboard...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '1200px' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>SmartExpense Dashboard</h1>
        <nav>
          <a href="/" style={{ color: '#3498db', marginRight: '15px' }}>Home</a>
          <a href="/transactions" style={{ color: '#3498db', marginRight: '15px' }}>Edit Transactions</a>
          <a href="/api-test" style={{ color: '#3498db' }}>API Test</a>
        </nav>
      </header>

      {/* Summary Cards */}
      {summary && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #e9ecef' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6c757d', fontSize: '14px' }}>Total Income</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {formatCurrency(summary.totalIncome)}
            </div>
          </div>
          
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #e9ecef' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6c757d', fontSize: '14px' }}>Total Expenses</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
              {formatCurrency(summary.totalExpenses)}
            </div>
          </div>
          
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #e9ecef' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6c757d', fontSize: '14px' }}>Net Amount</h3>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: summary.netAmount >= 0 ? '#28a745' : '#dc3545' 
            }}>
              {formatCurrency(summary.netAmount)}
            </div>
          </div>
          
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #e9ecef' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#6c757d', fontSize: '14px' }}>Transactions</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {summary.transactionCount}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div style={{ 
        background: '#fff', 
        border: '1px solid #e9ecef', 
        borderRadius: '8px', 
        overflow: 'hidden' 
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e9ecef' }}>
          <h2 style={{ margin: 0 }}>Recent Transactions ({transactions.length})</h2>
        </div>
        
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e9ecef' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Category</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Origin</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((transaction, index) => (
                <tr key={transaction.id} style={{ 
                  background: index % 2 === 0 ? '#fff' : '#f8f9fa' 
                }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef' }}>
                    {formatDate(transaction.date)}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef' }}>
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {transaction.description}
                    </div>
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right', 
                    borderBottom: '1px solid #e9ecef',
                    fontWeight: 'bold',
                    color: transaction.flow === 'ENTRADA' ? '#28a745' : '#dc3545'
                  }}>
                    {transaction.flow === 'ENTRADA' ? '+' : '-'}
                    {formatCurrency(parseFloat(transaction.incomes || transaction.outgoings || '0'))}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef' }}>
                    <div style={{ fontSize: '13px' }}>
                      <div>{transaction.category.category}</div>
                      <div style={{ color: '#6c757d' }}>{transaction.category.subCategory}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef' }}>
                    {transaction.origin.name}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                    <span style={{ 
                      background: transaction.isValidated ? '#d4edda' : '#fff3cd',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {transaction.isValidated ? '✓' : '⏳'} {Math.round(transaction.aiConfidence * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e8', borderRadius: '4px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>✅ Dashboard Status</h3>
        <p style={{ margin: 0 }}>
          This dashboard is using the working APIs and shows your real data: 
          €{summary?.totalIncome.toLocaleString()} income, €{summary?.totalExpenses.toFixed(2)} expenses, 
          €{summary?.netAmount.toFixed(2)} net with {transactions.length} transactions.
        </p>
      </div>
    </div>
  );
}