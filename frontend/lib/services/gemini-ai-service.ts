// Gemini AI Service for Financial Assistant
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FinancialContext, AIResponse } from './ai-service';

interface GeminiConfig {
  apiKey: string;
  model: string;
}

export class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(config: GeminiConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.model });
  }

  /**
   * Process financial query using Gemini AI with context
   */
  async processFinancialQuery(query: string, context: FinancialContext): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildFinancialExpertPrompt(context);
      const fullPrompt = `${systemPrompt}\n\nUser Query: ${query}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const aiMessage = response.text();

      // Parse response for structured data
      const parsedResponse = this.parseGeminiResponse(aiMessage, query);

      return {
        message: parsedResponse.message,
        type: parsedResponse.type,
        data: parsedResponse.data,
        confidence: 0.9, // Gemini typically has high confidence
        sources: ['AI Analysis based on your financial data'],
        followUpQuestions: parsedResponse.followUpQuestions
      };
    } catch (error) {
      console.error('Gemini AI error:', error);
      throw error;
    }
  }

  /**
   * Generate financial insights using Gemini
   */
  async generateInsights(context: FinancialContext): Promise<any[]> {
    try {
      const prompt = `${this.buildFinancialExpertPrompt(context)}

Please analyze this user's financial data and provide 3-5 specific, actionable insights. For each insight, include:
1. A clear title
2. Detailed analysis
3. Specific recommendations
4. Estimated impact (if applicable)

Format your response as a JSON array with objects containing: title, description, type (positive/warning/opportunity), priority (high/medium/low), recommendations (array of strings).`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const insights = response.text();

      // Try to parse as JSON, fallback to text parsing
      try {
        return JSON.parse(insights);
      } catch {
        return this.parseInsightsFromText(insights);
      }
    } catch (error) {
      console.error('Gemini insights error:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive financial expert system prompt
   */
  private buildFinancialExpertPrompt(context: FinancialContext): string {
    const savingsRate = ((context.totalIncome - context.totalExpenses) / context.totalIncome * 100).toFixed(1);
    
    return `You are a SENIOR FINANCIAL ANALYST and certified personal finance advisor with 20+ years of expertise in European markets and family finance management. You specialize in:

🔧 BUSINESS RULES YOU MUST FOLLOW:
1. CATEGORY HIERARCHY: Always use Major Category > Category > Subcategory structure
2. ORIGIN MAPPING: "Comum" = joint expenses, "Diogo" = personal, "Joana" = personal
3. CURRENCY: All amounts in Euros (€), use comma as decimal separator in displays
4. MISSING DATA: Use Description + Notes to infer categories when blank
5. PATTERN RECOGNITION: Identify recurring transactions and spending patterns
6. TIME CONTEXT: Group by month/spender/category for meaningful insights
7. AVAILABLE DATA: You have access to the current financial data provided below - NEVER claim you don't have data when it's clearly provided in the context
8. USE PROVIDED DATA: Base your responses on the actual data in the context, not hypothetical scenarios

📊 TRANSACTION ANALYSIS FRAMEWORK:

🏦 CORE EXPERTISE:
- Financial statement analysis and cash flow optimization
- Expense ratio analysis and cost structure evaluation
- Behavioral finance and consumption pattern analysis
- Risk assessment and portfolio management
- Tax-efficient financial planning (EU regulations)
- Retirement planning and pension optimization
- Emergency fund strategies and liquidity management

📊 ANALYTICAL FRAMEWORK:
You analyze finances using these key metrics:
- Savings Rate: Target 20%+ (Emergency: <10%, Good: 10-20%, Excellent: >20%)
- Expense Ratios: Housing <30%, Transport <15%, Food <12%, Discretionary <20%
- Debt-to-Income: Excellent <20%, Acceptable 20-40%, Concerning >40%
- Emergency Fund: Target 3-6 months of expenses
- Investment Rate: Target 10-15% of gross income

💰 CURRENT CLIENT PROFILE:
Monthly Income: €${context.totalIncome.toLocaleString('pt-PT')}
Monthly Expenses: €${context.totalExpenses.toLocaleString('pt-PT')}
Net Cash Flow: €${(context.totalIncome - context.totalExpenses).toLocaleString('pt-PT')}
Savings Rate: ${savingsRate}% ${parseFloat(savingsRate) >= 20 ? '✅ EXCELLENT' : parseFloat(savingsRate) >= 10 ? '⚠️ MODERATE' : '🚨 CRITICAL'}

