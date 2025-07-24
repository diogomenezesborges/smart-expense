'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  SortAsc, 
  SortDesc, 
  RotateCcw,
  ChevronDown,
  FileText,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff
} from 'lucide-react';
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

interface TransactionFilters {
  searchTerm: string;
  dateRange: {
    start: string;
    end: string;
  };
  categories: string[];
  origins: string[];
  banks: string[];
  flow: 'all' | 'ENTRADA' | 'SAIDA';
  amountRange: {
    min: number | null;
    max: number | null;
  };
  validationStatus: 'all' | 'validated' | 'pending';
  aiConfidenceRange: {
    min: number;
    max: number;
  };
  hasNotes: 'all' | 'with_notes' | 'without_notes';
}

interface SortConfig {
  field: keyof Transaction | 'amount';
  direction: 'asc' | 'desc';
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction>>({});
  
  // Search and Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    searchTerm: '',
    dateRange: {
      start: '',
      end: ''
    },
    categories: [],
    origins: [],
    banks: [],
    flow: 'all',
    amountRange: {
      min: null,
      max: null
    },
    validationStatus: 'all',
    aiConfidenceRange: {
      min: 0,
      max: 100
    },
    hasNotes: 'all'
  });
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'date',
    direction: 'desc'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  // Filter and search logic
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matches = [
          transaction.description.toLowerCase(),
          transaction.category.category.toLowerCase(),
          transaction.category.subCategory.toLowerCase(),
          transaction.origin.name.toLowerCase(),
          transaction.bank.name.toLowerCase(),
          transaction.notes?.toLowerCase() || ''
        ].some(field => field.includes(searchLower));
        
        if (!matches) return false;
      }
      
      // Date range filter
      if (filters.dateRange.start) {
        if (new Date(transaction.date) < new Date(filters.dateRange.start)) return false;
      }
      if (filters.dateRange.end) {
        if (new Date(transaction.date) > new Date(filters.dateRange.end)) return false;
      }
      
      // Category filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(transaction.category.id)) return false;
      }
      
      // Origin filter
      if (filters.origins.length > 0) {
        if (!filters.origins.includes(transaction.origin.id)) return false;
      }
      
      // Bank filter
      if (filters.banks.length > 0) {
        if (!filters.banks.includes(transaction.bank.id)) return false;
      }
      
      // Flow filter
      if (filters.flow !== 'all') {
        if (transaction.flow !== filters.flow) return false;
      }
      
      // Amount range filter
      const amount = transaction.incomes || transaction.outgoings || 0;
      if (filters.amountRange.min !== null && amount < filters.amountRange.min) return false;
      if (filters.amountRange.max !== null && amount > filters.amountRange.max) return false;
      
      // Validation status filter
      if (filters.validationStatus === 'validated' && !transaction.isValidated) return false;
      if (filters.validationStatus === 'pending' && transaction.isValidated) return false;
      
      // AI confidence filter
      const aiConfidencePercent = transaction.aiConfidence * 100;
      if (aiConfidencePercent < filters.aiConfidenceRange.min || aiConfidencePercent > filters.aiConfidenceRange.max) return false;
      
      // Notes filter
      if (filters.hasNotes === 'with_notes' && !transaction.notes) return false;
      if (filters.hasNotes === 'without_notes' && transaction.notes) return false;
      
      return true;
    });
    
    // Sort filtered results
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortConfig.field) {
        case 'amount':
          aValue = a.incomes || a.outgoings || 0;
          bValue = b.incomes || b.outgoings || 0;
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'aiConfidence':
          aValue = a.aiConfidence;
          bValue = b.aiConfidence;
          break;
        default:
          aValue = a[sortConfig.field];
          bValue = b[sortConfig.field];
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [transactions, filters, sortConfig]);
  
  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortConfig]);

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
  
  const handleSort = (field: keyof Transaction | 'amount') => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      dateRange: { start: '', end: '' },
      categories: [],
      origins: [],
      banks: [],
      flow: 'all',
      amountRange: { min: null, max: null },
      validationStatus: 'all',
      aiConfidenceRange: { min: 0, max: 100 },
      hasNotes: 'all'
    });
    setSortConfig({ field: 'date', direction: 'desc' });
  };
  
  const updateFilter = (key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const toggleArrayFilter = (key: 'categories' | 'origins' | 'banks', value: string) => {
    setFilters(prev => {
      const currentArray = prev[key];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  };
  
  const getSortIcon = (field: keyof Transaction | 'amount') => {
    if (sortConfig.field !== field) return <ChevronDown className="h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <SortAsc className="h-4 w-4" /> 
      : <SortDesc className="h-4 w-4" />;
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.categories.length > 0) count++;
    if (filters.origins.length > 0) count++;
    if (filters.banks.length > 0) count++;
    if (filters.flow !== 'all') count++;
    if (filters.amountRange.min !== null || filters.amountRange.max !== null) count++;
    if (filters.validationStatus !== 'all') count++;
    if (filters.aiConfidenceRange.min > 0 || filters.aiConfidenceRange.max < 100) count++;
    if (filters.hasNotes !== 'all') count++;
    return count;
  };

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
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            {filteredAndSortedTransactions.length} of {transactions.length} transactions
            {getActiveFiltersCount() > 0 && ` • ${getActiveFiltersCount()} filter${getActiveFiltersCount() > 1 ? 's' : ''} active`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
          {getActiveFiltersCount() > 0 && (
            <Button variant="outline" onClick={clearFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
          <Button onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions by description, category, origin, bank, or notes..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Filters</TabsTrigger>
                <TabsTrigger value="categories">Categories & Sources</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                        placeholder="Start date"
                      />
                      <Input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                        placeholder="End date"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Transaction Type</Label>
                    <Select value={filters.flow} onValueChange={(value: any) => updateFilter('flow', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Transactions</SelectItem>
                        <SelectItem value="ENTRADA">Income Only</SelectItem>
                        <SelectItem value="SAIDA">Expenses Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Validation Status</Label>
                    <Select value={filters.validationStatus} onValueChange={(value: any) => updateFilter('validationStatus', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="validated">Validated Only</SelectItem>
                        <SelectItem value="pending">Pending Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount Range (€)</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={filters.amountRange.min?.toString() || ''}
                        onChange={(e) => updateFilter('amountRange', { 
                          ...filters.amountRange, 
                          min: e.target.value ? parseFloat(e.target.value) : null 
                        })}
                        placeholder="Min amount"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={filters.amountRange.max?.toString() || ''}
                        onChange={(e) => updateFilter('amountRange', { 
                          ...filters.amountRange, 
                          max: e.target.value ? parseFloat(e.target.value) : null 
                        })}
                        placeholder="Max amount"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notes Filter</Label>
                    <Select value={filters.hasNotes} onValueChange={(value: any) => updateFilter('hasNotes', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Transactions</SelectItem>
                        <SelectItem value="with_notes">With Notes</SelectItem>
                        <SelectItem value="without_notes">Without Notes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Categories</Label>
                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={filters.categories.includes(category.id)}
                            onCheckedChange={() => toggleArrayFilter('categories', category.id)}
                          />
                          <Label htmlFor={`category-${category.id}`} className="text-sm flex-1 cursor-pointer">
                            <div className="font-medium">{category.category}</div>
                            <div className="text-xs text-muted-foreground">{category.subCategory}</div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Origins</Label>
                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
                      {origins.map((origin) => (
                        <div key={origin.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`origin-${origin.id}`}
                            checked={filters.origins.includes(origin.id)}
                            onCheckedChange={() => toggleArrayFilter('origins', origin.id)}
                          />
                          <Label htmlFor={`origin-${origin.id}`} className="text-sm flex-1 cursor-pointer">
                            {origin.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Banks</Label>
                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
                      {banks.map((bank) => (
                        <div key={bank.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`bank-${bank.id}`}
                            checked={filters.banks.includes(bank.id)}
                            onCheckedChange={() => toggleArrayFilter('banks', bank.id)}
                          />
                          <Label htmlFor={`bank-${bank.id}`} className="text-sm flex-1 cursor-pointer">
                            {bank.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>AI Confidence Range (%)</Label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={filters.aiConfidenceRange.min}
                          onChange={(e) => updateFilter('aiConfidenceRange', { 
                            ...filters.aiConfidenceRange, 
                            min: parseInt(e.target.value) || 0 
                          })}
                          placeholder="Min %"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={filters.aiConfidenceRange.max}
                          onChange={(e) => updateFilter('aiConfidenceRange', { 
                            ...filters.aiConfidenceRange, 
                            max: parseInt(e.target.value) || 100 
                          })}
                          placeholder="Max %"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Current range: {filters.aiConfidenceRange.min}% - {filters.aiConfidenceRange.max}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Items per page</Label>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 per page</SelectItem>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="25">25 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {/* Quick Filter Stats */}
      {getActiveFiltersCount() > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">Active Filters:</span>
                {filters.searchTerm && (
                  <Badge variant="secondary">Search: "{filters.searchTerm}"</Badge>
                )}
                {filters.flow !== 'all' && (
                  <Badge variant="secondary">
                    {filters.flow === 'ENTRADA' ? 'Income' : 'Expenses'}
                  </Badge>
                )}
                {filters.categories.length > 0 && (
                  <Badge variant="secondary">{filters.categories.length} Categories</Badge>
                )}
                {filters.validationStatus !== 'all' && (
                  <Badge variant="secondary">
                    {filters.validationStatus === 'validated' ? 'Validated' : 'Pending'}
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground">
                Showing {filteredAndSortedTransactions.length} results
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction Records</span>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{filteredAndSortedTransactions.length} transactions</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Date</span>
                    {getSortIcon('date')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>Description</span>
                    {getSortIcon('description')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Amount</span>
                    {getSortIcon('amount')}
                  </div>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Status</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => handleSort('aiConfidence')}
                >
                  <div className="flex items-center space-x-1">
                    <span>AI Score</span>
                    {getSortIcon('aiConfidence')}
                  </div>
                </TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
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
          
          {filteredAndSortedTransactions.length === 0 && transactions.length > 0 && (
            <div className="text-center py-8 space-y-3">
              <div className="text-muted-foreground">No transactions match your current filters</div>
              <Button variant="outline" onClick={clearFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          )}
          
          {transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    const isCurrentPage = page === currentPage;
                    return (
                      <Button
                        key={page}
                        variant={isCurrentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-muted-foreground px-2">...</span>
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}