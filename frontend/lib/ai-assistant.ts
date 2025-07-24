// AI Assistant Service for Financial Data Analysis
interface FinancialData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  categories: CategorySpending[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
}

interface CategorySpending {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface Budget {
  category: string;
  amount: number;
  spent: number;
  remaining: number;
}

interface FinancialGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

interface AIResponse {
  message: string;
  suggestions: string[];
  actionItems?: ActionItem[];
  visualData?: any;
}

interface ActionItem {
  title: string;
  description: string;
  actionUrl: string;
  priority: 'high' | 'medium' | 'low';
}

export class AIFinancialAssistant {
  private financialData: FinancialData;

  constructor() {
    // Mock financial data - in production this would come from APIs
    this.financialData = {
      totalBalance: 12456.78,
      monthlyIncome: 4200.00,
      monthlyExpenses: 3245.67,
      categories: [
        {
          category: 'Food & Dining',
          spent: 567.45,
          budget: 800,
          percentage: 70.9,
          trend: 'down'
        },
        {
          category: 'Transportation',
          spent: 378.90,
          budget: 400,
          percentage: 94.7,
          trend: 'up'
        },
        {
          category: 'Bills & Utilities',
          spent: 645.30,
          budget: 600,
          percentage: 107.6,
          trend: 'up'
        },
        {
          category: 'Entertainment',
          spent: 234.67,
          budget: 350,
          percentage: 67.0,
          trend: 'stable'
        }
      ],
      transactions: [
        {
          id: '1',
          description: 'Salary Payment',
          amount: 4200.00,
          category: 'Income',
          date: '2024-01-20',
          type: 'income'
        },
        {
          id: '2',
          description: 'Supermarket Purchase',
          amount: -87.45,
          category: 'Food & Dining',
          date: '2024-01-19',
          type: 'expense'
        }
      ],
      budgets: [
        { category: 'Food & Dining', amount: 800, spent: 567.45, remaining: 232.55 },
        { category: 'Transportation', amount: 400, spent: 378.90, remaining: 21.10 },
        { category: 'Bills & Utilities', amount: 600, spent: 645.30, remaining: -45.30 }
      ],
      goals: [
        {
          id: '1',
          name: 'Emergency Fund',
          target: 10000,
          current: 7500,
          deadline: '2024-12-31'
        },
        {
          id: '2',
          name: 'Vacation Fund',
          target: 3000,
          current: 1200,
          deadline: '2024-06-30'
        }
      ]
    };
  }

  async processQuery(query: string): Promise<AIResponse> {
    const normalizedQuery = query.toLowerCase();
    
    // Analyze query intent
    if (this.isSpendingQuery(normalizedQuery)) {
      return this.generateSpendingAnalysis();
    } else if (this.isBudgetQuery(normalizedQuery)) {
      return this.generateBudgetAdvice();
    } else if (this.isSavingsQuery(normalizedQuery)) {
      return this.generateSavingsAdvice();
    } else if (this.isGoalsQuery(normalizedQuery)) {
      return this.generateGoalsAdvice();
    } else if (this.isTrendQuery(normalizedQuery)) {
      return this.generateTrendAnalysis();
    } else {
      return this.generateGeneralAdvice(query);
    }
  }

  private isSpendingQuery(query: string): boolean {
    const spendingKeywords = ['spend', 'expense', 'cost', 'money', 'transaction', 'purchase', 'breakdown'];
    return spendingKeywords.some(keyword => query.includes(keyword));
  }

  private isBudgetQuery(query: string): boolean {
    const budgetKeywords = ['budget', 'allocation', 'limit', 'plan', 'distribute'];
    return budgetKeywords.some(keyword => query.includes(keyword));
  }

  private isSavingsQuery(query: string): boolean {
    const savingsKeywords = ['save', 'savings', 'money', 'cut', 'reduce', 'optimize'];
    return savingsKeywords.some(keyword => query.includes(keyword)) && 
           (query.includes('save') || query.includes('cut') || query.includes('reduce'));
  }

