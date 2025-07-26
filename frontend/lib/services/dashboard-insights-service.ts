// Dashboard Insights Service - Enhanced Analytics and AI-Powered Recommendations
import { FinancialContext } from './ai-service';
import { GeminiAIService } from './gemini-ai-service';

export interface DashboardInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error' | 'opportunity';
  category: 'spending' | 'savings' | 'budget' | 'trends' | 'goals' | 'sync';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  action?: string;
  actionUrl?: string;
  data?: any;
  generatedAt: Date;
  expiresAt?: Date;
}

export interface BudgetAlert {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
  status: 'good' | 'warning' | 'danger';
  daysRemaining: number;
  projectedSpend?: number;
  recommendedAdjustment?: number;
}

export interface SpendingPattern {
  pattern: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  frequency: number;
  averageAmount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface FinancialMetrics {
  savingsRate: number;
  expenseRatio: Record<string, number>;
  cashFlowTrend: 'improving' | 'declining' | 'stable';
  financialHealthScore: number;
  budgetAdherence: number;
  emergencyFundMonths: number;
}

export class DashboardInsightsService {
  private geminiService: GeminiAIService | null = null;

  constructor() {
    // Initialize Gemini service if API key is available
    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      this.geminiService = new GeminiAIService({
        apiKey: geminiApiKey,
        model: 'gemini-1.5-flash'
      });
    }
  }

