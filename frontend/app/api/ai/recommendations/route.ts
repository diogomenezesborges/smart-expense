import { NextRequest, NextResponse } from 'next/server';
import { Recommendation, FinancialContext } from '@/lib/services/ai-service';

export async function POST(request: NextRequest) {
  try {
    const context: FinancialContext = await request.json();

    if (!context || !context.userId) {
      return NextResponse.json(
        { error: 'Financial context is required' },
        { status: 400 }
      );
    }

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const recommendations = await generateRecommendations(context);

    return NextResponse.json({
      success: true,
      recommendations,
      generatedAt: new Date().toISOString(),
      context: {
        userId: context.userId,
        timeframe: context.timeframe
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

async function generateRecommendations(context: FinancialContext): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];
  const savingsRate = ((context.totalIncome - context.totalExpenses) / context.totalIncome);
  const monthlySavings = context.totalIncome - context.totalExpenses;

  // Spending optimization recommendations
  const foodSpending = context.categories['Food & Dining'] || 0;
  const subscriptionSpending = (context.categories['Entertainment'] || 0) * 0.4; // Estimate subscriptions
  
  if (foodSpending > context.totalIncome * 0.15) {
    recommendations.push({
      id: `rec-spending-food-${Date.now()}`,
      title: 'Optimize Food & Dining Expenses',
      description: `Your food spending (€${foodSpending.toLocaleString()}) is above the recommended 10-15% of income. Reduce by €${Math.round(foodSpending - context.totalIncome * 0.12)}/month through meal planning.`,
      category: 'spending',
      priority: 'high',
      estimatedImpact: {
        savings: Math.round((foodSpending - context.totalIncome * 0.12) * 12)
      },
      actionSteps: [
        'Plan weekly meals and create shopping lists',
        'Cook 4-5 meals at home per week instead of dining out',
        'Use grocery store loyalty programs and coupons',
        'Try batch cooking on weekends to save time',
        'Set a strict weekly dining out budget of €75'
      ],
      difficulty: 'medium',
      timeframe: '2-3 weeks'
    });
  }

  if (subscriptionSpending > 50) {
    recommendations.push({
      id: `rec-spending-subscriptions-${Date.now()}`,
      title: 'Audit and Optimize Subscriptions',
      description: `Review your subscription services and cancel underutilized ones to save €${Math.round(subscriptionSpending * 0.4)}/month.`,
      category: 'spending',
      priority: 'medium',
      estimatedImpact: {
        savings: Math.round(subscriptionSpending * 0.4 * 12)
      },
      actionSteps: [
        'List all active subscriptions and their costs',
        'Review usage patterns for the last 3 months',
        'Cancel services used less than twice per month',
        'Downgrade premium subscriptions to basic plans',
        'Set calendar reminders for annual subscription renewals'
      ],
      difficulty: 'easy',
      timeframe: '1 week'
    });
  }

  // Savings recommendations
  if (savingsRate < 0.15) {
    recommendations.push({
      id: `rec-saving-rate-${Date.now()}`,
      title: 'Increase Emergency Fund Contributions',
      description: `Your current savings rate of ${Math.round(savingsRate * 100)}% is below the recommended 15-20%. Increase monthly savings by €${Math.round(context.totalIncome * 0.15 - monthlySavings)}.`,
      category: 'saving',
      priority: 'high',
      estimatedImpact: {
        timeToGoal: -90 // days saved on emergency fund goal
      },
      actionSteps: [
        'Set up automatic transfer of additional savings',
        'Use high-yield savings account for emergency fund',
        'Apply the "pay yourself first" principle',
        'Track progress weekly to stay motivated',
        'Celebrate milestones to maintain momentum'
      ],
      difficulty: 'medium',
      timeframe: '2 weeks'
    });
  }

  if (monthlySavings > 500 && savingsRate > 0.20) {
    recommendations.push({
      id: `rec-saving-investment-${Date.now()}`,
      title: 'Start Investment Portfolio',
      description: `Your excellent savings rate suggests readiness for investing. Consider allocating €${Math.round(monthlySavings * 0.6)}/month to diversified investments.`,
      category: 'investing',
      priority: 'medium',
      estimatedImpact: {
        savings: Math.round(monthlySavings * 0.6 * 12 * 1.07) // 7% expected return
      },
      actionSteps: [
        'Open investment account with low-cost broker',
        'Start with broad market index funds (80% allocation)',
        'Add international diversification (20% allocation)',
        'Set up automatic monthly investments',
        'Review and rebalance quarterly'
      ],
      difficulty: 'medium',
      timeframe: '3-4 weeks'
    });
  }

  // Goal-specific recommendations
  if (context.goals.length > 0) {
    const urgentGoal = context.goals
      .filter(goal => goal.deadline.getTime() < Date.now() + (365 * 24 * 60 * 60 * 1000))
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())[0];

    if (urgentGoal) {
      const remaining = urgentGoal.target - urgentGoal.current;
      const monthsLeft = Math.max(1, Math.ceil((urgentGoal.deadline.getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)));
      const monthlyRequired = remaining / monthsLeft;

      if (monthlyRequired > monthlySavings * 0.5) {
        recommendations.push({
          id: `rec-goal-${urgentGoal.id}-${Date.now()}`,
          title: `Accelerate "${urgentGoal.name}" Goal`,
          description: `To reach your €${urgentGoal.target.toLocaleString()} goal by the deadline, you need €${Math.round(monthlyRequired)}/month. Consider increasing contributions or extending timeline.`,
          category: 'goal-setting',
          priority: 'high',
          estimatedImpact: {
            timeToGoal: monthsLeft * 30
          },
          actionSteps: [
            'Increase goal contributions to €' + Math.round(monthlyRequired) + '/month',
            'Look for additional income sources (side hustle, freelancing)',
            'Reduce discretionary spending temporarily',
            'Consider extending goal deadline if needed',
            'Break goal into smaller weekly milestones'
          ],
          difficulty: 'hard',
          timeframe: '1 month'
        });
      }
    }
  }

  // Budgeting recommendations
  const needsBudget = (context.categories['Bills & Utilities'] || 0) + 
                     (context.categories['Healthcare'] || 0);
  const wantsBudget = context.totalExpenses - needsBudget;
  
  if (wantsBudget > context.totalIncome * 0.35) {
    recommendations.push({
      id: `rec-budget-rebalance-${Date.now()}`,
      title: 'Rebalance Budget Categories',
      description: `Your discretionary spending (€${Math.round(wantsBudget)}) exceeds 35% of income. Apply the 50/30/20 rule for better balance.`,
      category: 'budgeting',
      priority: 'medium',
      estimatedImpact: {
        savings: Math.round((wantsBudget - context.totalIncome * 0.30) * 12)
      },
      actionSteps: [
        'Categorize all expenses into needs vs wants',
        'Target 50% needs, 30% wants, 20% savings allocation',
        'Use budgeting app to track category spending',
        'Review and adjust budget monthly',
        'Implement zero-based budgeting for discretionary items'
      ],
      difficulty: 'medium',
      timeframe: '3-4 weeks'
    });
  }

  // Advanced recommendations for high savers
  if (savingsRate > 0.25) {
    recommendations.push({
      id: `rec-advanced-tax-${Date.now()}`,
      title: 'Optimize Tax-Advantaged Accounts',
      description: `Your high savings rate qualifies you for advanced tax optimization. Maximize retirement account contributions to reduce taxable income.`,
      category: 'investing',
      priority: 'low',
      estimatedImpact: {
        savings: Math.round(context.totalIncome * 0.15) // Estimated tax savings
      },
      actionSteps: [
        'Maximize employer 401(k) match if available',
        'Contribute to IRA or Roth IRA based on income level',
        'Consider HSA if eligible for triple tax advantage',
        'Explore tax-loss harvesting for taxable accounts',
        'Consult tax professional for optimization strategies'
      ],
      difficulty: 'hard',
      timeframe: '1-2 months'
    });
  }

  // Sort recommendations by priority and impact
  return recommendations.sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityWeight[a.priority];
    const bPriority = priorityWeight[b.priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    const aImpact = (a.estimatedImpact.savings || 0) + (a.estimatedImpact.timeToGoal ? Math.abs(a.estimatedImpact.timeToGoal) * 10 : 0);
    const bImpact = (b.estimatedImpact.savings || 0) + (b.estimatedImpact.timeToGoal ? Math.abs(b.estimatedImpact.timeToGoal) * 10 : 0);
    
    return bImpact - aImpact;
  }).slice(0, 8); // Return top 8 recommendations
}