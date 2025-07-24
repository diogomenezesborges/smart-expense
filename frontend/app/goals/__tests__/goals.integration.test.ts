import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock database client
const mockPrisma = {
  goal: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn()
  },
  transaction: {
    findMany: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn()
  },
  user: {
    findUnique: vi.fn(),
    update: vi.fn()
  }
};

vi.mock('@/lib/database/client', () => ({
  prisma: mockPrisma
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logApiRequest: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}));

import { GET, POST, PUT, DELETE } from '../../api/goals/route';

describe('Goals Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock responses
    mockPrisma.goal.findMany.mockResolvedValue([
      {
        id: 'goal-1',
        title: 'Emergency Fund',
        description: 'Build 6-month emergency fund',
        type: 'savings',
        targetAmount: 25000,
        currentAmount: 18750,
        startDate: new Date('2024-01-01'),
        targetDate: new Date('2025-12-31'),
        status: 'active',
        priority: 'high',
        isRecurring: false,
        notifications: true,
        userId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]);

    mockPrisma.goal.findUnique.mockResolvedValue({
      id: 'goal-1',
      title: 'Emergency Fund',
      type: 'savings',
      targetAmount: 25000,
      currentAmount: 18750,
      status: 'active'
    });

    mockPrisma.transaction.findMany.mockResolvedValue([
      {
        id: 'tx-1',
        amount: 500,
        date: new Date('2024-01-15'),
        category: 'Savings',
        goalId: 'goal-1'
      }
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/goals - List Goals', () => {
    it('should retrieve all goals for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/goals');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]).toMatchObject({
        id: 'goal-1',
        title: 'Emergency Fund',
        type: 'savings',
        targetAmount: 25000,
        currentAmount: 18750
      });
    });

    it('should filter goals by status', async () => {
      const request = new NextRequest('http://localhost:3000/api/goals?status=active');
      
      await GET(request);

      expect(mockPrisma.goal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active'
          })
        })
      );
    });

    it('should filter goals by type', async () => {
      const request = new NextRequest('http://localhost:3000/api/goals?type=savings');
      
      await GET(request);

      expect(mockPrisma.goal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'savings'
          })
        })
      );
    });

    it('should handle goal progress calculation', async () => {
      const request = new NextRequest('http://localhost:3000/api/goals?action=progress&goalId=goal-1');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toMatchObject({
        progress: 75, // 18750/25000 * 100
        amountToGo: 6250, // 25000 - 18750
        isOnTrack: expect.any(Boolean)
      });
    });

    it('should generate goal insights', async () => {
      const request = new NextRequest('http://localhost:3000/api/goals?action=insights');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.goal.findMany.mockRejectedValue(new Error('Database connection failed'));
      
      const request = new NextRequest('http://localhost:3000/api/goals');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database connection failed');
    });
  });

  describe('POST /api/goals - Create Goal', () => {
    it('should create a new goal successfully', async () => {
      const newGoal = {
        title: 'New Car Fund',
        description: 'Save for a new car',
        type: 'savings',
        targetAmount: 30000,
        period: 'yearly',
        startDate: '2024-01-01',
        targetDate: '2025-12-31',
        priority: 'medium',
        isRecurring: false,
        notifications: true
      };

      mockPrisma.goal.create.mockResolvedValue({
        id: 'goal-2',
        ...newGoal,
        currentAmount: 0,
        status: 'active',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const request = new NextRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify(newGoal)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('New Car Fund');
      expect(mockPrisma.goal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New Car Fund',
            type: 'savings',
            targetAmount: 30000
          })
        })
      );
    });

    it('should create sample goals when requested', async () => {
      const sampleGoals = [
        { id: 'sample-1', title: 'Emergency Fund', type: 'emergency_fund' },
        { id: 'sample-2', title: 'Vacation Fund', type: 'savings' },
        { id: 'sample-3', title: 'Debt Payoff', type: 'debt_reduction' }
      ];

      mockPrisma.goal.create.mockResolvedValueOnce(sampleGoals[0]);
      mockPrisma.goal.create.mockResolvedValueOnce(sampleGoals[1]);
      mockPrisma.goal.create.mockResolvedValueOnce(sampleGoals[2]);

      const request = new NextRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify({ action: 'create_sample' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.goal.create).toHaveBeenCalledTimes(3);
    });

    it('should validate required fields', async () => {
      const invalidGoal = {
        description: 'Missing title',
        type: 'savings'
      };

      const request = new NextRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify(invalidGoal)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('title');
    });

    it('should handle duplicate goal titles', async () => {
      mockPrisma.goal.create.mockRejectedValue(new Error('Unique constraint failed'));

      const request = new NextRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Emergency Fund',
          type: 'savings',
          targetAmount: 25000
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/goals - Update Goal', () => {
    it('should update an existing goal', async () => {
      const updates = {
        goalId: 'goal-1',
        currentAmount: 20000,
        status: 'active'
      };

      mockPrisma.goal.update.mockResolvedValue({
        id: 'goal-1',
        title: 'Emergency Fund',
        currentAmount: 20000,
        status: 'active'
      });

      const request = new NextRequest('http://localhost:3000/api/goals', {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.goal.update).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
        data: { currentAmount: 20000, status: 'active' }
      });
    });

    it('should complete a goal automatically when target is reached', async () => {
      const updates = {
        goalId: 'goal-1',
        currentAmount: 25000 // Matches target amount
      };

      mockPrisma.goal.update.mockResolvedValue({
        id: 'goal-1',
        currentAmount: 25000,
        status: 'completed'
      });

      const request = new NextRequest('http://localhost:3000/api/goals', {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockPrisma.goal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'completed'
          })
        })
      );
    });

    it('should handle non-existent goal updates', async () => {
      mockPrisma.goal.update.mockRejectedValue(new Error('Record not found'));

      const request = new NextRequest('http://localhost:3000/api/goals', {
        method: 'PUT',
        body: JSON.stringify({
          goalId: 'non-existent',
          currentAmount: 1000
        })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/goals - Delete Goal', () => {
    it('should delete a goal successfully', async () => {
      mockPrisma.goal.delete.mockResolvedValue({
        id: 'goal-1',
        title: 'Emergency Fund'
      });

      const request = new NextRequest('http://localhost:3000/api/goals?goalId=goal-1', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.goal.delete).toHaveBeenCalledWith({
        where: { id: 'goal-1' }
      });
    });

    it('should handle deletion of non-existent goal', async () => {
      mockPrisma.goal.delete.mockRejectedValue(new Error('Record not found'));

      const request = new NextRequest('http://localhost:3000/api/goals?goalId=non-existent', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should require goalId parameter for deletion', async () => {
      const request = new NextRequest('http://localhost:3000/api/goals', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('goalId');
    });
  });

  describe('Goal Progress Tracking Integration', () => {
    it('should track progress based on linked transactions', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { amount: 500, date: new Date('2024-01-15'), goalId: 'goal-1' },
        { amount: 300, date: new Date('2024-01-20'), goalId: 'goal-1' },
        { amount: 200, date: new Date('2024-01-25'), goalId: 'goal-1' }
      ]);

      const request = new NextRequest('http://localhost:3000/api/goals?action=progress&goalId=goal-1');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.transactionHistory).toHaveLength(3);
      expect(data.data.monthlyContributions).toBeDefined();
    });

    it('should calculate velocity and projected completion', async () => {
      mockPrisma.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 2000 },
        _count: 4
      });

      const request = new NextRequest('http://localhost:3000/api/goals?action=progress&goalId=goal-1');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.velocity).toBeDefined();
      expect(data.data.projectedCompletion).toBeDefined();
      expect(data.data.averageRequired).toBeDefined();
    });

    it('should identify if goal is on track', async () => {
      // Mock scenario where goal should be completed in 12 months
      // and current progress suggests it will be completed on time
      const today = new Date();
      const targetDate = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

      mockPrisma.goal.findUnique.mockResolvedValue({
        id: 'goal-1',
        targetAmount: 12000,
        currentAmount: 3000, // 25% complete after 3 months = on track
        targetDate: targetDate,
        startDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000) // 3 months ago
      });

      const request = new NextRequest('http://localhost:3000/api/goals?action=progress&goalId=goal-1');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.isOnTrack).toBe(true);
    });
  });

  describe('Goal Insights Generation', () => {
    it('should generate achievement insights for completed milestones', async () => {
      mockPrisma.goal.findMany.mockResolvedValue([
        {
          id: 'goal-1',
          title: 'Emergency Fund',
          targetAmount: 10000,
          currentAmount: 7500, // 75% complete - should trigger milestone insight
          status: 'active'
        }
      ]);

      const request = new NextRequest('http://localhost:3000/api/goals?action=insights');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const milestoneInsight = data.data.find(
        (insight: any) => insight.type === 'milestone'
      );
      expect(milestoneInsight).toBeDefined();
    });

    it('should generate warning insights for off-track goals', async () => {
      const pastDue = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

      mockPrisma.goal.findMany.mockResolvedValue([
        {
          id: 'goal-1',
          title: 'Vacation Fund',
          targetAmount: 5000,
          currentAmount: 1000, // Only 20% complete but past due
          targetDate: pastDue,
          status: 'active'
        }
      ]);

      const request = new NextRequest('http://localhost:3000/api/goals?action=insights');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const warningInsight = data.data.find(
        (insight: any) => insight.type === 'warning'
      );
      expect(warningInsight).toBeDefined();
    });

    it('should generate suggestions for optimizing goals', async () => {
      mockPrisma.goal.findMany.mockResolvedValue([
        {
          id: 'goal-1',
          title: 'Emergency Fund',
          targetAmount: 25000,
          currentAmount: 15000,
          monthlyContribution: 500,
          status: 'active'
        }
      ]);

      const request = new NextRequest('http://localhost:3000/api/goals?action=insights');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const suggestionInsight = data.data.find(
        (insight: any) => insight.type === 'suggestion'
      );
      expect(suggestionInsight).toBeDefined();
    });
  });

  describe('Goal Type Specific Behavior', () => {
    it('should handle emergency fund goals with specific logic', async () => {
      const emergencyGoal = {
        title: 'Emergency Fund',
        type: 'emergency_fund',
        targetAmount: 30000, // 6 months of expenses
        monthlyExpenses: 5000
      };

      mockPrisma.goal.create.mockResolvedValue({
        id: 'goal-emergency',
        ...emergencyGoal,
        currentAmount: 0,
        status: 'active'
      });

      const request = new NextRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify(emergencyGoal)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle debt reduction goals with decreasing targets', async () => {
      const debtGoal = {
        title: 'Credit Card Debt',
        type: 'debt_reduction',
        targetAmount: 5000, // Amount to pay off
        currentAmount: 2000, // Amount already paid
        interestRate: 18.99
      };

      mockPrisma.goal.create.mockResolvedValue({
        id: 'goal-debt',
        ...debtGoal,
        status: 'active'
      });

      const request = new NextRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify(debtGoal)
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle recurring goals properly', async () => {
      const recurringGoal = {
        title: 'Monthly Savings',
        type: 'savings',
        targetAmount: 1000,
        period: 'monthly',
        isRecurring: true
      };

      mockPrisma.goal.create.mockResolvedValue({
        id: 'goal-recurring',
        ...recurringGoal,
        currentAmount: 0,
        status: 'active'
      });

      const request = new NextRequest('http://localhost:3000/api/goals', {
        method: 'POST',
        body: JSON.stringify(recurringGoal)
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Goal Statistics and Analytics', () => {
    it('should calculate overall goal statistics', async () => {
      mockPrisma.goal.aggregate.mockResolvedValue({
        _count: 5,
        _sum: { targetAmount: 75000, currentAmount: 35000 },
        _avg: { targetAmount: 15000, currentAmount: 7000 }
      });

      const request = new NextRequest('http://localhost:3000/api/goals?action=statistics');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toMatchObject({
        totalGoals: 5,
        totalTargetAmount: 75000,
        totalCurrentAmount: 35000,
        overallProgress: expect.any(Number),
        averageGoalSize: 15000
      });
    });

    it('should provide goal completion forecasts', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { amount: 500, date: new Date('2024-01-01'), goalId: 'goal-1' },
        { amount: 600, date: new Date('2024-02-01'), goalId: 'goal-1' },
        { amount: 550, date: new Date('2024-03-01'), goalId: 'goal-1' }
      ]);

      const request = new NextRequest('http://localhost:3000/api/goals?action=forecast&goalId=goal-1');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.projectedCompletion).toBeDefined();
      expect(data.data.confidenceLevel).toBeDefined();
      expect(data.data.recommendedMonthlyContribution).toBeDefined();
    });
  });
});