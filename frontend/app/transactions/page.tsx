'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Transaction {
  id: string;
  date: string;
  description: string;
  incomes: number | null;
  outgoings: number | null;
  category: {
    id: string;
    majorCategory: string;
    category: string;
    subCategory: string;
  };
  origin: {
    id: string;
    name: string;
  };
  bank: {
    id: string;
    name: string;
  };
  flow: 'ENTRADA' | 'SAIDA';
  isValidated: boolean;
  aiConfidence: number;
  notes: string | null;
  month: string;
  year: number;
}

interface Category {
  id: string;
  majorCategory: string;
  category: string;
  subCategory: string;
}

interface Origin {
  id: string;
  name: string;
}

interface Bank {
  id: string;
  name: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction>>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [transactionsRes, categoriesRes, originsRes, banksRes] = await Promise.all([
        fetch('/api/transactions-simple'),
        fetch('/api/categories'),
        fetch('/api/origins'),
        fetch('/api/banks'),
      ]);

      const [transactionsData, categoriesData, originsData, banksData] = await Promise.all([
        transactionsRes.json(),
        categoriesRes.json(),
        originsRes.json(),
        banksRes.json(),
      ]);

      setTransactions(transactionsData.transactions || []);
      setCategories(categoriesData.data || []);
      setOrigins(originsData.data || []);
      setBanks(banksData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setEditData({
      description: transaction.description,
      incomes: transaction.incomes,
      outgoings: transaction.outgoings,
      categoryId: transaction.category.id,
      originId: transaction.origin.id,
      bankId: transaction.bank.id,
      notes: transaction.notes,
      isValidated: transaction.isValidated,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
  }

  async function saveEdit() {
    if (!editingId) return;
    
    try {
      const response = await fetch(`/api/transactions/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        await fetchData(); // Refresh data
        setEditingId(null);
        setEditData({});
      } else {
        console.error('Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  }

  async function deleteTransaction(id: string) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      } else {
        console.error('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading transactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <Button onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Records ({transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>AI Score</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {formatDate(transaction.date)}
                  </TableCell>
                  
                  <TableCell className="max-w-xs">
                    {editingId === transaction.id ? (
                      <Input
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="w-full"
                      />
                    ) : (
                      <div className="truncate" title={transaction.description}>
                        {transaction.description}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingId === transaction.id ? (
                      <div className="space-y-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Income"
                          value={editData.incomes?.toString() || ''}
                          onChange={(e) => setEditData({ ...editData, incomes: e.target.value ? parseFloat(e.target.value) : null })}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Expense"
                          value={editData.outgoings?.toString() || ''}
                          onChange={(e) => setEditData({ ...editData, outgoings: e.target.value ? parseFloat(e.target.value) : null })}
                        />
                      </div>
                    ) : (
                      <div className={`font-semibold ${
                        transaction.flow === 'ENTRADA' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.flow === 'ENTRADA' ? '+' : '-'}
                        {formatCurrency(transaction.incomes || transaction.outgoings || 0)}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingId === transaction.id ? (
                      <Select
                        value={editData.categoryId || ''}
                        onChange={(e) => setEditData({ ...editData, categoryId: e.target.value })}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.category} → {cat.subCategory}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <div className="text-sm">
                        <div className="font-medium">{transaction.category.category}</div>
                        <div className="text-muted-foreground">{transaction.category.subCategory}</div>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingId === transaction.id ? (
                      <Select
                        value={editData.originId || ''}
                        onChange={(e) => setEditData({ ...editData, originId: e.target.value })}
                      >
                        <option value="">Select Origin</option>
                        {origins.map((origin) => (
                          <option key={origin.id} value={origin.id}>
                            {origin.name}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      transaction.origin.name
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingId === transaction.id ? (
                      <Select
                        value={editData.bankId || ''}
                        onChange={(e) => setEditData({ ...editData, bankId: e.target.value })}
                      >
                        <option value="">Select Bank</option>
                        {banks.map((bank) => (
                          <option key={bank.id} value={bank.id}>
                            {bank.name}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      transaction.bank.name
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingId === transaction.id ? (
                      <Select
                        value={editData.isValidated?.toString() || 'false'}
                        onChange={(e) => setEditData({ ...editData, isValidated: e.target.value === 'true' })}
                      >
                        <option value="false">Pending</option>
                        <option value="true">Validated</option>
                      </Select>
                    ) : (
                      <Badge variant={transaction.isValidated ? 'success' : 'warning'}>
                        {transaction.isValidated ? 'Validated' : 'Pending'}
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-center">
                      {Math.round(transaction.aiConfidence * 100)}%
                    </div>
                  </TableCell>
                  
                  <TableCell className="max-w-xs">
                    {editingId === transaction.id ? (
                      <Input
                        value={editData.notes || ''}
                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                        placeholder="Add notes..."
                      />
                    ) : (
                      <div className="truncate" title={transaction.notes || ''}>
                        {transaction.notes || '-'}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editingId === transaction.id ? (
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={saveEdit}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(transaction)}>
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteTransaction(transaction.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}