  private isGoalsQuery(query: string): boolean {
    const goalsKeywords = ['goal', 'target', 'achieve', 'plan', 'future'];
    return goalsKeywords.some(keyword => query.includes(keyword));
  }

  private isTrendQuery(query: string): boolean {
    const trendKeywords = ['trend', 'pattern', 'compare', 'last month', 'increase', 'decrease', 'change'];
    return trendKeywords.some(keyword => query.includes(keyword));
  }

  private generateSpendingAnalysis(): AIResponse {
    const totalSpent = this.financialData.categories.reduce((sum, cat) => sum + cat.spent, 0);
    const topCategory = this.financialData.categories.reduce((max, cat) => 
      cat.spent > max.spent ? cat : max
    );

    const overBudgetCategories = this.financialData.categories.filter(cat => cat.percentage > 100);
    
    const message = `Here's your detailed spending analysis for this month:

**Total Expenses**: €${totalSpent.toLocaleString()}
**Top Spending Category**: ${topCategory.category} (€${topCategory.spent})

**Category Breakdown**:
${this.financialData.categories.map(cat => {
  const status = cat.percentage > 100 ? '🔴' : cat.percentage > 80 ? '🟡' : '🟢';
  return `${status} **${cat.category}**: €${cat.spent} / €${cat.budget} (${cat.percentage.toFixed(1)}%)`;
}).join('\n')}

**Key Insights**:
✅ You're ${((this.financialData.monthlyIncome - totalSpent) / this.financialData.monthlyIncome * 100).toFixed(1)}% under your total income
${overBudgetCategories.length > 0 ? `⚠️ ${overBudgetCategories.length} categories are over budget` : '✅ All categories are within budget'}
📊 Average daily spending: €${(totalSpent / 30).toFixed(2)}`;

    const suggestions = [
      "How can I reduce my biggest expenses?",
      "Show me spending trends vs last month",
      "What's my weekend vs weekday spending?",
      "Help me optimize my budget allocation"
    ];

    const actionItems: ActionItem[] = [];
    
    if (overBudgetCategories.length > 0) {
      actionItems.push({
        title: "Review Over-Budget Categories",
        description: `${overBudgetCategories.length} categories need attention`,
        actionUrl: "/budgeting",
        priority: "high"
      });
    }

    return { message, suggestions, actionItems };
  }

  private generateBudgetAdvice(): AIResponse {
    const savingsRate = ((this.financialData.monthlyIncome - this.financialData.monthlyExpenses) / this.financialData.monthlyIncome * 100);
    
    const message = `Let me help you optimize your budget! Here's my analysis:

**Current Budget Performance**:
• Monthly Income: €${this.financialData.monthlyIncome.toLocaleString()}
• Monthly Expenses: €${this.financialData.monthlyExpenses.toLocaleString()}
• Savings Rate: ${savingsRate.toFixed(1)}% ${savingsRate >= 20 ? '✅ Excellent!' : savingsRate >= 10 ? '🟡 Good, but can improve' : '🔴 Needs attention'}

**Recommended Budget (50/30/20 Rule)**:
• **Needs** (50%): €${(this.financialData.monthlyIncome * 0.5).toFixed(0)} 
  Housing, utilities, groceries, minimum debt payments
• **Wants** (30%): €${(this.financialData.monthlyIncome * 0.3).toFixed(0)}
  Entertainment, dining out, hobbies, non-essential shopping
• **Savings** (20%): €${(this.financialData.monthlyIncome * 0.2).toFixed(0)}
  Emergency fund, investments, retirement, extra debt payments

**Optimization Opportunities**:
${this.financialData.categories.map(cat => {
  if (cat.percentage > 100) {
    return `🔴 **${cat.category}**: Over by €${(cat.spent - cat.budget).toFixed(2)} - Consider reducing by 15%`;
  } else if (cat.percentage > 80) {
    return `🟡 **${cat.category}**: At ${cat.percentage.toFixed(1)}% of budget - Monitor closely`;
  }
  return null;
}).filter(Boolean).join('\n')}

**Next Steps**:
1. Set up automated budget tracking
2. Create spending alerts at 80% of each category
3. Review and adjust monthly based on actual spending`;

    return {
      message,
      suggestions: [
        "Set up automated budget alerts",
        "Help me reduce my biggest expense",
        "Create a savings plan",
        "What's the 50/30/20 rule exactly?"
      ],
      actionItems: [
        {
          title: "Set Up Budget Tracking",
          description: "Automate your budget monitoring",
          actionUrl: "/budgeting",
          priority: "high"
        }
      ]
    };
  }

