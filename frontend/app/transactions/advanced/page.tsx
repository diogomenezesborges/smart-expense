'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  EyeOff,
  Upload,
  Download,
  Trash2,
  Edit3,
  Copy,
  Tag,
  Receipt,
  Brain,
  BarChart3,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Users,
  Camera,
  FileImage,
  Settings,
  Plus,
  Minus,
  X,
  Check,
  Loader2,
  Star,
  Target,
  Sparkles,
  PieChart,
  TrendingUpDown,
  Map,
  Calendar as CalendarIcon,
  ShoppingBag
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Transaction {
  id: string
  date: string
  description: string
  incomes: number | null
  outgoings: number | null
  category: {
    id: string
    majorCategory: string
    category: string
    subCategory: string
  }
  origin: {
    id: string
    name: string
  }
  bank: {
    id: string
    name: string
  }
  flow: 'ENTRADA' | 'SAIDA'
  isValidated: boolean
  aiConfidence: number
  notes: string | null
  month: string
  year: number
  tags?: string[]
  merchantName?: string
  location?: string
  receiptAttached?: boolean
  isDuplicate?: boolean
  duplicateScore?: number
  recurringPattern?: string
  businessExpense?: boolean
  taxCategory?: string
  splitWith?: string[]
}

interface BulkAction {
  type: 'categorize' | 'validate' | 'tag' | 'delete' | 'merge' | 'split'
  label: string
  icon: React.ReactNode
  description: string
  requiresInput?: boolean
  destructive?: boolean
}

interface SpendingPattern {
  pattern: string
  frequency: number
  averageAmount: number
  lastOccurrence: string
  confidence: number
  category: string
}

interface TransactionRule {
  id: string
  name: string
  conditions: {
    field: string
    operator: string
    value: string
  }[]
  actions: {
    type: string
    value: string
  }[]
  isActive: boolean
  createdDate: string
  lastTriggered?: string
  triggerCount: number
}

interface ReceiptData {
  merchantName: string
  amount: number
  date: string
  items: string[]
  taxAmount?: number
  tipAmount?: number
  paymentMethod?: string
}

