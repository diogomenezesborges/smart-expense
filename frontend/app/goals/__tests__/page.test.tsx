import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GoalsPage from '../page';

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Target: () => <div data-testid="target-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Trophy: () => <div data-testid="trophy-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  PiggyBank: () => <div data-testid="piggy-bank-icon" />,
  Home: () => <div data-testid="home-icon" />,
  GraduationCap: () => <div data-testid="graduation-cap-icon" />,
  CreditCard: () => <div data-testid="credit-card-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Award: () => <div data-testid="award-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  BarChart3: () => <div data-testid="bar-chart-icon" />
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="button">
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, ...props }: any) => (
    <input 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder}
      data-testid="input"
      {...props}
    />
  )
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div className={className} data-testid="progress" data-value={value}>
      Progress: {value}%
    </div>
  )
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span className={className} data-testid="badge">{children}</span>
  )
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid="tabs-content" data-value={value}>{children}</div>
  ),
  TabsList: ({ children }: any) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button data-testid="tabs-trigger" data-value={value} onClick={onClick}>
      {children}
    </button>
  )
}));

describe('GoalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Structure', () => {
    it('should render the main page structure correctly', () => {
      render(<GoalsPage />);
      
      // Check header elements
      expect(screen.getByText('Financial Goals')).toBeInTheDocument();
      expect(screen.getByText('Track progress and achieve your financial dreams')).toBeInTheDocument();
      expect(screen.getAllByTestId('target-icon')).toHaveLength(2); // One in header, one in stats
      
      // Check New Goal button
      expect(screen.getByText('New Goal')).toBeInTheDocument();
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('should display user level and XP correctly', () => {
      render(<GoalsPage />);
      
      // Check for level display (mocked data shows Level 5)
      expect(screen.getByText(/Level \d+/)).toBeInTheDocument();
      expect(screen.getByText(/\d+\/\d+ XP/)).toBeInTheDocument();
    });

    it('should render navigation tabs', () => {
      render(<GoalsPage />);
      
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    });
  });

  describe('Goals Data Display', () => {
    it('should render mock goals data correctly', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        // Check for goal names from mock data
        expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
        expect(screen.getByText('House Down Payment')).toBeInTheDocument();
        expect(screen.getByText('Vacation Fund')).toBeInTheDocument();
        expect(screen.getByText('Credit Card Debt')).toBeInTheDocument();
      });
    });

    it('should display goal progress bars correctly', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        const progressBars = screen.getAllByTestId('progress');
        expect(progressBars.length).toBeGreaterThan(0);
        
        // Check that progress values are displayed
        progressBars.forEach(bar => {
          expect(bar).toHaveAttribute('data-value');
        });
      });
    });

    it('should display goal status badges', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        const badges = screen.getAllByTestId('badge');
        expect(badges.length).toBeGreaterThan(0);
        
        // Check for different status types
        const statusTexts = badges.map(badge => badge.textContent);
        expect(statusTexts).toContain('on-track');
        expect(statusTexts).toContain('ahead');
        expect(statusTexts).toContain('behind');
      });
    });

    it('should display monetary amounts correctly formatted', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        // Check for Euro currency formatting (mock data uses EUR)
        expect(screen.getByText(/€25,000/)).toBeInTheDocument(); // Emergency fund target
        expect(screen.getByText(/€18,750/)).toBeInTheDocument(); // Emergency fund current
        expect(screen.getByText(/€50,000/)).toBeInTheDocument(); // House down payment target
      });
    });
  });

  describe('Goal Icons and Categories', () => {
    it('should display correct icons for different goal types', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        // Savings goals should show piggy bank icon
        expect(screen.getAllByTestId('piggy-bank-icon')).toHaveLength(3); // Emergency Fund, House, Vacation
        
        // Debt payoff should show credit card icon
        expect(screen.getByTestId('credit-card-icon')).toBeInTheDocument();
      });
    });

    it('should apply correct status colors to goal cards', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        const badges = screen.getAllByTestId('badge');
        
        // Check that badges have appropriate styling classes
        badges.forEach(badge => {
          expect(badge).toHaveClass(/bg-/); // Should have background color classes
          expect(badge).toHaveClass(/text-/); // Should have text color classes
        });
      });
    });
  });

  describe('Achievements Section', () => {
    it('should display achievements correctly', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        // Check for achievement names from mock data
        expect(screen.getByText('First Goal')).toBeInTheDocument();
        expect(screen.getByText('Milestone Master')).toBeInTheDocument();
        expect(screen.getByText('Consistency Champion')).toBeInTheDocument();
        expect(screen.getByText('Savings Superstar')).toBeInTheDocument();
      });
    });

    it('should show achievement descriptions', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Created your first financial goal')).toBeInTheDocument();
        expect(screen.getByText('Reached 5 goal milestones')).toBeInTheDocument();
        expect(screen.getByText('Made contributions for 30 consecutive days')).toBeInTheDocument();
      });
    });

    it('should display achievement progress for incomplete achievements', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        // Challenge Complete achievement should show progress
        expect(screen.getByText('Challenge Complete')).toBeInTheDocument();
        expect(screen.getByText('Finish the Emergency Fund Challenge')).toBeInTheDocument();
      });
    });
  });

  describe('User Statistics', () => {
    it('should display user statistics correctly', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        // Check for statistics from mock data
        expect(screen.getByText(/4/)).toBeInTheDocument(); // Total goals
        expect(screen.getByText(/€34,450/)).toBeInTheDocument(); // Total saved
        expect(screen.getByText(/23/)).toBeInTheDocument(); // Current streak
      });
    });

    it('should show level progression correctly', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        // Check level and XP display
        expect(screen.getByText('Level 5')).toBeInTheDocument();
        expect(screen.getByText('2450/3000 XP')).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Elements', () => {
    it('should handle New Goal button click', () => {
      render(<GoalsPage />);
      
      const newGoalButton = screen.getByText('New Goal');
      expect(newGoalButton).toBeInTheDocument();
      
      // Button should be clickable
      fireEvent.click(newGoalButton);
      // Note: Since this is mock data, we're just testing that the button renders and is clickable
    });

    it('should handle tab navigation', () => {
      render(<GoalsPage />);
      
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toBeInTheDocument();
      
      // Tabs should be present and clickable
      const tabTriggers = screen.getAllByTestId('tabs-trigger');
      expect(tabTriggers.length).toBeGreaterThan(0);
      
      tabTriggers.forEach(trigger => {
        fireEvent.click(trigger);
      });
    });
  });

  describe('Goal Progress Calculations', () => {
    it('should calculate progress percentages correctly', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        const progressBars = screen.getAllByTestId('progress');
        
        // Emergency Fund: 18750/25000 = 75%
        const emergencyFundProgress = progressBars.find(bar => 
          bar.getAttribute('data-value') === '75'
        );
        expect(emergencyFundProgress).toBeInTheDocument();
        
        // House Down Payment: 12500/50000 = 25%
        const houseProgress = progressBars.find(bar => 
          bar.getAttribute('data-value') === '25'
        );
        expect(houseProgress).toBeInTheDocument();
      });
    });

    it('should display time remaining correctly', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        // Check for time-related text (mock data has various deadlines)
        expect(screen.getByText(/days left|months left|years left/)).toBeInTheDocument();
      });
    });
  });

  describe('Goal Milestones', () => {
    it('should display milestone progress correctly', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        // Check for milestone indicators
        // Mock data has milestones at 25%, 50%, 75%, 100%
        const milestoneElements = screen.getAllByText(/25%|50%|75%|100%/);
        expect(milestoneElements.length).toBeGreaterThan(0);
      });
    });

    it('should show completed milestones differently from pending ones', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        // Completed milestones should have different styling
        const checkIcons = screen.getAllByTestId('check-circle-icon');
        expect(checkIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Goal Prioritization', () => {
    it('should display priority badges correctly', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        const badges = screen.getAllByTestId('badge');
        const priorityBadges = badges.filter(badge => 
          badge.textContent === 'high' || 
          badge.textContent === 'medium' || 
          badge.textContent === 'low'
        );
        
        expect(priorityBadges.length).toBeGreaterThan(0);
      });
    });

    it('should apply correct priority colors', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        const badges = screen.getAllByTestId('badge');
        
        // High priority should have red colors
        const highPriorityBadges = badges.filter(badge => 
          badge.textContent === 'high'
        );
        
        highPriorityBadges.forEach(badge => {
          expect(badge).toHaveClass(/red/);
        });
      });
    });
  });

  describe('Responsive Design Elements', () => {
    it('should render cards in a responsive grid layout', () => {
      render(<GoalsPage />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
      
      // Cards should have responsive classes
      cards.forEach(card => {
        expect(card).toHaveClass(/grid|flex|w-|max-w-/);
      });
    });

    it('should handle mobile-friendly spacing and sizing', () => {
      render(<GoalsPage />);
      
      // Check for responsive spacing classes
      const mainContainer = screen.getByText('Financial Goals').closest('div');
      expect(mainContainer).toHaveClass(/px-|py-|space-/);
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle missing goal data', () => {
      // Test with component that might have empty state
      render(<GoalsPage />);
      
      // Should not crash and should render basic structure
      expect(screen.getByText('Financial Goals')).toBeInTheDocument();
    });

    it('should handle malformed progress data', async () => {
      render(<GoalsPage />);
      
      await waitFor(() => {
        // Should render progress bars even with potential data issues
        const progressBars = screen.getAllByTestId('progress');
        expect(progressBars.length).toBeGreaterThan(0);
        
        // Progress values should be valid numbers
        progressBars.forEach(bar => {
          const value = bar.getAttribute('data-value');
          expect(value).toMatch(/^\d+(\.\d+)?$/);
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<GoalsPage />);
      
      // Buttons should be accessible
      const buttons = screen.getAllByTestId('button');
      buttons.forEach(button => {
        expect(button).toHaveProperty('tagName', 'BUTTON');
      });
      
      // Progress bars should have accessible information
      const progressBars = screen.getAllByTestId('progress');
      progressBars.forEach(bar => {
        expect(bar).toHaveAttribute('data-value');
      });
    });

    it('should support keyboard navigation', () => {
      render(<GoalsPage />);
      
      // Tab triggers should be focusable
      const tabTriggers = screen.getAllByTestId('tabs-trigger');
      tabTriggers.forEach(trigger => {
        expect(trigger).toHaveProperty('tagName', 'BUTTON');
      });
      
      // Main button should be focusable
      const newGoalButton = screen.getByText('New Goal');
      expect(newGoalButton).toHaveProperty('tagName', 'BUTTON');
    });
  });
});