import { NextRequest, NextResponse } from 'next/server';
import { goalsService, GoalType, GoalStatus, GoalPeriod } from '@/lib/services/goals-service';
import { z } from 'zod';

const createGoalSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['savings', 'spending_limit', 'investment', 'debt_reduction', 'emergency_fund']),
  period: z.enum(['monthly', 'quarterly', 'yearly', 'one_time']),
  targetAmount: z.number().positive(),
  startDate: z.string().transform(val => new Date(val)),
  targetDate: z.string().transform(val => new Date(val)),
  categoryId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  isRecurring: z.boolean().default(false),
  notifications: z.boolean().default(true),
});

const updateGoalSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused', 'failed']).optional(),
  targetAmount: z.number().positive().optional(),
  currentAmount: z.number().min(0).optional(),
  targetDate: z.string().transform(val => new Date(val)).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  notifications: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as GoalStatus | null;
    const type = searchParams.get('type') as GoalType | null;
    const action = searchParams.get('action');

    if (action === 'insights') {
      const insights = await goalsService.getGoalInsights();
      return NextResponse.json({
        success: true,
        data: insights,
      });
    }

    if (action === 'progress') {
      const goalId = searchParams.get('goalId');
      if (!goalId) {
        return NextResponse.json(
          { success: false, error: 'Goal ID required for progress' },
          { status: 400 }
        );
      }

      const progress = await goalsService.calculateProgress(goalId);
      if (!progress) {
        return NextResponse.json(
          { success: false, error: 'Goal not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: progress,
      });
    }

    const goals = await goalsService.getGoals(status || undefined, type || undefined);

    return NextResponse.json({
      success: true,
      data: goals,
    });

  } catch (error) {
    console.error('Goals API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_sample') {
      await goalsService.createSampleGoals();
      return NextResponse.json({
        success: true,
        message: 'Sample goals created successfully',
      });
    }

    if (action === 'update_progress') {
      const { goalId, amount } = body;
      if (!goalId || typeof amount !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Goal ID and amount required' },
          { status: 400 }
        );
      }

      const success = await goalsService.updateGoalProgress(goalId, amount);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to update progress' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Progress updated successfully',
      });
    }

    // Create new goal
    const validatedData = createGoalSchema.parse(body);
    const goal = await goalsService.createGoal({
      ...validatedData,
      status: 'active',
    });

    return NextResponse.json({
      success: true,
      data: goal,
    });

  } catch (error) {
    console.error('Goals API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request parameters',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { goalId, ...updates } = body;

    if (!goalId) {
      return NextResponse.json(
        { success: false, error: 'Goal ID required' },
        { status: 400 }
      );
    }

    const validatedUpdates = updateGoalSchema.parse(updates);
    const updatedGoal = await goalsService.updateGoal(goalId, validatedUpdates);

    if (!updatedGoal) {
      return NextResponse.json(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedGoal,
    });

  } catch (error) {
    console.error('Goals API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request parameters',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const goalId = searchParams.get('goalId');

    if (!goalId) {
      return NextResponse.json(
        { success: false, error: 'Goal ID required' },
        { status: 400 }
      );
    }

    const success = await goalsService.deleteGoal(goalId);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Goal deleted successfully',
    });

  } catch (error) {
    console.error('Goals API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}