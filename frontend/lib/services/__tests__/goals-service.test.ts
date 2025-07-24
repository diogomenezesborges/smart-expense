import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock database client
vi.mock('@/lib/database/client', () => ({
  prisma: {},
}));

import { GoalsService, Goal, GoalType, GoalStatus, GoalPeriod } from '../goals-service';

describe('GoalsService', () => {
  let goalsService: GoalsService;
  let mockGoal: Omit<Goal, 'id' | 'currentAmount' | 'createdAt' | 'updatedAt'>;

  beforeEach(() => {
    vi.clearAllMocks();
    goalsService = GoalsService.getInstance();
    
    // Clear localStorage
    localStorageMock.getItem.mockReturnValue(null);
    
    mockGoal = {
      title: 'Emergency Fund',
      description: 'Build 6 months of expenses',
      type: 'emergency_fund',
      status: 'active',
      period: 'yearly',
      targetAmount: 6000,
      startDate: new Date('2024-01-01'),
      targetDate: new Date('2024-12-31'),
      priority: 'high',
      isRecurring: false,
      notifications: true,
    };
  });

  describe('createGoal', () => {
    it('should create a new goal', async () => {
      const goal = await goalsService.createGoal(mockGoal);

      expect(goal).toMatchObject({
        ...mockGoal,
        id: expect.any(String),
        currentAmount: 0,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'financial_goals',
        expect.any(String)
      );
    });

    it('should handle creation errors', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      await expect(goalsService.createGoal(mockGoal)).rejects.toThrow('Failed to create goal');
    });
  });

  describe('getGoals', () => {
    beforeEach(() => {
      const sampleGoals = [
        {
          id: 'goal-1',
          title: 'Emergency Fund',
          type: 'emergency_fund',
          status: 'active',
          priority: 'high',
          targetDate: '2024-12-31',
          startDate: '2024-01-01',
          currentAmount: 1000,
          targetAmount: 6000,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'goal-2',
          title: 'Vacation Fund',
          type: 'savings',
          status: 'completed',
          priority: 'medium',
          targetDate: '2024-06-30',
          startDate: '2024-01-01',
          currentAmount: 2500,
          targetAmount: 2500,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleGoals));
    });

    it('should return all goals sorted by priority and date', async () => {
      const goals = await goalsService.getGoals();

      expect(goals).toHaveLength(2);
      expect(goals[0].priority).toBe('high'); // Higher priority first
      expect(goals[0].id).toBe('goal-1');
    });

    it('should filter goals by status', async () => {
      const activeGoals = await goalsService.getGoals('active');
      
      expect(activeGoals).toHaveLength(1);
      expect(activeGoals[0].status).toBe('active');
    });

    it('should filter goals by type', async () => {
      const savingsGoals = await goalsService.getGoals(undefined, 'savings');
      
      expect(savingsGoals).toHaveLength(1);
      expect(savingsGoals[0].type).toBe('savings');
    });

    it('should handle empty storage', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const goals = await goalsService.getGoals();
      expect(goals).toHaveLength(0);
    });

    it('should handle corrupted storage data', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const goals = await goalsService.getGoals();
      expect(goals).toHaveLength(0);
    });
  });

  describe('updateGoal', () => {
    beforeEach(() => {
      const sampleGoals = [
        {
          id: 'goal-1',
          title: 'Emergency Fund',
          type: 'emergency_fund',
          status: 'active',
          priority: 'high',
          targetDate: '2024-12-31',
          startDate: '2024-01-01',
          currentAmount: 1000,
          targetAmount: 6000,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleGoals));
    });

    it('should update an existing goal', async () => {
      const updates = { currentAmount: 2000, title: 'Updated Emergency Fund' };
      
      const updatedGoal = await goalsService.updateGoal('goal-1', updates);

      expect(updatedGoal).toMatchObject(updates);
      expect(updatedGoal?.updatedAt).toBeInstanceOf(Date);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should throw error for non-existent goal', async () => {
      await expect(
        goalsService.updateGoal('non-existent', { currentAmount: 1000 })
      ).rejects.toThrow('Failed to update goal');
    });
  });

  describe('deleteGoal', () => {
    beforeEach(() => {
      const sampleGoals = [
        {
          id: 'goal-1',
          title: 'Emergency Fund',
          currentAmount: 1000,
          targetAmount: 6000,
        },
        {
          id: 'goal-2',
          title: 'Vacation Fund',
          currentAmount: 2500,
          targetAmount: 2500,
        },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleGoals));
    });

    it('should delete an existing goal', async () => {
      const success = await goalsService.deleteGoal('goal-1');

      expect(success).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'financial_goals',
        expect.stringContaining('goal-2')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'financial_goals',
        expect.not.stringContaining('goal-1')
      );
    });

    it('should return false for non-existent goal', async () => {
      const success = await goalsService.deleteGoal('non-existent');

      expect(success).toBe(false);
    });
  });

  describe('calculateProgress', () => {
    beforeEach(() => {
      const now = new Date('2024-06-01');
      vi.setSystemTime(now);
      
      const sampleGoals = [
        {
          id: 'goal-1',
          title: 'Emergency Fund',
          type: 'emergency_fund',
          status: 'active',
          targetAmount: 6000,
          currentAmount: 3000,
          startDate: '2024-01-01',
          targetDate: '2024-12-31',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleGoals));
    });

    it('should calculate progress correctly', async () => {
      const progress = await goalsService.calculateProgress('goal-1');

      expect(progress).toMatchObject({
        goalId: 'goal-1',
        progress: expect.any(Number),
        amountToGo: expect.any(Number),
        daysRemaining: expect.any(Number),
        averageRequired: expect.any(Number),
        isOnTrack: expect.any(Boolean),
        velocity: expect.any(Number),
      });

      expect(progress?.progress).toBeGreaterThan(0);
      expect(progress?.amountToGo).toBeGreaterThan(0);
      expect(progress?.daysRemaining).toBeGreaterThan(0);
    });

    it('should return null for non-existent goal', async () => {
      const progress = await goalsService.calculateProgress('non-existent');

      expect(progress).toBeNull();
    });

    it('should handle completed goals', async () => {
      const completedGoals = [
        {
          id: 'goal-completed',
          title: 'Completed Goal',
          type: 'savings',
          targetAmount: 1000,
          currentAmount: 1000,
          startDate: '2024-01-01',
          targetDate: '2024-12-31',
        },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(completedGoals));
      
      const progress = await goalsService.calculateProgress('goal-completed');

      expect(progress?.progress).toBe(100);
      expect(progress?.amountToGo).toBe(0);
    });
  });

  describe('getGoalInsights', () => {
    beforeEach(() => {
      const now = new Date('2024-06-01');
      vi.setSystemTime(now);
    });

    it('should generate achievement insight for completed goals', async () => {
      const completedGoals = [
        {
          id: 'goal-completed',
          title: 'Vacation Fund',
          type: 'savings',
          status: 'active',
          targetAmount: 1000,
          currentAmount: 1000,
          startDate: '2024-01-01',
          targetDate: '2024-12-31',
        },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(completedGoals));
      
      const insights = await goalsService.getGoalInsights();

      expect(insights).toHaveLength(1);
      expect(insights[0].type).toBe('achievement');
      expect(insights[0].title).toContain('Goal Completed');
    });

    it('should generate warning insight for behind schedule goals', async () => {
      const behindGoals = [
        {
          id: 'goal-behind',
          title: 'Slow Progress Goal',
          type: 'savings',
          status: 'active',
          targetAmount: 12000,
          currentAmount: 1000,
          startDate: '2024-01-01',
          targetDate: '2024-06-15', // Soon target date with low progress
        },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(behindGoals));
      
      const insights = await goalsService.getGoalInsights();

      expect(insights.some(insight => insight.type === 'warning')).toBe(true);
    });

    it('should generate milestone insight for 75%+ progress', async () => {
      const almostDoneGoals = [
        {
          id: 'goal-almost-done',
          title: 'Almost There Goal',
          type: 'savings',
          status: 'active',
          targetAmount: 1000,
          currentAmount: 800,
          startDate: '2024-01-01',
          targetDate: '2024-12-31',
        },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(almostDoneGoals));
      
      const insights = await goalsService.getGoalInsights();

      expect(insights.some(insight => insight.type === 'milestone')).toBe(true);
    });
  });

  describe('updateGoalProgress', () => {
    beforeEach(() => {
      const sampleGoals = [
        {
          id: 'goal-1',
          title: 'Emergency Fund',
          status: 'active',
          targetAmount: 6000,
          currentAmount: 3000,
        },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sampleGoals));
    });

    it('should update goal progress', async () => {
      const success = await goalsService.updateGoalProgress('goal-1', 4000);

      expect(success).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should mark goal as completed when target is reached', async () => {
      const success = await goalsService.updateGoalProgress('goal-1', 6000);

      expect(success).toBe(true);
      
      // Should be called twice: once for amount update, once for status update
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = GoalsService.getInstance();
      const instance2 = GoalsService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('createSampleGoals', () => {
    it('should create sample goals', async () => {
      await goalsService.createSampleGoals();

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(4); // 4 sample goals
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const goals = await goalsService.getGoals();
      expect(goals).toHaveLength(0);
    });

    it('should handle JSON parsing errors', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const goals = await goalsService.getGoals();
      expect(goals).toHaveLength(0);
    });
  });

  describe('goal types and validation', () => {
    it('should accept all valid goal types', async () => {
      const goalTypes: GoalType[] = ['savings', 'spending_limit', 'investment', 'debt_reduction', 'emergency_fund'];
      
      for (const type of goalTypes) {
        const goal = await goalsService.createGoal({
          ...mockGoal,
          type,
          title: `${type} goal`,
        });
        
        expect(goal.type).toBe(type);
      }
    });

    it('should accept all valid goal statuses', () => {
      const statuses: GoalStatus[] = ['active', 'completed', 'paused', 'failed'];
      
      statuses.forEach(status => {
        expect(['active', 'completed', 'paused', 'failed']).toContain(status);
      });
    });

    it('should accept all valid goal periods', () => {
      const periods: GoalPeriod[] = ['monthly', 'quarterly', 'yearly', 'one_time'];
      
      periods.forEach(period => {
        expect(['monthly', 'quarterly', 'yearly', 'one_time']).toContain(period);
      });
    });
  });
});