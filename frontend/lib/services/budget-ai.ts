// AI-Powered Budget Recommendations Service
interface SpendingPattern {
  category: string;
  averageMonthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: 'high' | 'medium' | 'low';
  seasonality: boolean;
}

interface FinancialProfile {
  monthlyIncome: number;
  currentSpending: SpendingPattern[];
  savingsRate: number;
  debtToIncomeRatio: number;
  financialGoals: FinancialGoal[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  lifeStage: 'student' | 'early-career' | 'established' | 'pre-retirement' | 'retirement';
}

interface FinancialGoal {
  id: string;
  name: string;
  target: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  type: 'emergency-fund' | 'house' | 'vacation' | 'retirement' | 'debt-payoff' | 'education';
}

interface BudgetRecommendation {
  category: string;
  currentAmount: number;
  recommendedAmount: number;
  reasoning: string;
  confidenceScore: number;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
}

interface BudgetAnalysis {
  overallScore: number;
  recommendations: BudgetRecommendation[];
  warnings: BudgetWarning[];
  opportunities: BudgetOpportunity[];
  predictedOutcomes: PredictedOutcome[];
}

interface BudgetWarning {
  type: 'overspending' | 'undersaving' | 'imbalanced' | 'unrealistic';
  severity: 'high' | 'medium' | 'low';
  message: string;
  affectedCategories: string[];
  suggestedActions: string[];
}

interface BudgetOpportunity {
  type: 'cost-reduction' | 'income-optimization' | 'tax-savings' | 'investment';
  category: string;
  potentialSavings: number;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
}

interface PredictedOutcome {
  scenario: string;
  timeframe: '3-months' | '6-months' | '1-year' | '5-years';
  probability: number;
  description: string;
  impact: number;
}

export class BudgetAIService {
  private financialProfile: FinancialProfile;

  constructor() {
    // Mock financial profile - in production this would come from user data
    this.financialProfile = {
      monthlyIncome: 4200,
      currentSpending: [
        {
          category: 'Food & Dining',
          averageMonthly: 567,
          trend: 'stable',
          volatility: 'medium',
          seasonality: false
        },
        {
          category: 'Transportation',
          averageMonthly: 379,
          trend: 'increasing',
          volatility: 'high',
          seasonality: false
        },
        {
          category: 'Bills & Utilities',
          averageMonthly: 645,
          trend: 'stable',
          volatility: 'low',
          seasonality: true
        },
        {
          category: 'Entertainment',
          averageMonthly: 235,
          trend: 'decreasing',
          volatility: 'high',
          seasonality: true
        }
      ],
      savingsRate: 22.7,
      debtToIncomeRatio: 0.15,
      financialGoals: [
        {
          id: '1',
          name: 'Emergency Fund',
          target: 25000,
          deadline: '2025-12-31',
          priority: 'high',
          type: 'emergency-fund'
        },
        {
          id: '2',
          name: 'House Down Payment',
          target: 50000,
          deadline: '2027-06-30',
          priority: 'high',
          type: 'house'
        }
      ],
      riskTolerance: 'moderate',
      lifeStage: 'early-career'
    };
  }

  async generateBudgetRecommendations(proposedBudget: any): Promise<BudgetAnalysis> {
    const recommendations = this.analyzeBudgetCategories(proposedBudget);
    const warnings = this.identifyBudgetWarnings(proposedBudget);
    const opportunities = this.findOptimizationOpportunities(proposedBudget);
    const predictedOutcomes = this.predictBudgetOutcomes(proposedBudget);
    const overallScore = this.calculateBudgetScore(proposedBudget);

    return {
      overallScore,
      recommendations,
      warnings,
      opportunities,
      predictedOutcomes
    };
  }

  private analyzeBudgetCategories(budget: any): BudgetRecommendation[] {
    const recommendations: BudgetRecommendation[] = [];

    budget.categories.forEach((category: any) => {
      const historicalSpending = this.financialProfile.currentSpending.find(
        s => s.category.toLowerCase().includes(category.name.toLowerCase())
      );

      if (historicalSpending) {
        const recommendation = this.generateCategoryRecommendation(category, historicalSpending);
        recommendations.push(recommendation);
      }
    });

    return recommendations;
  }

