// AI Service for Financial Assistant
export interface FinancialContext {
  userId: string;
  totalIncome: number;
  totalExpenses: number;
  
  // Enhanced category breakdown with hierarchy
  categories: {
    byMajorCategory: Record<string, number>;
    byCategory: Record<string, number>;
    bySubCategory: Record<string, number>;
    hierarchy: Array<{
      majorCategory: string;
      category: string;
      subCategory: string;
      amount: number;
      percentage: number;
    }>;
  };
  
  // Spending by person/origin
  spendingByOrigin: {
    'Comum': number;
    'Diogo': number;
    'Joana': number;
  };
  
  // Transaction patterns and insights
  transactionPatterns: {
    totalTransactions: number;
    averageTransactionSize: number;
    recurringTransactions: Array<{
      description: string;
      amount: number;
      frequency: 'monthly' | 'weekly' | 'quarterly';
      category: string;
      origin: string;
    }>;
    unusualTransactions: Array<{
      id: string;
      description: string;
      amount: number;
      date: string;
      reason: 'high_amount' | 'unusual_category' | 'new_merchant';
    }>;
  };
  
  // Financial goals and targets
  goals: Array<{
    id: string;
    name: string;
    target: number;
    current: number;
    deadline: Date;
    category?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  
  // Budget vs actual comparison
  budgetComparison?: {
    planned: Record<string, number>;
    actual: Record<string, number>;
    variance: Record<string, number>;
  };
  
  timeframe: '1month' | '3months' | '6months' | '1year';
  currency: 'EUR';
  analysisDate: string;
}

export interface AIResponse {
  message: string;
  type: 'text' | 'chart' | 'recommendation' | 'insight';
  data?: any;
  confidence: number;
  sources?: string[];
  followUpQuestions?: string[];
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'neutral' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations?: string[];
  impact: 'financial' | 'behavioral' | 'goal-related';
  confidence: number;
  generatedAt: Date;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'spending' | 'saving' | 'investing' | 'budgeting' | 'goal-setting';
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: {
    savings?: number;
    timeToGoal?: number;
    riskReduction?: number;
  };
  actionSteps: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
}

export class AIService {
  private static readonly API_BASE = '/api/ai';

