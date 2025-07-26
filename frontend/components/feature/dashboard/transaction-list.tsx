'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Transaction {
  id: string;
  date: string;
  description: string;
  incomes: number | null;
  outgoings: number | null;
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

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch('/api/transactions-simple');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading transactions...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{transaction.description}</h4>
                    <Badge
                      variant={transaction.flow === 'ENTRADA' ? 'success' : 'secondary'}
                    >
                      {transaction.flow === 'ENTRADA' ? 'Income' : 'Expense'}
                    </Badge>
                    {!transaction.isValidated && (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(transaction.date)} • {transaction.origin.name} • {transaction.bank.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.category.category} → {transaction.category.subCategory}
                  </div>
                  {transaction.aiConfidence < 0.9 && (
                    <div className="text-xs text-yellow-600">
                      AI Confidence: {Math.round(transaction.aiConfidence * 100)}%
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      transaction.flow === 'ENTRADA'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.flow === 'ENTRADA' ? '+' : '-'}
                    {formatCurrency(transaction.incomes || transaction.outgoings || 0)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}