  private generateSavingsAdvice(): AIResponse {
    const potentialSavings = this.calculatePotentialSavings();
    
    const message = `Great question! Here are personalized savings strategies based on your spending:

**Quick Wins (This Month)**:
💰 **Subscription Audit**: Review all subscriptions (~€45/month potential)
🍕 **Meal Planning**: Cook 3 more meals at home (~€120/month)
☕ **Coffee Budget**: Make coffee at home 3x/week (~€40/month)
🚗 **Transportation**: Combine trips, use public transport (~€60/month)

**Medium-term Opportunities (3-6 months)**:
🏠 **Utility Optimization**: Energy-efficient habits (~€30/month)
📱 **Phone/Internet**: Bundle or switch providers (~€25/month)
🛍️ **Smart Shopping**: Use cashback apps, buy generic (~€50/month)

**Automated Savings Strategies**:
• **Round-up Rule**: Round purchases to nearest €5, save difference
• **1% Rule**: Save 1% of every transaction automatically
• **52-Week Challenge**: Save increasing amounts weekly
• **Pay Yourself First**: Automatic €${Math.round(this.financialData.monthlyIncome * 0.1)} weekly transfer

**Total Potential Monthly Savings: €${potentialSavings}**

Current Savings Rate: ${((this.financialData.monthlyIncome - this.financialData.monthlyExpenses) / this.financialData.monthlyIncome * 100).toFixed(1)}%
Target Savings Rate: 20% (€${(this.financialData.monthlyIncome * 0.2).toFixed(0)}/month)`;

    return {
      message,
      suggestions: [
        "Help me audit my subscriptions",
        "Set up automatic savings transfers",
        "Create a meal planning budget",
        "What's the 52-week savings challenge?"
      ],
      actionItems: [
        {
          title: "Start Subscription Audit",
          description: "Review and cancel unused subscriptions",
          actionUrl: "/transactions?category=subscriptions",
          priority: "high"
        },
        {
          title: "Set Up Automatic Savings",
          description: "Create automated savings transfers",
          actionUrl: "/goals",
          priority: "medium"
        }
      ]
    };
  }

  private generateGoalsAdvice(): AIResponse {
    const currentGoals = this.financialData.goals;
    const totalGoalProgress = currentGoals.reduce((sum, goal) => sum + (goal.current / goal.target * 100), 0) / currentGoals.length;

    const message = `Let's review your financial goals and create a plan to achieve them:

**Current Goals Progress**:
${currentGoals.map(goal => {
  const progress = (goal.current / goal.target * 100);
  const remaining = goal.target - goal.current;
  const monthsLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
  const monthlyRequired = monthsLeft > 0 ? remaining / monthsLeft : 0;
  
  return `📈 **${goal.name}**
   Progress: €${goal.current.toLocaleString()} / €${goal.target.toLocaleString()} (${progress.toFixed(1)}%)
   Remaining: €${remaining.toLocaleString()}
   ${monthsLeft > 0 ? `Monthly needed: €${monthlyRequired.toFixed(0)} for ${monthsLeft} months` : 'Deadline passed - needs review'}`;
}).join('\n\n')}

**Overall Progress**: ${totalGoalProgress.toFixed(1)}%

**Goal Achievement Strategy**:
1. **Prioritize by Urgency**: Emergency fund first, then time-sensitive goals
2. **Automate Contributions**: Set up automatic transfers on payday
3. **Track Weekly**: Review progress every week to stay motivated
4. **Celebrate Milestones**: Reward yourself at 25%, 50%, 75% completion

**Optimization Suggestions**:
• Consider increasing emergency fund to 6 months of expenses (€${(this.financialData.monthlyExpenses * 6).toFixed(0)})
• Break large goals into smaller, achievable milestones
• Use high-yield savings account for goal money`;

    return {
      message,
      suggestions: [
        "Help me prioritize my financial goals",
        "Set up automatic goal contributions",
        "Create a new savings goal",
        "How much should my emergency fund be?"
      ],
      actionItems: [
        {
          title: "Review Goal Deadlines",
          description: "Adjust unrealistic timelines",
          actionUrl: "/goals",
          priority: "medium"
        }
      ]
    };
  }

