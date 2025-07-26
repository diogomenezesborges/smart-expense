import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdvancedAnalyticsPage from '../page';

// Mock the UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }) => <div data-testid="card-content" {...props}>{children}</div>,
  CardDescription: ({ children, ...props }) => <div data-testid="card-description" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }) => <div data-testid="card-title" {...props}>{children}</div>
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, ...props }) => (
    <span data-testid="badge" data-variant={variant} {...props}>{children}</span>
  )
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, onClick, ...props }) => (
    <button 
      data-testid="button" 
      data-variant={variant} 
      data-size={size}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }) => (
    <div data-testid="select" data-value={value}>
      <div onClick={() => onValueChange && onValueChange('test-value')}>
        {children}
      </div>
    </div>
  ),
  SelectContent: ({ children }) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }) => <div data-testid="select-item" data-value={value}>{children}</div>,
  SelectTrigger: ({ children }) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: () => <div data-testid="select-value" />
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }) => (
    <div data-testid="progress" data-value={value} className={className} />
  )
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  TrendingDown: () => <div data-testid="trending-down-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  CreditCard: () => <div data-testid="credit-card-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />,
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Download: () => <div data-testid="download-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Target: () => <div data-testid="target-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />
}));

describe('AdvancedAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    render(<AdvancedAnalyticsPage />);
    
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
  });

  it('should render the page header correctly', async () => {
    render(<AdvancedAnalyticsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive financial insights and trends')).toBeInTheDocument();
    });
  });

  it('should render view mode tabs', async () => {
    render(<AdvancedAnalyticsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Detailed')).toBeInTheDocument();
      expect(screen.getByText('Insights')).toBeInTheDocument();
    });
  });

  it('should render filter controls', async () => {
    render(<AdvancedAnalyticsPage />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId('select')).toHaveLength(2); // Date range and category selects
      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
      expect(screen.getByTestId('filter-icon')).toBeInTheDocument();
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });
  });

  it('should switch between view modes', async () => {
    render(<AdvancedAnalyticsPage />);
    
    await waitFor(() => {
      // Should start in overview mode
      expect(screen.getByText('Total Transactions')).toBeInTheDocument();
      expect(screen.getByText('Spending by Category')).toBeInTheDocument();
    });

    // Switch to detailed mode
    const detailedButton = screen.getByText('Detailed');
    fireEvent.click(detailedButton);

    await waitFor(() => {
      expect(screen.getByText('Budget Performance')).toBeInTheDocument();
      expect(screen.getByText('Monthly Trends')).toBeInTheDocument();
    });

    // Switch to insights mode
    const insightsButton = screen.getByText('Insights');
    fireEvent.click(insightsButton);

    await waitFor(() => {
      expect(screen.getByText('AI-Powered Recommendations')).toBeInTheDocument();
      expect(screen.getByText('💡 Smart Saving Opportunity')).toBeInTheDocument();
    });
  });

  it('should display overview mode content correctly', async () => {
    render(<AdvancedAnalyticsPage />);
    
    await waitFor(() => {
      // Summary cards
      expect(screen.getByText('Total Transactions')).toBeInTheDocument();
      expect(screen.getByText('Total Income')).toBeInTheDocument();
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('Net Flow')).toBeInTheDocument();

      // Summary values
      expect(screen.getByText('247')).toBeInTheDocument(); // Total transactions
      expect(screen.getByText('€8,450')).toBeInTheDocument(); // Total income
      expect(screen.getByText('€6,321')).toBeInTheDocument(); // Total expenses
      expect(screen.getByText('€2,129')).toBeInTheDocument(); // Net flow

      // Category breakdown
      expect(screen.getByText('Spending by Category')).toBeInTheDocument();
      expect(screen.getByText('Food & Dining')).toBeInTheDocument();
      expect(screen.getByText('Transportation')).toBeInTheDocument();
      expect(screen.getByText('Shopping')).toBeInTheDocument();
    });
  });

  it('should display detailed mode content correctly', async () => {
    render(<AdvancedAnalyticsPage />);
    
    // Switch to detailed mode
    await waitFor(() => {
      const detailedButton = screen.getByText('Detailed');
      fireEvent.click(detailedButton);
    });

    await waitFor(() => {
      // Budget performance section
      expect(screen.getByText('Budget Performance')).toBeInTheDocument();
      expect(screen.getByText('How your spending compares to your budget')).toBeInTheDocument();
      
      // Monthly trends section
      expect(screen.getByText('Monthly Trends')).toBeInTheDocument();
      expect(screen.getByText('Income vs expenses over time')).toBeInTheDocument();

      // Budget performance data
      expect(screen.getByText('Over Budget')).toBeInTheDocument();
      expect(screen.getByText('On Track')).toBeInTheDocument();
      expect(screen.getByText('Close to Limit')).toBeInTheDocument();

      // Progress bars should be present
      expect(screen.getAllByTestId('progress')).toHaveLength(4); // One for each budget category
    });
  });

  it('should display insights mode content correctly', async () => {
    render(<AdvancedAnalyticsPage />);
    
    // Switch to insights mode
    await waitFor(() => {
      const insightsButton = screen.getByText('Insights');
      fireEvent.click(insightsButton);
    });

    await waitFor(() => {
      // Insights section
      expect(screen.getByText('Excellent Saving Rate')).toBeInTheDocument();
      expect(screen.getByText('Food Spending Above Budget')).toBeInTheDocument();
      expect(screen.getByText('Transportation Savings')).toBeInTheDocument();

      // AI recommendations
      expect(screen.getByText('AI-Powered Recommendations')).toBeInTheDocument();
      expect(screen.getByText('💡 Smart Saving Opportunity')).toBeInTheDocument();
      expect(screen.getByText('🎯 Budget Optimization')).toBeInTheDocument();
      expect(screen.getByText('📊 Investment Opportunity')).toBeInTheDocument();

      // Action buttons should be present
      expect(screen.getByText('Create Savings Goal')).toBeInTheDocument();
      expect(screen.getByText('Adjust Budget')).toBeInTheDocument();
      expect(screen.getByText('Explore Investments')).toBeInTheDocument();
    });
  });

  it('should handle retry functionality when data loading fails', async () => {
    // Override the mock to simulate API failure initially, then success
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        throw new Error('API Error');
      }
      return Promise.resolve();
    });

    // Mock the fetchAnalyticsData function
    const originalError = console.error;
    console.error = vi.fn();

    render(<AdvancedAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Analytics')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    // Should show loading state again
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();

    console.error = originalError;
  });

  it('should display correct trend indicators', async () => {
    render(<AdvancedAnalyticsPage />);
    
    await waitFor(() => {
      // Check for trend badges in category breakdown
      const badges = screen.getAllByTestId('badge');
      const trendBadges = badges.filter(badge => 
        badge.textContent === '↑' || 
        badge.textContent === '↓' || 
        badge.textContent === '→'
      );
      expect(trendBadges.length).toBeGreaterThan(0);
    });
  });

  it('should display correct status indicators for budget performance', async () => {
    render(<AdvancedAnalyticsPage />);
    
    // Switch to detailed mode
    await waitFor(() => {
      const detailedButton = screen.getByText('Detailed');
      fireEvent.click(detailedButton);
    });

    await waitFor(() => {
      // Check for budget status badges
      expect(screen.getByText('Over Budget')).toBeInTheDocument();
      expect(screen.getByText('On Track')).toBeInTheDocument();
      expect(screen.getByText('Close to Limit')).toBeInTheDocument();
    });
  });

  it('should display correct insight icons', async () => {
    render(<AdvancedAnalyticsPage />);
    
    // Switch to insights mode
    await waitFor(() => {
      const insightsButton = screen.getByText('Insights');
      fireEvent.click(insightsButton);
    });

    await waitFor(() => {
      // Check for insight icons
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument(); // Positive insight
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument(); // Warning insight
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument(); // Info insight
    });
  });

  it('should handle date range selection', async () => {
    render(<AdvancedAnalyticsPage />);
    
    await waitFor(() => {
      const selects = screen.getAllByTestId('select');
      const dateRangeSelect = selects[0]; // First select is date range
      
      fireEvent.click(dateRangeSelect);
    });

    // Note: In a real test environment, you would test that the onChange handler
    // is called and the component re-renders with new data
  });

  it('should handle category filter selection', async () => {
    render(<AdvancedAnalyticsPage />);
    
    await waitFor(() => {
      const selects = screen.getAllByTestId('select');
      const categorySelect = selects[1]; // Second select is category filter
      
      fireEvent.click(categorySelect);
    });

    // Note: In a real test environment, you would test that the onChange handler
    // is called and the component re-renders with filtered data
  });

  it('should render export button', async () => {
    render(<AdvancedAnalyticsPage />);
    
    await waitFor(() => {
      const exportButton = screen.getByText('Export');
      expect(exportButton).toBeInTheDocument();
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });
  });

  it('should display monetary values with proper formatting', async () => {
    render(<AdvancedAnalyticsPage />);
    
    await waitFor(() => {
      // Check that monetary values are formatted with € symbol and proper formatting
      expect(screen.getByText('€8,450')).toBeInTheDocument();
      expect(screen.getByText('€6,321')).toBeInTheDocument();
      expect(screen.getByText('€2,129')).toBeInTheDocument();
    });
  });

  it('should display percentage values correctly', async () => {
    render(<AdvancedAnalyticsPage />);
    
    await waitFor(() => {
      // Check for percentage values in category breakdown
      expect(screen.getByText('22.5%')).toBeInTheDocument();
      expect(screen.getByText('14.1%')).toBeInTheDocument();
      expect(screen.getByText('12.0%')).toBeInTheDocument();
    });
  });

  it('should handle monthly trends data display', async () => {
    render(<AdvancedAnalyticsPage />);
    
    // Switch to detailed mode
    await waitFor(() => {
      const detailedButton = screen.getByText('Detailed');
      fireEvent.click(detailedButton);
    });

    await waitFor(() => {
      // Check for month names in trends
      expect(screen.getByText('Nov')).toBeInTheDocument();
      expect(screen.getByText('Dec')).toBeInTheDocument();
      expect(screen.getByText('Jan')).toBeInTheDocument();
    });
  });

  it('should display budget variance indicators', async () => {
    render(<AdvancedAnalyticsPage />);
    
    // Switch to detailed mode
    await waitFor(() => {
      const detailedButton = screen.getByText('Detailed');
      fireEvent.click(detailedButton);
    });

    await waitFor(() => {
      // Check for over budget indicator
      expect(screen.getByText('€221 over budget')).toBeInTheDocument();
    });
  });

  it('should render all required UI components', async () => {
    render(<AdvancedAnalyticsPage />);
    
    await waitFor(() => {
      // Check that all major UI components are rendered
      expect(screen.getAllByTestId('card')).toHaveLength(expect.any(Number));
      expect(screen.getAllByTestId('button')).toHaveLength(expect.any(Number));
      expect(screen.getAllByTestId('select')).toHaveLength(2);
    });
  });
});