👥 SPENDING BY PERSON (AVAILABLE DATA):
${Object.entries(context.spendingByOrigin || {})
  .map(([person, amount]) => {
    const percentage = (amount/context.totalExpenses*100).toFixed(1);
    const interpretation = person === 'Comum' ? 'Joint Expenses' : `${person}'s Personal Spending`;
    return `- ${person}: €${amount.toLocaleString('pt-PT')} (${percentage}%) - ${interpretation}`;
  })
  .join('\n')}

📈 HIERARCHICAL EXPENSE ANALYSIS:
${context.categories?.hierarchy ? 
  context.categories.hierarchy
    .slice(0, 10) // Top 10 categories
    .map(cat => {
      const benchmark = this.getCategoryBenchmark(cat.category);
      const status = cat.percentage > benchmark ? '🔴 OVER' : cat.percentage > benchmark * 0.8 ? '🟡 HIGH' : '🟢 OK';
      return `- ${cat.majorCategory} > ${cat.category} > ${cat.subCategory}: €${cat.amount.toLocaleString('pt-PT')} (${cat.percentage.toFixed(1)}%) ${status}`;
    })
    .join('\n')
  : 'Category hierarchy data not available'
}

🔄 TRANSACTION PATTERNS:
${context.transactionPatterns ? `
Total Transactions: ${context.transactionPatterns.totalTransactions}
Average Transaction: €${context.transactionPatterns.averageTransactionSize.toLocaleString('pt-PT')}
Recurring Transactions: ${context.transactionPatterns.recurringTransactions.length} identified
Unusual Transactions: ${context.transactionPatterns.unusualTransactions.length} flagged

📋 SAMPLE RECENT TRANSACTIONS:
${context.transactionPatterns.recurringTransactions.slice(0, 3).map(tx => 
  `- ${tx.description}: €${tx.amount} (${tx.frequency}) - ${tx.origin} - ${tx.category}`
).join('\n')}
` : 'Pattern analysis not available'}

🎯 FINANCIAL GOALS STATUS:
${context.goals.length > 0 ? context.goals.map(goal => {
  const progress = (goal.current / goal.target * 100).toFixed(1);
  const deadlineDate = new Date(goal.deadline);
  const timeLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const monthlyRequired = timeLeft > 0 ? ((goal.target - goal.current) / (timeLeft / 30)).toFixed(0) : 0;
  return `- ${goal.name}: €${goal.current.toLocaleString()} / €${goal.target.toLocaleString()} (${progress}% complete)\n  Timeline: ${timeLeft} days | Required: €${monthlyRequired}/month`;
}).join('\n') : '- No active financial goals set (RECOMMENDATION: Establish emergency fund goal)'}

🧠 FINANCIAL TERMINOLOGY YOU MUST USE:
- "Expense Ratio" = Category spending as % of total expenses
- "Savings Rate" = (Income - Expenses) / Income × 100
- "Cash Flow" = Monthly income minus expenses
- "Liquidity" = Available cash and emergency funds
- "Discretionary Spending" = Non-essential purchases
- "Fixed Costs" = Unavoidable recurring expenses
- "Variable Costs" = Controllable recurring expenses
- "Lifestyle Inflation" = Increasing expenses with income
- "Opportunity Cost" = Money lost by not investing savings

📋 ANALYSIS APPROACH:
1. CONSUMPTION PATTERNS: Identify spending trends, seasonal patterns, unusual expenses
2. COST EFFICIENCY: Compare expenses to benchmarks, identify optimization opportunities
3. USAGE OPTIMIZATION: Suggest ways to reduce costs without lifestyle impact
4. CASH FLOW ANALYSIS: Evaluate income stability and expense predictability
5. RISK ASSESSMENT: Identify financial vulnerabilities and mitigation strategies

💬 COMMUNICATION STYLE:
- Be conversational and concise by default
- Match the user's level of detail - if they ask simply, answer simply
- Only provide detailed analysis when explicitly requested ("analyze in detail", "give me a breakdown", "what can you do")
- Use specific numbers only when relevant to the question
- Keep responses friendly and easy to understand
- Offer 1-2 brief follow-up suggestions rather than long lists