  private generateTrendAnalysis(): AIResponse {
    // Mock trend data - in production this would come from historical data
    const message = `Here's your spending trend analysis:

**Monthly Comparison**:
📈 **Income**: +5.2% vs last month (€${(this.financialData.monthlyIncome * 0.95).toFixed(0)} → €${this.financialData.monthlyIncome})
📉 **Expenses**: -3.1% vs last month (€${(this.financialData.monthlyExpenses * 1.031).toFixed(0)} → €${this.financialData.monthlyExpenses})

**Category Trends**:
${this.financialData.categories.map(cat => {
  const trendIcon = cat.trend === 'up' ? '📈' : cat.trend === 'down' ? '📉' : '➡️';
  const trendText = cat.trend === 'up' ? 'increasing' : cat.trend === 'down' ? 'decreasing' : 'stable';
  return `${trendIcon} **${cat.category}**: ${trendText} (${cat.percentage.toFixed(1)}% of budget used)`;
}).join('\n')}

**Key Insights**:
✅ Overall financial health improving
⚠️ Transportation costs trending upward - investigate fuel/maintenance increases
💡 Food spending down - good job on meal planning!

**3-Month Outlook**:
Based on current trends, you're on track to:
• Save an additional €${((this.financialData.monthlyIncome - this.financialData.monthlyExpenses) * 0.15).toFixed(0)}/month
• Meet your emergency fund goal 2 months early
• Need to address transportation budget increase`;

    return {
      message,
      suggestions: [
        "Show me yearly spending comparison",
        "What's driving my transportation costs up?",
        "How can I maintain my food spending reduction?",
        "Predict my savings for next quarter"
      ]
    };
  }

  private generateGeneralAdvice(query: string): AIResponse {
    const message = `I understand you're asking about "${query}". As your AI Financial Assistant, I can help you with:

**Financial Analysis**:
📊 Spending breakdowns and category analysis
📈 Income and expense trends over time
💰 Budget optimization recommendations

**Personal Finance Coaching**:
🎯 Creating and tracking financial goals
💡 Personalized money-saving strategies
📋 Budget planning and allocation advice

**Smart Insights**:
🔍 Pattern recognition in your spending
⚠️ Budget alerts and overspending warnings
🚀 Opportunities for financial growth

Based on your current financial snapshot:
• Monthly Income: €${this.financialData.monthlyIncome.toLocaleString()}
• Monthly Expenses: €${this.financialData.monthlyExpenses.toLocaleString()}
• Savings Rate: ${((this.financialData.monthlyIncome - this.financialData.monthlyExpenses) / this.financialData.monthlyIncome * 100).toFixed(1)}%

What specific aspect of your finances would you like to explore?`;

    return {
      message,
      suggestions: [
        "Analyze my spending patterns",
        "Help me create a better budget",
        "Show me ways to save money",
        "Review my financial goals"
      ]
    };
  }

  private calculatePotentialSavings(): number {
    // Simple calculation based on categories over 80% of budget
    let potentialSavings = 0;
    
    this.financialData.categories.forEach(cat => {
      if (cat.percentage > 80) {
        potentialSavings += cat.spent * 0.1; // 10% reduction potential
      }
    });
    
    return Math.round(potentialSavings);
  }

  // Method to update financial data (called when new data is available)
  updateFinancialData(newData: Partial<FinancialData>): void {
    this.financialData = { ...this.financialData, ...newData };
  }
}

// Singleton instance
export const aiAssistant = new AIFinancialAssistant();