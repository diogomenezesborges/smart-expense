import { NextRequest, NextResponse } from 'next/server';
import { Insight } from '@/lib/services/ai-service';

// Mock insights generation - in production, use ML models and actual financial data
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 500));

    const insights = await generatePersonalizedInsights(userId);

    return NextResponse.json({
      success: true,
      insights,
      generatedAt: new Date().toISOString(),
      userId
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

async function generatePersonalizedInsights(userId: string): Promise<Insight[]> {
  // In production, fetch user's actual financial data and use ML models
  const insights: Insight[] = [
    {
      id: `insight-${Date.now()}-1`,
      title: 'Dining Out Trend Alert',
      description: 'Your restaurant spending has increased 28% compared to last month, representing €178 above your typical pattern. This trend started 3 weeks ago.',
      type: 'warning',
      priority: 'high',
      actionable: true,
      recommendations: [
        'Set a weekly dining budget of €65 to stay on track',
        'Try meal prepping on Sundays to reduce impulse dining',
        'Use the 80/20 rule: cook 80% of meals, dine out 20%',
        'Consider lunch specials instead of dinner dining to save 40%'
      ],
      impact: 'financial',
      confidence: 0.91,
      generatedAt: new Date()
    },
    {
      id: `insight-${Date.now()}-2`,
      title: 'Excellent Emergency Fund Progress',
      description: 'Outstanding work! You\'re 84% towards your €5,000 emergency fund goal and 2 months ahead of schedule. Your consistent €320/month contributions are paying off.',
      type: 'positive',
      priority: 'low',
      actionable: false,
      impact: 'goal-related',
      confidence: 0.97,
      generatedAt: new Date()
    },
    {
      id: `insight-${Date.now()}-3`,
      title: 'Subscription Optimization Opportunity',
      description: 'Analysis shows you have 7 active subscriptions totaling €89/month. 3 services show low usage patterns and could be cancelled to save €34/month.',
      type: 'opportunity',
      priority: 'medium',
      actionable: true,
      recommendations: [
        'Cancel Netflix premium subscription (switch to basic saves €8/month)',
        'Pause gym membership during winter months (saves €45/month)',
        'Consolidate music streaming services (currently have 2)',
        'Review annual subscriptions before auto-renewal'
      ],
      impact: 'financial',
      confidence: 0.85,
      generatedAt: new Date()
    },
    {
      id: `insight-${Date.now()}-4`,
      title: 'Transportation Efficiency Improvement',
      description: 'Great job! Your transportation costs decreased 15% this month through better route planning and reduced fuel consumption. This saves approximately €35/month.',
      type: 'positive',
      priority: 'low',
      actionable: false,
      impact: 'behavioral',
      confidence: 0.88,
      generatedAt: new Date()
    },
    {
      id: `insight-${Date.now()}-5`,
      title: 'Investment Opportunity Window',
      description: 'Your consistent 23% savings rate suggests you\'re ready to increase investment contributions. Consider allocating an additional €200/month to diversified index funds.',
      type: 'opportunity',
      priority: 'high',
      actionable: true,
      recommendations: [
        'Increase monthly investment by €200 (from surplus savings)',
        'Consider tax-advantaged retirement accounts first',
        'Diversify with international market exposure (20-30%)',
        'Set up automatic monthly transfers to investment accounts'
      ],
      impact: 'financial',
      confidence: 0.82,
      generatedAt: new Date()
    },
    {
      id: `insight-${Date.now()}-6`,
      title: 'Budget Category Rebalancing Needed',
      description: 'Your entertainment spending (€445) exceeds the recommended 5-10% of income. Consider reallocating €100/month to your emergency fund to maintain balance.',
      type: 'warning',
      priority: 'medium',
      actionable: true,
      recommendations: [
        'Set entertainment budget to €350/month (8% of income)',
        'Look for free/low-cost entertainment alternatives',
        'Use the envelope method for discretionary spending',
        'Redirect savings to high-priority goals'
      ],
      impact: 'financial',
      confidence: 0.79,
      generatedAt: new Date()
    },
    {
      id: `insight-${Date.now()}-7`,
      title: 'Seasonal Spending Pattern Detected',
      description: 'Historical data shows your expenses typically increase 12% during holiday months. Plan ahead by saving an extra €150/month starting in October.',
      type: 'neutral',
      priority: 'low',
      actionable: true,
      recommendations: [
        'Create a holiday spending fund starting October',
        'Set gift budget limits early to avoid overspending',
        'Take advantage of early bird discounts and sales',
        'Consider experience gifts over material items'
      ],
      impact: 'behavioral',
      confidence: 0.86,
      generatedAt: new Date()
    },
    {
      id: `insight-${Date.now()}-8`,
      title: 'Debt-to-Income Ratio Excellent',
      description: 'Your debt-to-income ratio of 12% is well below the recommended 20% threshold. This strong position allows for aggressive goal pursuit.',
      type: 'positive',
      priority: 'low',
      actionable: false,
      impact: 'financial',
      confidence: 0.94,
      generatedAt: new Date()
    }
  ];

  // Randomize which insights to return (simulate ML selection)
  const selectedInsights = insights
    .sort(() => Math.random() - 0.5)
    .slice(0, 5 + Math.floor(Math.random() * 3));

  return selectedInsights;
}