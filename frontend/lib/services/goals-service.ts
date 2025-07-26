import { prisma } from '@/lib/database/client';

export type GoalType = 'savings' | 'spending_limit' | 'investment' | 'debt_reduction' | 'emergency_fund';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'failed';
export type GoalPeriod = 'monthly' | 'quarterly' | 'yearly' | 'one_time';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  status: GoalStatus;
  period: GoalPeriod;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate: Date;
  categoryId?: string;
  priority: 'low' | 'medium' | 'high';
  isRecurring: boolean;
  notifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalProgress {
  goalId: string;
  progress: number; // 0-100
  amountToGo: number;
  daysRemaining: number;
  averageRequired: number; // daily/weekly/monthly average needed
  isOnTrack: boolean;
  projectedCompletion?: Date;
  velocity: number; // rate of progress
}

export interface GoalInsight {
  type: 'achievement' | 'warning' | 'suggestion' | 'milestone';
  title: string;
  description: string;
  goalId: string;
  actionable?: boolean;
  action?: string;
}

export class GoalsService {
  private static instance: GoalsService;

  static getInstance(): GoalsService {
    if (!GoalsService.instance) {
      GoalsService.instance = new GoalsService();
    }
    return GoalsService.instance;
  }

  async createGoal(goalData: Omit<Goal, 'id' | 'currentAmount' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    try {
      // In a real implementation, this would use a goals table
      // For now, we'll simulate with a mock implementation
      const goal: Goal = {
        id: `goal-${Date.now()}`,
        currentAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...goalData,
      };

      // Store in local storage for demo purposes
      const existingGoals = this.getStoredGoals();
      existingGoals.push(goal);
      localStorage.setItem('financial_goals', JSON.stringify(existingGoals));

      return goal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw new Error('Failed to create goal');
    }
  }