  /**
   * Generate comprehensive dashboard insights
   */
  async generateDashboardInsights(financialContext: FinancialContext): Promise<DashboardInsight[]> {
    const insights: DashboardInsight[] = [];

    try {
      // Generate AI-powered insights if Gemini is available
      if (this.geminiService) {
        const aiInsights = await this.generateAIInsights(financialContext);
        insights.push(...aiInsights);
      }

      // Generate rule-based insights
      const ruleBasedInsights = this.generateRuleBasedInsights(financialContext);
      insights.push(...ruleBasedInsights);

      // Sort by priority and confidence
      return insights
        .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 6); // Limit to top 6 insights

    } catch (error) {
      console.error('Error generating dashboard insights:', error);
      return this.getFallbackInsights(financialContext);
    }
  }

  /**
   * Generate AI-powered insights using Gemini
   */
  private async generateAIInsights(financialContext: FinancialContext): Promise<DashboardInsight[]> {
    if (!this.geminiService) return [];

    try {
      const insights = await this.geminiService.generateInsights(financialContext);
      
      return insights.map((insight: any, index: number) => ({
        id: `ai-insight-${index}`,
        type: this.mapInsightType(insight.type),
        category: this.inferCategory(insight.title, insight.description),
        title: insight.title,
        description: insight.description,
        priority: insight.priority || 'medium',
        confidence: insight.confidence || 0.8,
        action: this.generateActionFromInsight(insight),
        actionUrl: this.generateActionUrl(insight),
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire in 24 hours
      }));
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return [];
    }
  }

  /**
   * Generate rule-based insights
   */
  private generateRuleBasedInsights(financialContext: FinancialContext): Promise<DashboardInsight[]> {
    const insights: DashboardInsight[] = [];
    const savingsRate = this.calculateSavingsRate(financialContext);
    const totalExpenses = financialContext.totalExpenses;
    
    // Savings rate insights
    if (savingsRate > 0.25) {
      insights.push({
        id: 'excellent-savings',
        type: 'success',
        category: 'savings',
        title: 'Excellent Savings Performance',
        description: `You're saving ${(savingsRate * 100).toFixed(1)}% of your income, well above the recommended 20%.`,
        priority: 'medium',
        confidence: 0.95,
        action: 'Explore Investment Options',
        actionUrl: '/analytics/investments',
        generatedAt: new Date()
      });
    } else if (savingsRate < 0.1) {
      insights.push({
        id: 'low-savings',
        type: 'warning',
        category: 'savings',
        title: 'Low Savings Rate Alert',
        description: `Your savings rate is ${(savingsRate * 100).toFixed(1)}%. Consider reducing expenses or increasing income.`,
        priority: 'high',
        confidence: 0.9,
        action: 'Create Savings Plan',
        actionUrl: '/budgeting',
        generatedAt: new Date()
      });
    }

    // Category spending insights
    const topCategory = Object.entries(financialContext.categories)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory && topCategory[1] > totalExpenses * 0.4) {
      insights.push({
        id: 'high-category-spending',
        type: 'warning',
        category: 'spending',
        title: `High ${topCategory[0]} Spending`,
        description: `${topCategory[0]} represents ${((topCategory[1] / totalExpenses) * 100).toFixed(1)}% of your expenses.`,
        priority: 'medium',
        confidence: 0.85,
        action: 'Review Category',
        actionUrl: `/transactions?category=${encodeURIComponent(topCategory[0])}`,
        generatedAt: new Date()
      });
    }

    // Goals progress insights
    financialContext.goals.forEach(goal => {
      const progress = (goal.current / goal.target) * 100;
      const daysLeft = Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const monthlyRequired = daysLeft > 0 ? (goal.target - goal.current) / (daysLeft / 30) : 0;
      
      if (progress >= 80) {
        insights.push({
          id: `goal-progress-${goal.id}`,
          type: 'success',
          category: 'goals',
          title: `${goal.name} Almost Complete`,
          description: `You're ${progress.toFixed(1)}% towards your ${goal.name} goal!`,
          priority: 'low',
          confidence: 0.9,
          action: 'View Goal',
          actionUrl: '/goals',
          generatedAt: new Date()
        });
      } else if (monthlyRequired > financialContext.totalIncome * 0.3) {
        insights.push({
          id: `goal-unrealistic-${goal.id}`,
          type: 'warning',
          category: 'goals',
          title: `${goal.name} Goal May Be Unrealistic`,
          description: `You need to save €${monthlyRequired.toFixed(0)}/month to reach this goal.`,
          priority: 'medium',
          confidence: 0.8,
          action: 'Adjust Goal',
          actionUrl: '/goals',
          generatedAt: new Date()
        });
      }
    });

    return Promise.resolve(insights);
  }

  /**
   * Generate enhanced budget alerts with predictions
   */
  async generateBudgetAlerts(financialContext: FinancialContext): Promise<BudgetAlert[]> {
    // This would typically fetch budget data from API
    // For now, return mock data with enhanced calculations
    const mockBudgets = [
      { category: 'Alimentação', budget: 800, spent: 567.45 },
      { category: 'Transportes', budget: 400, spent: 378.90 },
      { category: 'Casa', budget: 600, spent: 645.30 },
      { category: 'Entretenimento', budget: 300, spent: 180.50 },
      { category: 'Compras', budget: 250, spent: 420.80 }
    ];

    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const currentDay = new Date().getDate();
    const daysRemaining = daysInMonth - currentDay;
    const monthProgress = currentDay / daysInMonth;

    return mockBudgets.map(budget => {
      const percentage = (budget.spent / budget.budget) * 100;
      const dailyAverage = budget.spent / currentDay;
      const projectedSpend = dailyAverage * daysInMonth;
      
      let status: 'good' | 'warning' | 'danger' = 'good';
      if (percentage > 100) status = 'danger';
      else if (percentage > 80 || projectedSpend > budget.budget * 1.1) status = 'warning';

      return {
        category: budget.category,
        spent: budget.spent,
        budget: budget.budget,
        percentage,
        status,
        daysRemaining,
        projectedSpend,
        recommendedAdjustment: status === 'warning' ? 
          (projectedSpend - budget.budget) : undefined
      };
    });
  }

  /**
   * Identify spending patterns
   */
  async identifySpendingPatterns(financialContext: FinancialContext): Promise<SpendingPattern[]> {
    const patterns: SpendingPattern[] = [];

    // Analyze weekend vs weekday spending
    // This would analyze actual transaction data
    patterns.push({
      pattern: 'Weekend Overspending',
      description: 'Expenses are 40% higher on weekends, primarily in dining and entertainment.',
      impact: 'negative',
      frequency: 8, // 8 weekends per month
      averageAmount: 85.50,
      trend: 'increasing'
    });

    // Analyze subscription patterns
    patterns.push({
      pattern: 'Subscription Creep',
      description: 'Monthly subscriptions have increased by 25% over the last 3 months.',
      impact: 'negative',
      frequency: 1,
      averageAmount: 45.00,
      trend: 'increasing'
    });

    // Analyze bulk purchase patterns
    patterns.push({
      pattern: 'Bulk Purchase Savings',
      description: 'Grocery spending is 15% lower when shopping twice monthly vs weekly.',
      impact: 'positive',
      frequency: 2,
      averageAmount: -35.20,
      trend: 'stable'
    });

    return patterns;
  }

  /**
   * Calculate comprehensive financial metrics
   */
  calculateFinancialMetrics(financialContext: FinancialContext): FinancialMetrics {
    const savingsRate = this.calculateSavingsRate(financialContext);
    const totalExpenses = financialContext.totalExpenses;
    
    // Calculate expense ratios
    const expenseRatio: Record<string, number> = {};
    Object.entries(financialContext.categories).forEach(([category, amount]) => {
      expenseRatio[category] = (amount / totalExpenses) * 100;
    });

    // Calculate financial health score (0-100)
    let healthScore = 50; // Base score
    
    // Savings rate component (0-30 points)
    healthScore += Math.min(savingsRate * 100 * 1.5, 30);
    
    // Expense diversity component (0-20 points)
    const categoryCount = Object.keys(financialContext.categories).length;
    healthScore += Math.min(categoryCount * 2, 20);
    
    // Emergency fund component (0-25 points) - mock calculation
    const estimatedEmergencyFundMonths = 3.2; // Would calculate from actual data
    healthScore += Math.min(estimatedEmergencyFundMonths * 5, 25);

    return {
      savingsRate: savingsRate * 100,
      expenseRatio,
      cashFlowTrend: savingsRate > 0.15 ? 'improving' : savingsRate < 0 ? 'declining' : 'stable',
      financialHealthScore: Math.min(Math.max(healthScore, 0), 100),
      budgetAdherence: 85.4, // Mock - would calculate from budget vs actual
      emergencyFundMonths: estimatedEmergencyFundMonths
    };
  }

  // Helper methods
  private calculateSavingsRate(context: FinancialContext): number {
    return (context.totalIncome - context.totalExpenses) / context.totalIncome;
  }

  private getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  private mapInsightType(aiType: string): DashboardInsight['type'] {
    switch (aiType) {
      case 'positive': return 'success';
      case 'warning': return 'warning';
      case 'opportunity': return 'info';
      default: return 'info';
    }
  }

  private inferCategory(title: string, description: string): DashboardInsight['category'] {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('saving') || text.includes('save')) return 'savings';
    if (text.includes('budget')) return 'budget';
    if (text.includes('goal')) return 'goals';
    if (text.includes('spending') || text.includes('expense')) return 'spending';
    if (text.includes('trend')) return 'trends';
    return 'spending';
  }

  private generateActionFromInsight(insight: any): string {
    if (insight.type === 'opportunity') return 'Explore Opportunity';
    if (insight.type === 'warning') return 'Review & Fix';
    if (insight.type === 'positive') return 'Learn More';
    return 'View Details';
  }

  private generateActionUrl(insight: any): string {
    const category = this.inferCategory(insight.title, insight.description);
    switch (category) {
      case 'savings': return '/analytics/savings';
      case 'budget': return '/budgeting';
      case 'goals': return '/goals';
      case 'spending': return '/transactions';
      default: return '/analytics';
    }
  }

  private getFallbackInsights(financialContext: FinancialContext): DashboardInsight[] {
    return [
      {
        id: 'fallback-1',
        type: 'info',
        category: 'sync',
        title: 'Dashboard Loaded',
        description: 'Your financial dashboard is ready with the latest data.',
        priority: 'low',
        confidence: 1.0,
        generatedAt: new Date()
      }
    ];
  }
}

// Singleton instance
export const dashboardInsightsService = new DashboardInsightsService();