// Advanced Analytics Service with Predictive Capabilities
export interface ForecastData {
  period: string;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

export interface TrendPrediction {
  category: string;
  currentTrend: number;
  predictedChange: number;
  confidence: number;
  seasonality: boolean;
  recommendation: string;
}

export interface AchievabilityScore {
  goalId: string;
  probability: number;
  riskFactors: string[];
  accelerationOptions: string[];
  adjustmentSuggestions: string[];
}

export interface CustomMetric {
  id: string;
  name: string;
  formula: string;
  value: number;
  trend: number;
  benchmark?: number;
}

export interface ReportConfig {
  id: string;
  name: string;
  type: 'cashflow' | 'spending' | 'goals' | 'custom';
  filters: Record<string, any>;
  charts: string[];
  schedule?: 'daily' | 'weekly' | 'monthly';
  recipients?: string[];
}

export interface AnalyticsData {
  timeframe: string;
  metrics: {
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    savingsRate: number;
    expenseGrowth: number;
    incomeGrowth: number;
  };
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    trend: number;
    benchmark: number;
  }>;
  forecasts: {
    cashFlow: ForecastData[];
    expenses: ForecastData[];
    income: ForecastData[];
  };
  anomalies: Array<{
    date: string;
    type: 'spike' | 'dip' | 'pattern_break';
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

export class AdvancedAnalyticsService {
  private static readonly API_BASE = '/api/analytics';

  /**
   * Generate cash flow forecast for specified months
   */
  static async forecastCashFlow(
    userId: string, 
    months: number,
    scenarios?: 'conservative' | 'optimistic' | 'pessimistic'
  ): Promise<ForecastData[]> {
    try {
      const response = await fetch(`${this.API_BASE}/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          months,
          type: 'cashflow',
          scenario: scenarios || 'conservative'
        }),
      });

      if (!response.ok) {
        throw new Error(`Forecast failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.forecast || this.getMockForecast(months);
    } catch (error) {
      console.error('Cash flow forecast failed:', error);
      return this.getMockForecast(months);
    }
  }

  /**
   * Predict spending trends by category
   */
  static async predictSpendingTrends(
    userId: string,
    categories: string[]
  ): Promise<TrendPrediction[]> {
    try {
      const response = await fetch(`${this.API_BASE}/trends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          categories,
          analysisType: 'trend_prediction'
        }),
      });

      if (!response.ok) {
        throw new Error(`Trend prediction failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.trends || this.getMockTrends();
    } catch (error) {
      console.error('Trend prediction failed:', error);
      return this.getMockTrends();
    }
  }

  /**
   * Analyze goal achievability with ML predictions
   */
  static async analyzeGoalAchievability(
    userId: string,
    goalId: string
  ): Promise<AchievabilityScore> {
    try {
      const response = await fetch(`${this.API_BASE}/goals/${goalId}/achievability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Goal analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.analysis || this.getMockAchievability(goalId);
    } catch (error) {
      console.error('Goal achievability analysis failed:', error);
      return this.getMockAchievability(goalId);
    }
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  static async getAdvancedAnalytics(
    userId: string,
    timeframe: string = '12months'
  ): Promise<AnalyticsData> {
    try {
      const response = await fetch(`${this.API_BASE}/advanced/${userId}?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error(`Analytics failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.analytics || this.getMockAnalytics();
    } catch (error) {
      console.error('Advanced analytics failed:', error);
      return this.getMockAnalytics();
    }
  }

  /**
   * Create custom financial metric
   */
  static async createCustomMetric(
    userId: string,
    metric: Omit<CustomMetric, 'id' | 'value' | 'trend'>
  ): Promise<CustomMetric> {
    try {
      const response = await fetch(`${this.API_BASE}/metrics/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...metric
        }),
      });

      if (!response.ok) {
        throw new Error(`Metric creation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Custom metric creation failed:', error);
      throw error;
    }
  }

  /**
   * Generate and schedule custom report
   */
  static async createCustomReport(
    userId: string,
    config: Omit<ReportConfig, 'id'>
  ): Promise<ReportConfig> {
    try {
      const response = await fetch(`${this.API_BASE}/reports/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...config
        }),
      });

      if (!response.ok) {
        throw new Error(`Report creation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Custom report creation failed:', error);
      throw error;
    }
  }

  /**
   * Export analytics data in various formats
   */
  static async exportAnalytics(
    userId: string,
    format: 'pdf' | 'excel' | 'csv',
    config: {
      timeframe: string;
      includeForecasts: boolean;
      includeTrends: boolean;
      customMetrics?: string[];
    }
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.API_BASE}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          format,
          ...config
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Analytics export failed:', error);
      throw error;
    }
  }

  // Mock data methods for development
  private static getMockForecast(months: number): ForecastData[] {
    const forecast: ForecastData[] = [];
    const baseAmount = 2000;
    
    for (let i = 1; i <= months; i++) {
      const seasonalVariation = Math.sin((i - 1) * (2 * Math.PI / 12)) * 200;
      const trendGrowth = i * 50;
      const randomVariation = (Math.random() - 0.5) * 300;
      
      forecast.push({
        period: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
        predicted: Math.round(baseAmount + seasonalVariation + trendGrowth + randomVariation),
        confidence: Math.max(0.6, 0.95 - (i * 0.05)),
        trend: i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'stable',
        factors: ['historical_pattern', 'seasonal_trends', 'income_growth']
      });
    }
    
    return forecast;
  }

  private static getMockTrends(): TrendPrediction[] {
    return [
      {
        category: 'Food & Dining',
        currentTrend: 0.15,
        predictedChange: 0.08,
        confidence: 0.82,
        seasonality: true,
        recommendation: 'Spending likely to increase due to holiday season. Consider setting stricter dining budget.'
      },
      {
        category: 'Transportation',
        currentTrend: -0.12,
        predictedChange: -0.05,
        confidence: 0.76,
        seasonality: false,
        recommendation: 'Positive trend in cost reduction. Continue current transportation optimization strategies.'
      },
      {
        category: 'Shopping',
        currentTrend: 0.23,
        predictedChange: 0.18,
        confidence: 0.71,
        seasonality: true,
        recommendation: 'Shopping expenses trending upward. Review recent purchases and implement cooling-off periods.'
      },
      {
        category: 'Entertainment',
        currentTrend: 0.05,
        predictedChange: 0.12,
        confidence: 0.65,
        seasonality: false,
        recommendation: 'Entertainment spending stable but may increase. Look for free or low-cost alternatives.'
      }
    ];
  }

  private static getMockAchievability(goalId: string): AchievabilityScore {
    return {
      goalId,
      probability: 0.78,
      riskFactors: [
        'Variable income patterns in months 3-6',
        'Seasonal expense increases typically occur in Q4',
        'Current savings rate may not be sustainable long-term'
      ],
      accelerationOptions: [
        'Increase monthly contributions by €150',
        'Redirect entertainment budget surplus to goal',
        'Consider side income opportunities',
        'Optimize subscription spending for additional €45/month'
      ],
      adjustmentSuggestions: [
        'Extend deadline by 2 months for 95% probability',
        'Reduce target by €500 to maintain current timeline',
        'Implement automatic escalation of contributions'
      ]
    };
  }

  private static getMockAnalytics(): AnalyticsData {
    return {
      timeframe: '12months',
      metrics: {
        totalIncome: 101400,
        totalExpenses: 75840,
        netCashFlow: 25560,
        savingsRate: 0.252,
        expenseGrowth: 0.08,
        incomeGrowth: 0.12
      },
      categoryBreakdown: [
        {
          category: 'Food & Dining',
          amount: 17046,
          percentage: 22.5,
          trend: 0.15,
          benchmark: 0.15
        },
        {
          category: 'Transportation',
          amount: 10683,
          percentage: 14.1,
          trend: -0.12,
          benchmark: 0.18
        },
        {
          category: 'Bills & Utilities',
          amount: 15000,
          percentage: 19.8,
          trend: 0.03,
          benchmark: 0.25
        },
        {
          category: 'Shopping',
          amount: 9082,
          percentage: 12.0,
          trend: 0.23,
          benchmark: 0.10
        }
      ],
      forecasts: {
        cashFlow: this.getMockForecast(6),
        expenses: this.getMockForecast(6).map(f => ({ ...f, predicted: f.predicted * 0.75 })),
        income: this.getMockForecast(6).map(f => ({ ...f, predicted: f.predicted * 1.3 }))
      },
      anomalies: [
        {
          date: '2024-01-15',
          type: 'spike',
          severity: 'medium',
          description: 'Unusual shopping expense €450 - 180% above category average'
        },
        {
          date: '2024-01-28',
          type: 'pattern_break',
          severity: 'low',
          description: 'Transportation costs unusually low - possible data missing'
        }
      ]
    };
  }
}