export default function AdvancedTransactionsPage() {
  const [activeTab, setActiveTab] = useState('transactions')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [bulkActionOpen, setBulkActionOpen] = useState(false)
  const [ruleEngineOpen, setRuleEngineOpen] = useState(false)
  const [receiptScanOpen, setReceiptScanOpen] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [patterns, setPatterns] = useState<SpendingPattern[]>([])
  const [rules, setRules] = useState<TransactionRule[]>([])
  const [processingAI, setProcessingAI] = useState(false)

  // Mock data initialization
  useEffect(() => {
    loadMockData()
  }, [])

  const loadMockData = () => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        date: '2024-12-20',
        description: 'AMAZON.COM MARKETPLACE',
        incomes: null,
        outgoings: 89.99,
        category: {
          id: '1',
          majorCategory: 'Shopping',
          category: 'Online Shopping',
          subCategory: 'Electronics'
        },
        origin: { id: '1', name: 'Credit Card' },
        bank: { id: '1', name: 'Chase Bank' },
        flow: 'SAIDA',
        isValidated: true,
        aiConfidence: 0.98,
        notes: 'Wireless headphones',
        month: 'December',
        year: 2024,
        tags: ['electronics', 'personal'],
        merchantName: 'Amazon',
        location: 'Online',
        receiptAttached: true,
        isDuplicate: false,
        recurringPattern: 'irregular',
        businessExpense: false,
        taxCategory: 'personal'
      },
      {
        id: '2',
        date: '2024-12-19',
        description: 'STARBUCKS COFFEE #1234',
        incomes: null,
        outgoings: 5.75,
        category: {
          id: '2',
          majorCategory: 'Food',
          category: 'Coffee & Tea',
          subCategory: 'Coffee Shops'
        },
        origin: { id: '2', name: 'Debit Card' },
        bank: { id: '1', name: 'Chase Bank' },
        flow: 'SAIDA',
        isValidated: true,
        aiConfidence: 0.95,
        notes: 'Morning coffee',
        month: 'December',
        year: 2024,
        tags: ['coffee', 'daily'],
        merchantName: 'Starbucks',
        location: 'New York, NY',
        receiptAttached: false,
        isDuplicate: false,
        recurringPattern: 'daily',
        businessExpense: false,
        taxCategory: 'personal'
      },
      {
        id: '3',
        date: '2024-12-18',
        description: 'UBER TRIP 12/18',
        incomes: null,
        outgoings: 24.50,
        category: {
          id: '3',
          majorCategory: 'Transportation',
          category: 'Rideshare',
          subCategory: 'Uber'
        },
        origin: { id: '1', name: 'Credit Card' },
        bank: { id: '1', name: 'Chase Bank' },
        flow: 'SAIDA',
        isValidated: false,
        aiConfidence: 0.92,
        notes: null,
        month: 'December',
        year: 2024,
        tags: ['transport', 'work'],
        merchantName: 'Uber',
        location: 'Manhattan, NY',
        receiptAttached: false,
        isDuplicate: false,
        recurringPattern: 'irregular',
        businessExpense: true,
        taxCategory: 'business_transport'
      },
      {
        id: '4',
        date: '2024-12-17',
        description: 'NETFLIX MONTHLY',
        incomes: null,
        outgoings: 15.99,
        category: {
          id: '4',
          majorCategory: 'Entertainment',
          category: 'Streaming',
          subCategory: 'Video Streaming'
        },
        origin: { id: '1', name: 'Credit Card' },
        bank: { id: '1', name: 'Chase Bank' },
        flow: 'SAIDA',
        isValidated: true,
        aiConfidence: 0.99,
        notes: 'Monthly subscription',
        month: 'December',
        year: 2024,
        tags: ['subscription', 'entertainment'],
        merchantName: 'Netflix',
        location: 'Online',
        receiptAttached: false,
        isDuplicate: false,
        recurringPattern: 'monthly',
        businessExpense: false,
        taxCategory: 'personal'
      },
      {
        id: '5',
        date: '2024-12-16',
        description: 'SALARY DEPOSIT',
        incomes: 5500.00,
        outgoings: null,
        category: {
          id: '5',
          majorCategory: 'Income',
          category: 'Salary',
          subCategory: 'Regular Pay'
        },
        origin: { id: '3', name: 'Direct Deposit' },
        bank: { id: '1', name: 'Chase Bank' },
        flow: 'ENTRADA',
        isValidated: true,
        aiConfidence: 1.0,
        notes: 'Bi-weekly salary',
        month: 'December',
        year: 2024,
        tags: ['salary', 'income'],
        merchantName: 'TechCorp Inc',
        location: 'Direct Deposit',
        receiptAttached: false,
        isDuplicate: false,
        recurringPattern: 'bi-weekly',
        businessExpense: false,
        taxCategory: 'income'
      }
    ]

    const mockPatterns: SpendingPattern[] = [
      {
        pattern: 'Daily coffee purchases',
        frequency: 5,
        averageAmount: 5.75,
        lastOccurrence: '2024-12-19',
        confidence: 0.98,
        category: 'Food & Dining'
      },
      {
        pattern: 'Monthly subscription services',
        frequency: 12,
        averageAmount: 45.99,
        lastOccurrence: '2024-12-17',
        confidence: 0.95,
        category: 'Entertainment'
      },
      {
        pattern: 'Weekend grocery shopping',
        frequency: 8,
        averageAmount: 125.50,
        lastOccurrence: '2024-12-15',
        confidence: 0.89,
        category: 'Groceries'
      }
    ]

    const mockRules: TransactionRule[] = [
      {
        id: '1',
        name: 'Auto-categorize Starbucks',
        conditions: [
          { field: 'description', operator: 'contains', value: 'STARBUCKS' }
        ],
        actions: [
          { type: 'category', value: 'Coffee & Tea' },
          { type: 'tag', value: 'coffee' }
        ],
        isActive: true,
        createdDate: '2024-11-01',
        lastTriggered: '2024-12-19',
        triggerCount: 45
      },
      {
        id: '2',
        name: 'Flag large transactions',
        conditions: [
          { field: 'amount', operator: 'greater_than', value: '500' }
        ],
        actions: [
          { type: 'flag', value: 'review_required' },
          { type: 'validate', value: 'false' }
        ],
        isActive: true,
        createdDate: '2024-10-15',
        lastTriggered: '2024-12-10',
        triggerCount: 12
      }
    ]

    setTransactions(mockTransactions)
    setPatterns(mockPatterns)
    setRules(mockRules)
    setLoading(false)
  }

  const bulkActions: BulkAction[] = [
    {
      type: 'categorize',
      label: 'Bulk Categorize',
      icon: <Tag className="h-4 w-4" />,
      description: 'Apply category to selected transactions',
      requiresInput: true
    },
    {
      type: 'validate',
      label: 'Mark as Validated',
      icon: <CheckCircle className="h-4 w-4" />,
      description: 'Validate selected transactions'
    },
    {
      type: 'tag',
      label: 'Add Tags',
      icon: <Tag className="h-4 w-4" />,
      description: 'Add tags to selected transactions',
      requiresInput: true
    },
    {
      type: 'split',
      label: 'Split Transaction',
      icon: <Copy className="h-4 w-4" />,
      description: 'Split transaction among multiple categories'
    },
    {
      type: 'merge',
      label: 'Merge Duplicates',
      icon: <Target className="h-4 w-4" />,
      description: 'Merge duplicate transactions'
    },
    {
      type: 'delete',
      label: 'Delete Selected',
      icon: <Trash2 className="h-4 w-4" />,
      description: 'Permanently delete selected transactions',
      destructive: true
    }
  ]

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(transactions.map(t => t.id))
    } else {
      setSelectedTransactions([])
    }
  }

  const handleSelectTransaction = (transactionId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions(prev => [...prev, transactionId])
    } else {
      setSelectedTransactions(prev => prev.filter(id => id !== transactionId))
    }
  }

  const runAIAnalysis = async () => {
    setProcessingAI(true)
    // Simulate AI processing
    setTimeout(() => {
      setProcessingAI(false)
      // Mock AI results
      const aiSuggestions = {
        duplicatesFound: 2,
        categorizationSuggestions: 8,
        anomaliesDetected: 1,
        patternsIdentified: 5
      }
      console.log('AI Analysis Complete:', aiSuggestions)
    }, 3000)
  }

  const processBulkAction = (action: BulkAction) => {
    console.log(`Processing ${action.type} for ${selectedTransactions.length} transactions`)
    setBulkActionOpen(false)
    setSelectedTransactions([])
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Transaction Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  AI-powered transaction processing with advanced analytics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setReceiptScanOpen(true)}>
                <Receipt className="h-4 w-4 mr-2" />
                Scan Receipt
              </Button>
              <Button variant="outline" onClick={() => setRuleEngineOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Rules Engine
              </Button>
              <Button onClick={runAIAnalysis} disabled={processingAI}>
                {processingAI ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                AI Analysis
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <Card className="p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{transactions.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {transactions.filter(t => t.isValidated).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Validated</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {transactions.filter(t => t.isDuplicate).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Duplicates</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <Receipt className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {transactions.filter(t => t.receiptAttached).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">With Receipts</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-indigo-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(transactions.reduce((acc, t) => acc + t.aiConfidence, 0) / transactions.length * 100)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg AI Score</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="transactions">Smart Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="rules">Automation</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
          </TabsList>

          {/* Smart Transactions Tab */}
          <TabsContent value="transactions">
            <div className="space-y-6">
              {/* Bulk Actions Bar */}
              {selectedTransactions.length > 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          {selectedTransactions.length} transaction{selectedTransactions.length > 1 ? 's' : ''} selected
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTransactions([])}
                        >
                          Clear Selection
                        </Button>
                      </div>
                      <Dialog open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Zap className="h-4 w-4 mr-2" />
                            Bulk Actions
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Bulk Actions</DialogTitle>
                            <DialogDescription>
                              Apply actions to {selectedTransactions.length} selected transactions
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-2">
                            {bulkActions.map((action) => (
                              <Button
                                key={action.type}
                                variant={action.destructive ? "destructive" : "outline"}
                                className="w-full justify-start"
                                onClick={() => processBulkAction(action)}
                              >
                                {action.icon}
                                <div className="ml-2 text-left">
                                  <div className="font-medium">{action.label}</div>
                                  <div className="text-xs text-muted-foreground">{action.description}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Transaction Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>AI-Enhanced Transactions</span>
                    <div className="flex items-center space-x-2">
                      {processingAI && (
                        <div className="flex items-center text-sm text-blue-600">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          AI Processing...
                        </div>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedTransactions.length === transactions.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>AI Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Features</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTransactions.includes(transaction.id)}
                              onCheckedChange={(checked) => 
                                handleSelectTransaction(transaction.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          
                          <TableCell>
                            <div className="font-medium">{formatDate(transaction.date)}</div>
                            {transaction.recurringPattern && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {transaction.recurringPattern}
                              </Badge>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <div className="font-medium">{transaction.description}</div>
                            {transaction.merchantName && (
                              <div className="text-sm text-muted-foreground">
                                {transaction.merchantName}
                              </div>
                            )}
                            {transaction.location && (
                              <div className="text-xs text-muted-foreground flex items-center">
                                <Map className="h-3 w-3 mr-1" />
                                {transaction.location}
                              </div>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <div className={`font-semibold ${
                              transaction.flow === 'ENTRADA' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.flow === 'ENTRADA' ? '+' : '-'}
                              {formatCurrency(transaction.incomes || transaction.outgoings || 0)}
                            </div>
                            {transaction.businessExpense && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Business
                              </Badge>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <div className="font-medium">{transaction.category.category}</div>
                            <div className="text-sm text-muted-foreground">{transaction.category.subCategory}</div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={transaction.aiConfidence * 100} className="h-2 w-16" />
                              <span className="text-sm font-medium">
                                {Math.round(transaction.aiConfidence * 100)}%
                              </span>
                            </div>
                            {transaction.aiConfidence < 0.8 && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                Low Confidence
                              </Badge>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <Badge variant={transaction.isValidated ? 'default' : 'secondary'}>
                                {transaction.isValidated ? 'Validated' : 'Pending'}
                              </Badge>
                              {transaction.isDuplicate && (
                                <Badge variant="destructive" className="text-xs">
                                  Duplicate
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {transaction.receiptAttached && (
                                <Badge variant="outline" className="text-xs">
                                  <Receipt className="h-3 w-3 mr-1" />
                                  Receipt
                                </Badge>
                              )}
                              {transaction.tags && transaction.tags.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {transaction.tags.length}
                                </Badge>
                              )}
                              {transaction.splitWith && transaction.splitWith.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <Users className="h-3 w-3 mr-1" />
                                  Split
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button variant="outline" size="sm">
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Spending Velocity Analysis
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Daily Average</span>
                    <span className="font-medium">€127.50</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Trend</span>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="font-medium text-green-600">+12%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Projection</span>
                    <span className="font-medium">€3,825</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Category Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Food & Dining</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={35} className="h-2 w-16" />
                      <span className="text-sm font-medium">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transportation</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={25} className="h-2 w-16" />
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Shopping</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={20} className="h-2 w-16" />
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Entertainment</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={20} className="h-2 w-16" />
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  AI-Generated Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">Opportunity</span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      You could save €45/month by switching to a different coffee subscription service.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-orange-900 dark:text-orange-100">Warning</span>
                    </div>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Your rideshare spending is 40% higher than last month.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900 dark:text-green-100">Achievement</span>
                    </div>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      You're on track to meet your grocery budget this month!
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-900 dark:text-purple-100">Recommendation</span>
                    </div>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Consider using a rewards credit card for gas purchases.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUpDown className="h-5 w-5 mr-2" />
                    Spending Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patterns.map((pattern, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{pattern.pattern}</h4>
                          <Badge variant="outline">
                            {Math.round(pattern.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                            <div className="font-medium">{pattern.frequency} times/month</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Average Amount:</span>
                            <div className="font-medium">{formatCurrency(pattern.averageAmount)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Category:</span>
                            <div className="font-medium">{pattern.category}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Last Occurrence:</span>
                            <div className="font-medium">{formatDate(pattern.lastOccurrence)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Automation Rules
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Rule
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rules.map((rule) => (
                      <div key={rule.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{rule.name}</h4>
                            <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Conditions:</span>
                            <div className="font-medium">
                              {rule.conditions.map((cond, i) => (
                                <div key={i}>
                                  {cond.field} {cond.operator} "{cond.value}"
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Actions:</span>
                            <div className="font-medium">
                              {rule.actions.map((action, i) => (
                                <div key={i}>
                                  {action.type}: {action.value}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Triggered:</span>
                            <div className="font-medium">{rule.triggerCount} times</div>
                            {rule.lastTriggered && (
                              <div className="text-xs text-gray-500">
                                Last: {formatDate(rule.lastTriggered)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Receipts Tab */}
          <TabsContent value="receipts">
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Receipt Management Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Scan, store, and manage receipts with OCR technology.
              </p>
              <Button>
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}