import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Custom matchers and utilities
export const createMockFinancialContext = () => ({
  userId: 'test-user-123',
  totalIncome: 3500,
  totalExpenses: 2800,
  categories: {
    byMajorCategory: {
      'Housing': 950,
      'Food & Dining': 980,
      'Transportation': 340,
      'Entertainment & Lifestyle': 350,
      'Healthcare': 150,
      'Shopping': 30
    },
    byCategory: {
      'Bills & Utilities': 950,
      'Groceries': 460,
      'Restaurants': 520,
      'Car Expenses': 180,
      'Public Transport': 160,
      'Entertainment': 200,
      'Personal Care': 150,
      'Healthcare': 150,
      'Shopping': 30
    },
    bySubCategory: {
      'Electricity': 320,
      'Water': 180,
      'Internet': 450,
      'Supermarket': 460,
      'Restaurants': 420,
      'Take-away': 100,
      'Fuel': 120,
      'Car Maintenance': 60,
      'Metro/Bus': 160,
      'Movies': 80,
      'Sports': 70,
      'Streaming': 50,
      'Pharmacy': 80,
      'Medical': 70,
      'Clothing': 30
    },
    hierarchy: [
      { majorCategory: 'Food & Dining', category: 'Groceries', subCategory: 'Supermarket', amount: 460, percentage: 16.4 },
      { majorCategory: 'Housing', category: 'Bills & Utilities', subCategory: 'Internet', amount: 450, percentage: 16.1 },
      { majorCategory: 'Food & Dining', category: 'Restaurants', subCategory: 'Restaurants', amount: 420, percentage: 15.0 },
    ]
  },
  spendingByOrigin: {
    'Comum': 1680,
    'Diogo': 700,
    'Joana': 420
  },
  transactionPatterns: {
    totalTransactions: 127,
    averageTransactionSize: 22.05,
    recurringTransactions: [
      { description: 'Supermarket Continente', amount: 120, frequency: 'weekly' as const, category: 'Groceries', origin: 'Comum' },
      { description: 'Metro Card Top-up', amount: 40, frequency: 'monthly' as const, category: 'Public Transport', origin: 'Diogo' },
    ],
    unusualTransactions: [
      { id: 'tx_001', description: 'Electronics Store - Laptop', amount: 899, date: '2024-01-15', reason: 'high_amount' as const },
    ]
  },
  goals: [
    {
      id: '1',
      name: 'Emergency Fund',
      target: 5000,
      current: 3200,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      category: 'Savings',
      priority: 'high' as const
    }
  ],
  budgetComparison: {
    planned: {
      'Food & Dining': 800,
      'Housing': 900,
      'Transportation': 300,
      'Entertainment': 200
    },
    actual: {
      'Food & Dining': 980,
      'Housing': 950,
      'Transportation': 340,
      'Entertainment': 200
    },
    variance: {
      'Food & Dining': 180,
      'Housing': 50,
      'Transportation': 40,
      'Entertainment': 0
    }
  },
  timeframe: '1month' as const,
  currency: 'EUR' as const,
  analysisDate: new Date().toISOString()
})

export const createMockTransaction = (overrides = {}) => ({
  id: 'tx-123',
  date: '2024-01-15',
  description: 'Test Transaction',
  incomes: null,
  outgoings: 100,
  category: {
    id: 'cat-1',
    majorCategory: 'CUSTOS_VARIAVEIS',
    category: 'Food & Dining',
    subCategory: 'Groceries'
  },
  origin: {
    id: 'org-1',
    name: 'Comum'
  },
  bank: {
    id: 'bank-1',
    name: 'Test Bank'
  },
  flow: 'SAIDA' as const,
  isValidated: true,
  aiConfidence: 0.95,
  notes: 'Test notes',
  month: 'JANUARY',
  year: 2024,
  ...overrides
})

export const createMockCategory = (overrides = {}) => ({
  id: 'cat-1',
  majorCategory: 'CUSTOS_VARIAVEIS',
  category: 'Food & Dining',
  subCategory: 'Groceries',
  ...overrides
})

export const createMockOrigin = (overrides = {}) => ({
  id: 'org-1',
  name: 'Comum',
  ...overrides
})

export const createMockBank = (overrides = {}) => ({
  id: 'bank-1',
  name: 'Test Bank',
  ...overrides
})

// Mock fetch for API testing
export const mockFetch = (response: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
    })
  ) as jest.Mock
}

// Async utilities for testing
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}