  /**
   * Process natural language query and return AI response
   */
  static async processQuery(
    query: string, 
    context: FinancialContext
  ): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          context,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data);
    } catch (error) {
      console.error('AI query processing failed:', error);
      return this.getFallbackResponse(query);
    }
  }

  /**
   * Get AI-generated financial insights for user
   */
  static async getInsights(userId: string): Promise<Insight[]> {
    try {
      const response = await fetch(`${this.API_BASE}/insights/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.statusText}`);
      }

      const data = await response.json();
      return data.insights || [];
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      return this.getMockInsights();
    }
  }

  /**
   * Generate personalized recommendations
   */
  static async getRecommendations(context: FinancialContext): Promise<Recommendation[]> {
    try {
      const response = await fetch(`${this.API_BASE}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        throw new Error(`Failed to get recommendations: ${response.statusText}`);
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
      return this.getMockRecommendations();
    }
  }

  /**
   * Analyze spending patterns and generate insights
   */
  static async analyzeSpendingPatterns(
    userId: string, 
    timeframe: string
  ): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          timeframe,
          analysisType: 'spending_patterns'
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Spending pattern analysis failed:', error);
      return this.getMockAnalysis();
    }
  }

  /**
   * Generate weekly financial health report
   */
  static async generateHealthReport(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE}/health-report/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Health report generation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health report generation failed:', error);
      return this.getMockHealthReport();
    }
  }

  // Private helper methods
  private static parseAIResponse(data: any): AIResponse {
    return {
      message: data.message || 'I apologize, but I encountered an issue processing your request.',
      type: data.type || 'text',
      data: data.data,
      confidence: data.confidence || 0.7,
      sources: data.sources || [],
      followUpQuestions: data.followUpQuestions || []
    };
  }

  private static getFallbackResponse(query: string): AIResponse {
    const fallbackResponses = {
      spending: "Sure! Let me look at your spending. What specific area would you like me to focus on?",
      budget: "I can help with your budget. Are you looking to create one or check how you're doing?",
      saving: "Great question about savings! Are you looking to save more or check your current progress?",
      goal: "I'd be happy to help with your financial goals. What goal are you working on?"
    };

    const queryLower = query.toLowerCase();
    const responseKey = Object.keys(fallbackResponses).find(key => 
      queryLower.includes(key)
    ) as keyof typeof fallbackResponses;

    return {
      message: responseKey ? fallbackResponses[responseKey] : "I'm here to help with your finances. What would you like to know?",
      type: 'text',
      confidence: 0.6,
      followUpQuestions: [
        "Check my spending",
        "How's my budget?",
        "Any savings tips?"
      ]
    };
  }

  private static getMockInsights(): Insight[] {
    return [
      {
        id: '1',
        title: 'Dining Out Trend Increasing',
        description: 'Your restaurant spending has increased 23% compared to last month. This represents €156 above your usual pattern.',
        type: 'warning',
        priority: 'medium',
        actionable: true,
        recommendations: [
          'Set a weekly dining out budget of €75',
          'Try meal planning to reduce impulse restaurant visits',
          'Look for lunch specials instead of dinner dining'
        ],
        impact: 'financial',
        confidence: 0.87,
        generatedAt: new Date()
      },
      {
        id: '2',
        title: 'Emergency Fund Goal on Track',
        description: 'Great progress! You\'re 78% towards your €5,000 emergency fund goal and ahead of schedule.',
        type: 'positive',
        priority: 'low',
        actionable: false,
        impact: 'goal-related',
        confidence: 0.95,
        generatedAt: new Date()
      },
      {
        id: '3',
        title: 'Investment Opportunity',
        description: 'Your consistent savings rate suggests you could increase investment contributions by €200/month.',
        type: 'opportunity',
        priority: 'high',
        actionable: true,
        recommendations: [
          'Consider increasing your index fund contributions',
          'Explore tax-advantaged retirement accounts',
          'Diversify with international market exposure'
        ],
        impact: 'financial',
        confidence: 0.82,
        generatedAt: new Date()
      }
    ];
  }

  private static getMockRecommendations(): Recommendation[] {
    return [
      {
        id: '1',
        title: 'Optimize Subscription Spending',
        description: 'Cancel or downgrade 3 underutilized subscriptions to save €45/month',
        category: 'spending',
        priority: 'high',
        estimatedImpact: {
          savings: 540 // yearly
        },
        actionSteps: [
          'Review all active subscriptions',
          'Cancel Netflix premium (keep basic)',
          'Pause gym membership during winter',
          'Switch to annual billing for remaining services'
        ],
        difficulty: 'easy',
        timeframe: '1 week'
      },
      {
        id: '2',
        title: 'Accelerate Emergency Fund',
        description: 'Increase emergency fund contributions to reach your goal 2 months earlier',
        category: 'saving',
        priority: 'medium',
        estimatedImpact: {
          timeToGoal: -60 // days saved
        },
        actionSteps: [
          'Set up automatic transfer of €150/month',
          'Use high-yield savings account',
          'Direct tax refunds to emergency fund'
        ],
        difficulty: 'medium',
        timeframe: '2 weeks'
      }
    ];
  }

  private static getMockAnalysis(): any {
    return {
      patterns: {
        weeklySpending: 287.50,
        peakSpendingDay: 'Friday',
        topCategories: ['Food & Dining', 'Transportation', 'Shopping'],
        anomalies: [
          {
            date: '2024-01-15',
            amount: 450,
            category: 'Shopping',
            description: 'Unusual large purchase detected'
          }
        ]
      },
      trends: {
        monthOverMonth: 0.12,
        categoryTrends: {
          'Food & Dining': 0.23,
          'Transportation': -0.08,
          'Shopping': 0.45
        }
      }
    };
  }

  private static getMockHealthReport(): any {
    return {
      score: 7.8,
      grade: 'B+',
      summary: 'Good financial health with room for improvement in spending control',
      metrics: {
        savingsRate: 0.22,
        debtToIncome: 0.15,
        emergencyFundMonths: 2.3,
        budgetAdherence: 0.78
      },
      recommendations: [
        'Focus on reducing dining out expenses',
        'Continue building emergency fund',
        'Consider increasing retirement contributions'
      ]
    };
  }
}