// Re-export all types for easy importing
export * from './transaction';
export * from './database';

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Frontend component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form types
export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Dashboard metrics
export interface DashboardMetrics {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  lastUpdated: Date;
  topCategories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}

// Settings types
export interface UserSettings {
  currency: string;
  dateFormat: string;
  timeZone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    shareData: boolean;
    analytics: boolean;
  };
  categorization: {
    autoApprove: boolean;
    confidenceThreshold: number;
  };
}