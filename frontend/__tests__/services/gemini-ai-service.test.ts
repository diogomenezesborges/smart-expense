import { GeminiAIService } from '@/lib/services/gemini-ai-service'
import { createMockFinancialContext } from '../utils/test-utils'

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn()
    })
  }))
}))

describe('GeminiAIService', () => {
  let geminiService: GeminiAIService
  let mockGenerateContent: jest.Mock

  beforeEach(() => {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    mockGenerateContent = jest.fn()
    
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent
      })
    }))
    
    geminiService = new GeminiAIService({
      apiKey: 'test-api-key',
      model: 'gemini-1.5-flash'
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('processFinancialQuery', () => {
    it('should process simple queries with concise responses', async () => {
      const mockResponse = {
        response: {
          text: () => "You spent €2,800 this month. Your biggest expense was food at €980. Want me to break this down?"
        }
      }
      
      mockGenerateContent.mockResolvedValue(mockResponse)
      
      const context = createMockFinancialContext()
      const result = await geminiService.processFinancialQuery("How's my spending?", context)
      
      expect(result.message).toContain('€2,800')
      expect(result.type).toBe('text')
      expect(result.confidence).toBe(0.9)
      expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining("How's my spending?"))
    })

    it('should provide detailed analysis when explicitly requested', async () => {
      const mockResponse = {
        response: {
          text: () => `KEY FINDINGS:
• Food spending at €980 (35% of expenses) - 23% over 12% benchmark
• Housing costs well controlled at €950 (34%)
• Transportation efficient at €340 (12%)

ACTIONABLE RECOMMENDATIONS:
• Reduce dining out by €180/month through meal planning
• Target food budget of €800/month (realistic 22% reduction)
• Implement weekly grocery budget of €120

TIMELINE: Start meal planning this week, achieve target in 2 months

Would you like specific meal planning strategies or restaurant alternatives?`
        }
      }
      
      mockGenerateContent.mockResolvedValue(mockResponse)
      
      const context = createMockFinancialContext()
      const result = await geminiService.processFinancialQuery("Analyze my food spending in detail", context)
      
      expect(result.message).toContain('KEY FINDINGS')
      expect(result.message).toContain('ACTIONABLE RECOMMENDATIONS')
      expect(result.message).toContain('€980')
      expect(result.message).toContain('35%')
    })

    it('should handle spender-specific queries using origin data', async () => {
      const mockResponse = {
        response: {
          text: () => "Joana spent €420 this month (15% of total expenses). Her main categories were coffee shops and personal items."
        }
      }
      
      mockGenerateContent.mockResolvedValue(mockResponse)
      
      const context = createMockFinancialContext()
      const result = await geminiService.processFinancialQuery("Give spending for Joana in 2024", context)
      
      expect(result.message).toContain('Joana')
      expect(result.message).toContain('€420')
      expect(result.message).toContain('15%')
    })

    it('should list capabilities when asked "what can you do"', async () => {
      const mockResponse = {
        response: {
          text: () => `I'm your AI Financial Analyst with 20+ years of expertise. I can help you with:

🔧 CORE CAPABILITIES:
• Expense ratio analysis and benchmarking against industry standards
• Cash flow optimization and savings rate improvement  
• Risk assessment and consumption pattern analysis
• Budget variance analysis with specific recommendations
• Financial goal tracking and achievement probability

📊 ANALYTICAL EXPERTISE:
• Portuguese financial market knowledge
• European banking regulations compliance
• Hierarchical expense categorization (Major > Category > Subcategory)
• Multi-currency support with proper formatting
• Origin-based spending tracking (Comum/Diogo/Joana)

💬 COMMUNICATION STYLES:
• Simple questions → Brief, actionable answers
• Detailed requests → Comprehensive analysis with benchmarks
• "What can you do?" → This feature overview

What specific financial analysis would you like me to perform?`
        }
      }
      
      mockGenerateContent.mockResolvedValue(mockResponse)
      
      const context = createMockFinancialContext()
      const result = await geminiService.processFinancialQuery("What can you do?", context)
      
      expect(result.message).toContain('CORE CAPABILITIES')
      expect(result.message).toContain('ANALYTICAL EXPERTISE')
      expect(result.message).toContain('expense ratio analysis')
      expect(result.message).toContain('Portuguese financial market')
    })

    it('should handle errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API quota exceeded'))
      
      const context = createMockFinancialContext()
      
      await expect(
        geminiService.processFinancialQuery("Test query", context)
      ).rejects.toThrow('API quota exceeded')
    })

    it('should include Portuguese financial context in prompts', async () => {
      const mockResponse = {
        response: {
          text: () => "Analysis based on Portuguese financial standards completed."
        }
      }
      
      mockGenerateContent.mockResolvedValue(mockResponse)
      
      const context = createMockFinancialContext()
      await geminiService.processFinancialQuery("Test", context)
      
      const callArgs = mockGenerateContent.mock.calls[0][0]
      expect(callArgs).toContain('European markets')
      expect(callArgs).toContain('Portuguese')
      expect(callArgs).toContain('CURRENCY: All amounts in Euros')
      expect(callArgs).toContain('ORIGIN MAPPING: "Comum" = joint expenses')
    })
  })

  describe('generateInsights', () => {
    it('should generate structured financial insights', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify([
            {
              title: "Food Spending Above Benchmark",
              description: "Your €980 food spending (35% of expenses) exceeds the 12% industry benchmark by €646/month.",
              type: "warning",
              priority: "high",
              recommendations: [
                "Implement weekly meal planning to reduce restaurant visits",
                "Set grocery budget limit of €400/month",
                "Use shopping list apps to avoid impulse purchases"
              ]
            },
            {
              title: "Excellent Housing Cost Control", 
              description: "Housing costs at €950 (34%) are well within the 30% benchmark, showing good financial discipline.",
              type: "positive",
              priority: "low",
              recommendations: []
            }
          ])
        }
      }
      
      mockGenerateContent.mockResolvedValue(mockResponse)
      
      const context = createMockFinancialContext()
      const result = await geminiService.generateInsights(context)
      
      expect(result).toHaveLength(2)
      expect(result[0].title).toBe("Food Spending Above Benchmark")
      expect(result[0].type).toBe("warning")
      expect(result[0].priority).toBe("high")
      expect(result[1].type).toBe("positive")
    })

    it('should fallback to text parsing when JSON parsing fails', async () => {
      const mockResponse = {
        response: {
          text: () => `1. High Food Spending
Your restaurant spending has increased significantly this month.

2. Good Savings Rate
You're maintaining a healthy 20% savings rate.

3. Transportation Optimization
Consider carpooling to reduce fuel costs.`
        }
      }
      
      mockGenerateContent.mockResolvedValue(mockResponse)
      
      const context = createMockFinancialContext()
      const result = await geminiService.generateInsights(context)
      
      expect(result).toHaveLength(3)
      expect(result[0].title).toContain('High Food Spending')
      expect(result[1].title).toContain('Good Savings Rate')
      expect(result[2].title).toContain('Transportation Optimization')
    })
  })

  describe('business rules integration', () => {
    it('should apply category benchmarking correctly', async () => {
      const context = createMockFinancialContext()
      
      // Mock response that uses benchmarks
      const mockResponse = {
        response: {
          text: () => "Food spending at 35% is well above the 12% benchmark. Housing at 34% exceeds 30% target slightly."
        }
      }
      
      mockGenerateContent.mockResolvedValue(mockResponse)
      await geminiService.processFinancialQuery("Analyze my categories", context)
      
      const callArgs = mockGenerateContent.mock.calls[0][0]
      expect(callArgs).toContain('Food & Dining > Groceries > Supermarket: €460 (16.4%)')
      expect(callArgs).toContain('Housing > Bills & Utilities > Internet: €450 (16.1%)')
    })

    it('should include spending by origin analysis', async () => {
      const context = createMockFinancialContext()
      
      const mockResponse = {
        response: { text: () => "Origin analysis completed" }
      }
      
      mockGenerateContent.mockResolvedValue(mockResponse)
      await geminiService.processFinancialQuery("Who spends most?", context)
      
      const callArgs = mockGenerateContent.mock.calls[0][0]
      expect(callArgs).toContain('Comum: €1.680 (60.0%) - Joint Expenses')
      expect(callArgs).toContain('Diogo: €700 (25.0%) - Diogo\'s Personal Spending')
      expect(callArgs).toContain('Joana: €420 (15.0%) - Joana\'s Personal Spending')
    })

    it('should include transaction pattern analysis', async () => {
      const context = createMockFinancialContext()
      
      const mockResponse = {
        response: { text: () => "Pattern analysis completed" }
      }
      
      mockGenerateContent.mockResolvedValue(mockResponse)
      await geminiService.processFinancialQuery("Analyze patterns", context)
      
      const callArgs = mockGenerateContent.mock.calls[0][0]
      expect(callArgs).toContain('Total Transactions: 127')
      expect(callArgs).toContain('Average Transaction: €22')
      expect(callArgs).toContain('Supermarket Continente: €120 (weekly)')
    })
  })

  describe('follow-up question extraction', () => {
    it('should extract follow-up questions from AI responses', async () => {
      const mockResponse = {
        response: {
          text: () => `Your spending looks good overall. Would you like me to analyze your transportation costs? Should I help you optimize your food budget? How about setting up automatic savings transfers?`
        }
      }
      
      mockGenerateContent.mockResolvedValue(mockResponse)
      
      const context = createMockFinancialContext()
      const result = await geminiService.processFinancialQuery("Overall analysis", context)
      
      expect(result.followUpQuestions).toContain("Would you like me to analyze your transportation costs?")
      expect(result.followUpQuestions).toContain("Should I help you optimize your food budget?")
      expect(result.followUpQuestions).toContain("How about setting up automatic savings transfers?")
    })

    it('should provide default follow-up questions when none found', async () => {
      const mockResponse = {
        response: {
          text: () => "Simple response without questions."
        }
      }
      
      mockGenerateContent.mockResolvedValue(mockResponse)
      
      const context = createMockFinancialContext()
      const result = await geminiService.processFinancialQuery("Test", context)
      
      expect(result.followUpQuestions).toContain("How can I improve my financial situation?")
      expect(result.followUpQuestions).toContain("What should I focus on next?")
      expect(result.followUpQuestions).toContain("Can you analyze my spending patterns?")
    })
  })
})