🎯 EXAMPLE RESPONSES BY DETAIL LEVEL:
Simple question: "How's my spending?" → "You spent €2,800 this month. Your biggest expense was food at €567. Want me to break this down?"
Spender query: "Give spending for Joana in 2024" → "Joana spent €420 this month (15% of total expenses). Her main categories were coffee shops and personal items."
Detailed request: "Analyze my food spending in detail" → Compare to 10-12% benchmark, identify patterns, suggest meal planning with specific amounts
Capabilities question: "What can you do?" → List all features and analysis types available

IMPORTANT: 
- Always match the user's communication style and level of detail requested
- When asked about specific spenders (Diogo, Joana, Comum), use the spendingByOrigin data provided
- Never claim you don't have access to data when it's clearly provided in the context above

Remember: Always provide QUANTIFIED analysis with specific euro amounts, percentages, and timelines. Be direct but supportive.`;
  }

  /**
   * Get benchmark percentage for expense categories
   */
  private getCategoryBenchmark(category: string): number {
    const benchmarks: Record<string, number> = {
      'Housing': 30,
      'Bills & Utilities': 25,
      'Rent': 30,
      'Mortgage': 30,
      'Transportation': 15,
      'Transport': 15,
      'Car': 15,
      'Food & Dining': 12,
      'Food': 12,
      'Groceries': 10,
      'Dining': 8,
      'Healthcare': 8,
      'Insurance': 8,
      'Shopping': 10,
      'Clothing': 5,
      'Entertainment': 8,
      'Travel': 8,
      'Education': 5,
      'Personal Care': 3,
      'Gifts': 3,
      'Savings': 20,
      'Investment': 15,
      'Emergency Fund': 10,
      'Debt Payment': 10,
      'Other': 5
    };
    
    // Try exact match first
    if (benchmarks[category]) {
      return benchmarks[category];
    }
    
    // Try partial matches
    const categoryLower = category.toLowerCase();
    for (const [key, value] of Object.entries(benchmarks)) {
      if (categoryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryLower)) {
        return value;
      }
    }
    
    // Default benchmark for unknown categories
    return 10;
  }

  /**
   * Parse Gemini response for structured data
   */
  private parseGeminiResponse(response: string, originalQuery: string): any {
    // Default structured response
    let parsedResponse = {
      message: response,
      type: 'text' as const,
      data: null,
      followUpQuestions: this.extractFollowUpQuestions(response)
    };

    // Detect if response contains chart-worthy data
    if (this.containsChartData(response, originalQuery)) {
      parsedResponse.type = 'chart';
      parsedResponse.data = this.extractChartData(response);
    }

    // Detect if response is a recommendation
    if (this.isRecommendation(response)) {
      parsedResponse.type = 'recommendation';
    }

    // Detect if response is an insight
    if (this.isInsight(response)) {
      parsedResponse.type = 'insight';
    }

    return parsedResponse;
  }

  /**
   * Extract follow-up questions from response
   */
  private extractFollowUpQuestions(response: string): string[] {
    // Look for questions in the response
    const questionRegex = /(?:Would you like|Do you want|Should I|Can I help|What about|How about|Consider).{10,100}\?/g;
    const matches = response.match(questionRegex) || [];
    
    // Default follow-up questions if none found
    const defaultQuestions = [
      "How can I improve my financial situation?",
      "What should I focus on next?",
      "Can you analyze my spending patterns?",
      "Help me set realistic financial goals"
    ];

    // Return found questions or defaults, limit to 3
    return matches.length > 0 ? matches.slice(0, 3) : defaultQuestions.slice(0, 3);
  }

  /**
   * Check if response contains chart-worthy data
   */
  private containsChartData(response: string, query: string): boolean {
    const chartKeywords = ['breakdown', 'comparison', 'trend', 'analysis', 'categories', 'distribution'];
    const queryLower = query.toLowerCase();
    const responseLower = response.toLowerCase();
    
    return chartKeywords.some(keyword => 
      queryLower.includes(keyword) || responseLower.includes(keyword)
    ) && (responseLower.includes('€') || responseLower.includes('percent'));
  }

  /**
   * Extract chart data from response
   */
  private extractChartData(response: string): any {
    // Try to extract percentage and euro amounts for chart data
    const percentRegex = /(\w+[^:]*?):\s*€?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:€)?\s*\((\d+(?:\.\d+)?)%\)/g;
    const matches = [];
    let match;

    while ((match = percentRegex.exec(response)) !== null) {
      matches.push({
        name: match[1].trim(),
        amount: parseFloat(match[2].replace(/,/g, '')),
        percentage: parseFloat(match[3])
      });
    }

    return matches.length > 0 ? { chartData: matches } : null;
  }

  /**
   * Check if response is a recommendation
   */
  private isRecommendation(response: string): boolean {
    const recommendationKeywords = ['recommend', 'suggest', 'should', 'consider', 'try', 'advice'];
    const responseLower = response.toLowerCase();
    return recommendationKeywords.some(keyword => responseLower.includes(keyword));
  }

  /**
   * Check if response is an insight
   */
  private isInsight(response: string): boolean {
    const insightKeywords = ['notice', 'observe', 'analysis shows', 'data indicates', 'pattern', 'trend'];
    const responseLower = response.toLowerCase();
    return insightKeywords.some(keyword => responseLower.includes(keyword));
  }

  /**
   * Parse insights from text when JSON parsing fails
   */
  private parseInsightsFromText(text: string): any[] {
    const insights = [];
    const sections = text.split(/\d+\.\s+/).filter(section => section.trim().length > 0);

    sections.forEach((section, index) => {
      const lines = section.split('\n').filter(line => line.trim().length > 0);
      if (lines.length > 0) {
        const title = lines[0].replace(/[*#]+/g, '').trim();
        const description = lines.slice(1).join(' ').trim();

        insights.push({
          id: `insight-${index + 1}`,
          title,
          description,
          type: this.determineInsightType(description),
          priority: this.determineInsightPriority(description),
          actionable: description.toLowerCase().includes('should') || description.toLowerCase().includes('consider'),
          confidence: 0.85,
          generatedAt: new Date()
        });
      }
    });

    return insights.slice(0, 5); // Limit to 5 insights
  }

  /**
   * Determine insight type based on content
   */
  private determineInsightType(text: string): 'positive' | 'warning' | 'neutral' | 'opportunity' {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('good') || textLower.includes('excellent') || textLower.includes('great')) {
      return 'positive';
    } else if (textLower.includes('high') || textLower.includes('too much') || textLower.includes('warning')) {
      return 'warning';
    } else if (textLower.includes('could') || textLower.includes('opportunity') || textLower.includes('consider')) {
      return 'opportunity';
    }
    
    return 'neutral';
  }

  /**
   * Determine insight priority based on content
   */
  private determineInsightPriority(text: string): 'high' | 'medium' | 'low' {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('urgent') || textLower.includes('immediately') || textLower.includes('critical')) {
      return 'high';
    } else if (textLower.includes('soon') || textLower.includes('important') || textLower.includes('should')) {
      return 'medium';
    }
    
    return 'low';
  }
}

// Example usage and query templates for better AI responses
export const FINANCIAL_QUERY_EXAMPLES = {
  spending: [
    "How much did I spend on dining out this month?",
    "What's my biggest expense category?",
    "Am I spending too much on shopping?",
    "Show me my spending trends"
  ],
  savings: [
    "How much am I saving each month?",
    "What's my savings rate?",
    "How can I save more money?",
    "Am I saving enough for my age?"
  ],
  budgeting: [
    "How is my budget performance?",
    "Should I adjust my budget categories?",
    "What's the 50/30/20 rule for my income?",
    "Help me create a realistic budget"
  ],
  goals: [
    "How am I progressing toward my goals?",
    "When will I reach my savings goal?",
    "Should I adjust my financial goals?",
    "Help me prioritize my financial goals"
  ],
  investments: [
    "Should I start investing?",
    "How much should I invest monthly?",
    "What investment strategy fits my situation?",
    "Explain index funds vs individual stocks"
  ],
  debt: [
    "How should I prioritize debt payments?",
    "Should I pay off debt or save first?",
    "What's the best debt payoff strategy?",
    "How long will it take to pay off my debt?"
  ]
};