  private generateCategoryRecommendation(category: any, historical: SpendingPattern): BudgetRecommendation {
    const variance = category.amount - historical.averageMonthly;
    const variancePercentage = (variance / historical.averageMonthly) * 100;
    
    let reasoning = '';
    let recommendedAmount = category.amount;
    let impact: 'high' | 'medium' | 'low' = 'low';
    const actionItems: string[] = [];

    if (Math.abs(variancePercentage) > 20) {
      impact = 'high';
      
      if (variance > 0) {
        // Budget is significantly higher than historical
        reasoning = `Your ${category.name} budget is ${Math.abs(variancePercentage).toFixed(0)}% higher than your average spending of €${historical.averageMonthly}. `;
        
        if (category.isEssential) {
          reasoning += 'Since this is an essential category, consider if this increase is necessary or if you can find cost-saving opportunities.';
          recommendedAmount = Math.round(historical.averageMonthly * 1.1); // 10% buffer for essentials
          actionItems.push('Review recent bills for any increases');
          actionItems.push('Look for service provider alternatives');
        } else {
          reasoning += 'This non-essential category has room for reduction without affecting your basic needs.';
          recommendedAmount = Math.round(historical.averageMonthly * 1.05); // 5% buffer for non-essentials
          actionItems.push('Consider reducing discretionary spending');
          actionItems.push('Set weekly spending limits');
        }
      } else {
        // Budget is significantly lower than historical
        reasoning = `Your ${category.name} budget is ${Math.abs(variancePercentage).toFixed(0)}% lower than your average spending. `;
        
        if (category.isEssential) {
          reasoning += 'This may be too aggressive for an essential category and could lead to overspending.';
          recommendedAmount = Math.round(historical.averageMonthly * 0.95); // Small reduction for essentials
          actionItems.push('Monitor spending closely in first month');
          actionItems.push('Have backup plan if budget is insufficient');
        } else {
          reasoning += 'This is an ambitious but achievable reduction goal.';
          recommendedAmount = category.amount; // Keep aggressive goal for non-essentials
          actionItems.push('Find alternative activities or substitutes');
          actionItems.push('Use spending tracking apps');
        }
      }
    } else {
      // Budget is close to historical spending
      impact = 'low';
      reasoning = `Your ${category.name} budget aligns well with your historical spending pattern.`;
      
      if (historical.trend === 'increasing') {
        reasoning += ' However, consider that this category has been trending upward recently.';
        recommendedAmount = Math.round(category.amount * 1.05);
        actionItems.push('Monitor for continued increases');
      } else if (historical.trend === 'decreasing') {
        reasoning += ' This category has been decreasing, so you might have room to reduce further.';
        recommendedAmount = Math.round(category.amount * 0.98);
        actionItems.push('Consider modest reduction opportunities');
      }
    }

    return {
      category: category.name,
      currentAmount: category.amount,
      recommendedAmount,
      reasoning,
      confidenceScore: this.calculateConfidenceScore(historical),
      impact,
      actionItems
    };
  }