  async getGoals(status?: GoalStatus, type?: GoalType): Promise<Goal[]> {
    try {
      let goals = this.getStoredGoals();

      if (status) {
        goals = goals.filter(goal => goal.status === status);
      }

      if (type) {
        goals = goals.filter(goal => goal.type === type);
      }

      return goals.sort((a, b) => {
        // Sort by priority first, then by target date
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      });
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
    try {
      const goals = this.getStoredGoals();
      const goalIndex = goals.findIndex(g => g.id === goalId);
      
      if (goalIndex === -1) {
        throw new Error('Goal not found');
      }

      goals[goalIndex] = {
        ...goals[goalIndex],
        ...updates,
        updatedAt: new Date(),
      };

      localStorage.setItem('financial_goals', JSON.stringify(goals));
      return goals[goalIndex];
    } catch (error) {
      console.error('Error updating goal:', error);
      throw new Error('Failed to update goal');
    }
  }

  async deleteGoal(goalId: string): Promise<boolean> {
    try {
      const goals = this.getStoredGoals();
      const filteredGoals = goals.filter(g => g.id !== goalId);
      
      if (filteredGoals.length === goals.length) {
        throw new Error('Goal not found');
      }

      localStorage.setItem('financial_goals', JSON.stringify(filteredGoals));
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }

  async calculateProgress(goalId: string): Promise<GoalProgress | null> {
    try {
      const goals = this.getStoredGoals();
      const goal = goals.find(g => g.id === goalId);
      
      if (!goal) return null;

      // Calculate current progress based on goal type
      const currentAmount = await this.getCurrentAmount(goal);
      const progress = Math.min((currentAmount / goal.targetAmount) * 100, 100);
      const amountToGo = Math.max(goal.targetAmount - currentAmount, 0);
      
      const now = new Date();
      const daysRemaining = Math.max(
        Math.ceil((new Date(goal.targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        0
      );

      // Calculate required daily average
      const averageRequired = daysRemaining > 0 ? amountToGo / daysRemaining : 0;

      // Calculate velocity (progress rate)
      const daysSinceStart = Math.max(
        Math.ceil((now.getTime() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24)),
        1
      );
      const velocity = currentAmount / daysSinceStart;

      // Determine if on track
      const isOnTrack = daysRemaining > 0 ? velocity >= averageRequired : progress >= 100;

      // Project completion date
      let projectedCompletion: Date | undefined;
      if (velocity > 0 && amountToGo > 0) {
        const daysToComplete = amountToGo / velocity;
        projectedCompletion = new Date(now.getTime() + (daysToComplete * 24 * 60 * 60 * 1000));
      }

      return {
        goalId,
        progress,
        amountToGo,
        daysRemaining,
        averageRequired,
        isOnTrack,
        projectedCompletion,
        velocity,
      };
    } catch (error) {
      console.error('Error calculating progress:', error);
      return null;
    }
  }

  async getGoalInsights(): Promise<GoalInsight[]> {
    try {
      const goals = await this.getGoals('active');
      const insights: GoalInsight[] = [];

      for (const goal of goals) {
        const progress = await this.calculateProgress(goal.id);
        if (!progress) continue;

        // Achievement insights
        if (progress.progress >= 100) {
          insights.push({
            type: 'achievement',
            title: 'Goal Completed! 🎉',
            description: `Congratulations! You've completed your ${goal.title} goal.`,
            goalId: goal.id,
            actionable: true,
            action: 'Mark as completed',
          });
        }

        // Milestone insights
        else if (progress.progress >= 75 && progress.progress < 100) {
          insights.push({
            type: 'milestone',
            title: 'Almost There!',
            description: `You're ${progress.progress.toFixed(0)}% complete with ${goal.title}. Keep it up!`,
            goalId: goal.id,
          });
        }

        // Warning insights
        else if (!progress.isOnTrack && progress.daysRemaining > 0) {
          insights.push({
            type: 'warning',
            title: 'Behind Schedule',
            description: `${goal.title} needs €${progress.averageRequired.toFixed(2)} daily to stay on track.`,
            goalId: goal.id,
            actionable: true,
            action: 'Adjust goal or increase efforts',
          });
        }

        // Overdue insights
        else if (progress.daysRemaining <= 0 && progress.progress < 100) {
          insights.push({
            type: 'warning',
            title: 'Goal Overdue',
            description: `${goal.title} target date has passed. Consider extending or adjusting the goal.`,
            goalId: goal.id,
            actionable: true,
            action: 'Extend deadline or modify goal',
          });
        }

        // Suggestion insights
        if (goal.type === 'savings' && progress.velocity > progress.averageRequired * 1.5) {
          insights.push({
            type: 'suggestion',
            title: 'Ahead of Schedule',
            description: `You're saving faster than needed for ${goal.title}. Consider increasing the target or starting a new goal.`,
            goalId: goal.id,
            actionable: true,
            action: 'Increase target or create new goal',
          });
        }
      }

      return insights.sort((a, b) => {
        const priorityOrder = { achievement: 4, warning: 3, milestone: 2, suggestion: 1 };
        return priorityOrder[b.type] - priorityOrder[a.type];
      });
    } catch (error) {
      console.error('Error getting goal insights:', error);
      return [];
    }
  }

  async updateGoalProgress(goalId: string, amount: number): Promise<boolean> {
    try {
      const goal = await this.updateGoal(goalId, { currentAmount: amount });
      
      // Check if goal is completed
      if (goal && goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
        await this.updateGoal(goalId, { status: 'completed' });
      }

      return true;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return false;
    }
  }

  private async getCurrentAmount(goal: Goal): Promise<number> {
    try {
      // For demo purposes, we'll use the stored currentAmount and simulate some progress
      let currentAmount = goal.currentAmount;

      // Simulate automatic progress for certain goal types based on transactions
      if (goal.type === 'savings' || goal.type === 'emergency_fund') {
        // In a real app, this would query actual savings account balances or transactions
        const daysSinceStart = Math.ceil(
          (new Date().getTime() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Simulate some progress (this would be real transaction data)
        const simulatedDailyProgress = goal.targetAmount / 365; // Assume 1-year goal
        currentAmount += Math.min(simulatedDailyProgress * daysSinceStart * 0.7, goal.targetAmount);
      }

      return Math.min(currentAmount, goal.targetAmount);
    } catch (error) {
      console.error('Error getting current amount:', error);
      return goal.currentAmount;
    }
  }

  private getStoredGoals(): Goal[] {
    try {
      const stored = localStorage.getItem('financial_goals');
      if (!stored) return [];
      
      const goals = JSON.parse(stored);
      // Convert date strings back to Date objects
      return goals.map((goal: any) => ({
        ...goal,
        startDate: new Date(goal.startDate),
        targetDate: new Date(goal.targetDate),
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting stored goals:', error);
      return [];
    }
  }

  // Helper method to create default goals for demo
  async createSampleGoals(): Promise<void> {
    const sampleGoals = [
      {
        title: 'Emergency Fund',
        description: 'Build 6 months of expenses for emergencies',
        type: 'emergency_fund' as GoalType,
        status: 'active' as GoalStatus,
        period: 'yearly' as GoalPeriod,
        targetAmount: 6000,
        startDate: new Date('2024-01-01'),
        targetDate: new Date('2024-12-31'),
        priority: 'high' as const,
        isRecurring: false,
        notifications: true,
      },
      {
        title: 'Vacation Fund',
        description: 'Save for summer vacation to Portugal',
        type: 'savings' as GoalType,
        status: 'active' as GoalStatus,
        period: 'one_time' as GoalPeriod,
        targetAmount: 2500,
        startDate: new Date('2024-01-01'),
        targetDate: new Date('2024-06-30'),
        priority: 'medium' as const,
        isRecurring: false,
        notifications: true,
      },
      {
        title: 'Monthly Food Budget',
        description: 'Keep food expenses under €800 per month',
        type: 'spending_limit' as GoalType,
        status: 'active' as GoalStatus,
        period: 'monthly' as GoalPeriod,
        targetAmount: 800,
        startDate: new Date('2024-01-01'),
        targetDate: new Date('2024-01-31'),
        priority: 'medium' as const,
        isRecurring: true,
        notifications: true,
      },
      {
        title: 'Investment Portfolio',
        description: 'Invest €500 monthly in index funds',
        type: 'investment' as GoalType,
        status: 'active' as GoalStatus,
        period: 'monthly' as GoalPeriod,
        targetAmount: 500,
        startDate: new Date('2024-01-01'),
        targetDate: new Date('2024-01-31'),
        priority: 'high' as const,
        isRecurring: true,
        notifications: true,
      },
    ];

    for (const goalData of sampleGoals) {
      await this.createGoal(goalData);
    }
  }
}

export const goalsService = GoalsService.getInstance();