  private calculateConfidenceScore(historical: SpendingPattern): number {
    let score = 80; // Base confidence
    
    // Reduce confidence for high volatility
    if (historical.volatility === 'high') score -= 20;
    else if (historical.volatility === 'medium') score -= 10;
    
    // Reduce confidence for seasonal patterns
    if (historical.seasonality) score -= 10;
    
    // Adjust for trend stability
    if (historical.trend === 'stable') score += 10;
    else score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private identifyBudgetWarnings(budget: any): BudgetWarning[] {
    const warnings: BudgetWarning[] = [];
    
    // Check for overspending
    if (budget.totalAllocated > budget.monthlyIncome) {
      warnings.push({
        type: 'overspending',
        severity: 'high',
        message: `Your budget exceeds your income by €${(budget.totalAllocated - budget.monthlyIncome).toFixed(0)}`,
        affectedCategories: ['all'],
        suggestedActions: [
          'Reduce non-essential categories',
          'Consider increasing income sources',
          'Review and eliminate unnecessary expenses'
        ]
      });
    }

    // Check savings rate
    const savingsCategories = budget.categories.filter((c: any) => 
      c.name.toLowerCase().includes('savings') || c.name.toLowerCase().includes('investment')
    );
    const totalSavings = savingsCategories.reduce((sum: number, cat: any) => sum + cat.amount, 0);
    const savingsRate = (totalSavings / budget.monthlyIncome) * 100;
    
    if (savingsRate < 10) {
      warnings.push({
        type: 'undersaving',
        severity: savingsRate < 5 ? 'high' : 'medium',
        message: `Your savings rate is ${savingsRate.toFixed(1)}%, below the recommended 10-20%`,
        affectedCategories: savingsCategories.map((c: any) => c.name),
        suggestedActions: [
          'Increase emergency fund allocation',
          'Reduce discretionary spending',
          'Automate savings transfers'
        ]
      });
    }

    // Check for unrealistic category allocations
    budget.categories.forEach((category: any) => {
      const historical = this.financialProfile.currentSpending.find(
        s => s.category.toLowerCase().includes(category.name.toLowerCase())
      );
      
      if (historical) {
        const reduction = (historical.averageMonthly - category.amount) / historical.averageMonthly;
        if (reduction > 0.5 && category.isEssential) {
          warnings.push({
            type: 'unrealistic',
            severity: 'medium',
            message: `${category.name} budget may be too aggressive - 50%+ reduction from current spending`,
            affectedCategories: [category.name],
            suggestedActions: [
              'Set a more gradual reduction goal',
              'Identify specific areas to cut first',
              'Monitor progress weekly'
            ]
          });
        }
      }
    });

    return warnings;
  }

  private findOptimizationOpportunities(budget: any): BudgetOpportunity[] {
    const opportunities: BudgetOpportunity[] = [];

    // Subscription optimization
    const entertainmentCategory = budget.categories.find((c: any) => 
      c.name.toLowerCase().includes('entertainment')
    );
    
    if (entertainmentCategory && entertainmentCategory.amount > 200) {
      opportunities.push({
        type: 'cost-reduction',
        category: 'Entertainment',
        potentialSavings: 50,
        description: 'Audit and cancel unused subscriptions, share family plans',
        difficulty: 'easy',
        timeframe: '1 week'
      });
    }

    // Transportation optimization
    const transportCategory = budget.categories.find((c: any) => 
      c.name.toLowerCase().includes('transport')
    );
    
    if (transportCategory && transportCategory.amount > 300) {
      opportunities.push({
        type: 'cost-reduction',
        category: 'Transportation',
        potentialSavings: 80,
        description: 'Combine trips, use public transport, consider carpooling',
        difficulty: 'medium',
        timeframe: '2 weeks'
      });
    }

    // Investment opportunity
    const totalSavings = budget.categories
      .filter((c: any) => c.name.toLowerCase().includes('savings'))
      .reduce((sum: number, cat: any) => sum + cat.amount, 0);
    
    if (totalSavings > 500) {
      opportunities.push({
        type: 'investment',
        category: 'Investments',
        potentialSavings: totalSavings * 0.05 * 12, // 5% annual return
        description: 'Move excess savings to investment accounts for better returns',
        difficulty: 'medium',
        timeframe: '1 month'
      });
    }

    return opportunities;
  }

  private predictBudgetOutcomes(budget: any): PredictedOutcome[] {
    const outcomes: PredictedOutcome[] = [];
    
    const savingsRate = (budget.categories
      .filter((c: any) => c.name.toLowerCase().includes('savings') || c.name.toLowerCase().includes('investment'))
      .reduce((sum: number, cat: any) => sum + cat.amount, 0) / budget.monthlyIncome) * 100;

    // Emergency fund prediction
    const emergencyFundGoal = this.financialProfile.financialGoals.find(g => g.type === 'emergency-fund');
    if (emergencyFundGoal) {
      const monthsToGoal = emergencyFundGoal.target / (budget.monthlyIncome * savingsRate / 100);
      
      outcomes.push({
        scenario: 'Emergency Fund Completion',
        timeframe: monthsToGoal < 6 ? '6-months' : monthsToGoal < 12 ? '1-year' : '5-years',
        probability: savingsRate > 15 ? 85 : savingsRate > 10 ? 70 : 50,
        description: `At current savings rate, you'll reach your emergency fund goal in ${Math.ceil(monthsToGoal)} months`,
        impact: emergencyFundGoal.target
      });
    }

    // Debt payoff prediction
    if (this.financialProfile.debtToIncomeRatio > 0) {
      outcomes.push({
        scenario: 'Debt Freedom',
        timeframe: '1-year',
        probability: 75,
        description: 'Maintaining this budget could reduce debt-to-income ratio by 50%',
        impact: budget.monthlyIncome * 0.1 * 12 // Approximate annual debt reduction
      });
    }

    // Budget adherence prediction
    const adherenceProbability = this.calculateAdherenceProbability(budget);
    outcomes.push({
      scenario: 'Budget Adherence',
      timeframe: '3-months',
      probability: adherenceProbability,
      description: `Based on historical patterns, ${adherenceProbability}% chance of staying within budget`,
      impact: budget.totalAllocated * 0.05 // 5% variance impact
    });

    return outcomes;
  }

  private calculateAdherenceProbability(budget: any): number {
    let probability = 70; // Base probability
    
    // Reduce probability for aggressive cuts
    budget.categories.forEach((category: any) => {
      const historical = this.financialProfile.currentSpending.find(
        s => s.category.toLowerCase().includes(category.name.toLowerCase())
      );
      
      if (historical) {
        const reduction = (historical.averageMonthly - category.amount) / historical.averageMonthly;
        if (reduction > 0.3) probability -= 15; // Aggressive cuts reduce adherence
        else if (reduction > 0.1) probability -= 5; // Moderate cuts slightly reduce adherence
      }
    });

    // Increase probability for realistic budgets
    const totalVariance = Math.abs(budget.totalAllocated - budget.monthlyIncome) / budget.monthlyIncome;
    if (totalVariance < 0.05) probability += 10; // Well-balanced budget

    return Math.max(30, Math.min(95, probability));
  }

  private calculateBudgetScore(budget: any): number {
    let score = 0;
    const maxScore = 100;

    // Allocation balance (30 points)
    const allocationBalance = 1 - Math.abs(budget.totalAllocated - budget.monthlyIncome) / budget.monthlyIncome;
    score += Math.max(0, allocationBalance * 30);

    // Savings rate (25 points)
    const savingsAmount = budget.categories
      .filter((c: any) => c.name.toLowerCase().includes('savings') || c.name.toLowerCase().includes('investment'))
      .reduce((sum: number, cat: any) => sum + cat.amount, 0);
    const savingsRate = (savingsAmount / budget.monthlyIncome) * 100;
    score += Math.min(25, (savingsRate / 20) * 25); // 20% savings = full points

    // Essential vs non-essential balance (20 points)
    const essentialAmount = budget.categories
      .filter((c: any) => c.isEssential)
      .reduce((sum: number, cat: any) => sum + cat.amount, 0);
    const essentialPercentage = (essentialAmount / budget.totalAllocated) * 100;
    // Optimal essential percentage is 50-70%
    const essentialScore = essentialPercentage >= 50 && essentialPercentage <= 70 ? 20 : 
                          Math.max(0, 20 - Math.abs(60 - essentialPercentage) * 0.5);
    score += essentialScore;

    // Realistic expectations (15 points)
    let realismScore = 15;
    budget.categories.forEach((category: any) => {
      const historical = this.financialProfile.currentSpending.find(
        s => s.category.toLowerCase().includes(category.name.toLowerCase())
      );
      
      if (historical) {
        const reduction = (historical.averageMonthly - category.amount) / historical.averageMonthly;
        if (reduction > 0.5) realismScore -= 5; // Very aggressive cuts
        else if (reduction > 0.3) realismScore -= 2; // Moderately aggressive cuts
      }
    });
    score += Math.max(0, realismScore);

    // Goal alignment (10 points)
    const goalAlignmentScore = this.calculateGoalAlignment(budget);
    score += goalAlignmentScore;

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private calculateGoalAlignment(budget: any): number {
    let alignmentScore = 0;
    const savingsAmount = budget.categories
      .filter((c: any) => c.name.toLowerCase().includes('savings') || c.name.toLowerCase().includes('investment'))
      .reduce((sum: number, cat: any) => sum + cat.amount, 0);

    // Check if savings support high-priority goals
    const highPriorityGoals = this.financialProfile.financialGoals.filter(g => g.priority === 'high');
    const totalGoalTarget = highPriorityGoals.reduce((sum, goal) => {
      const deadline = new Date(goal.deadline);
      const monthsToDeadline = Math.max(1, (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
      return sum + (goal.target / monthsToDeadline);
    }, 0);

    if (savingsAmount >= totalGoalTarget * 0.8) alignmentScore = 10; // 80% of required savings
    else if (savingsAmount >= totalGoalTarget * 0.6) alignmentScore = 7; // 60% of required savings
    else if (savingsAmount >= totalGoalTarget * 0.4) alignmentScore = 4; // 40% of required savings
    else alignmentScore = 2; // Below 40%

    return alignmentScore;
  }

  // Public method to get AI insights for a category
  async getCategoryInsights(categoryName: string, currentAmount: number): Promise<any> {
    const historical = this.financialProfile.currentSpending.find(
      s => s.category.toLowerCase().includes(categoryName.toLowerCase())
    );

    if (!historical) {
      return {
        recommendation: 'No historical data available for personalized recommendations',
        confidence: 0,
        suggestions: ['Track spending for a few months to get personalized insights']
      };
    }

    const variance = currentAmount - historical.averageMonthly;
    const suggestions = [];

    if (variance > historical.averageMonthly * 0.2) {
      suggestions.push('Consider if this increase is necessary');
      suggestions.push('Look for cost-saving alternatives');
    } else if (variance < -historical.averageMonthly * 0.2) {
      suggestions.push('Monitor carefully to ensure budget is realistic');
      suggestions.push('Have a backup plan if budget proves insufficient');
    } else {
      suggestions.push('Budget aligns well with historical spending');
      suggestions.push('Consider small optimizations for additional savings');
    }

    return {
      recommendation: `Based on your average spending of €${historical.averageMonthly}, this budget is ${variance > 0 ? 'higher' : 'lower'} by €${Math.abs(variance)}`,
      confidence: this.calculateConfidenceScore(historical),
      suggestions,
      trend: historical.trend,
      volatility: historical.volatility
    };
  }

  // Update financial profile with new data
  updateFinancialProfile(newData: Partial<FinancialProfile>): void {
    this.financialProfile = { ...this.financialProfile, ...newData };
  }
}

// Singleton instance
export const budgetAI = new BudgetAIService();