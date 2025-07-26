import { AIService } from '@/lib/services/ai-service'
import { createMockFinancialContext, mockFetch } from '../utils/test-utils'

// Mock fetch globally
global.fetch = jest.fn()

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('processQuery', () => {
    it('should process a simple financial query successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'You spent €2,800 this month. Your biggest expense was food at €980.',
        type: 'text',
        confidence: 0.9
      }
      
      mockFetch(mockResponse)
      
      const context = createMockFinancialContext()
      const result = await AIService.processQuery('How much did I spend?', context)
      
      expect(result.message).toContain('€2,800')
      expect(result.type).toBe('text')
      expect(result.confidence).toBeGreaterThan(0.8)
      expect(fetch).toHaveBeenCalledWith('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('How much did I spend?')
      })
    })

    it('should handle spender-specific queries', async () => {
      const mockResponse = {
        success: true,
        message: 'Joana spent €420 this month (15% of total expenses).',
        type: 'text',
        confidence: 0.95
      }
      
      mockFetch(mockResponse)
      
      const context = createMockFinancialContext()
      const result = await AIService.processQuery('How much did Joana spend?', context)
      
      expect(result.message).toContain('Joana')
      expect(result.message).toContain('€420')
      expect(result.confidence).toBeGreaterThan(0.9)
    })

    it('should handle API errors gracefully', async () => {
      mockFetch({ error: 'AI service unavailable' }, 500)
      
      const context = createMockFinancialContext()
      const result = await AIService.processQuery('Test query', context)
      
      expect(result.message).toContain('trouble processing')
      expect(result.type).toBe('text')
      expect(result.confidence).toBeLessThan(0.7)
    })

    it('should return fallback response for network errors', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')))
      
      const context = createMockFinancialContext()
      const result = await AIService.processQuery('spending budget', context)
      
      expect(result.message).toContain('budgeting')
      expect(result.followUpQuestions).toBeDefined()
      expect(Array.isArray(result.followUpQuestions)).toBe(true)
    })
  })

  describe('getInsights', () => {
    it('should fetch user insights successfully', async () => {
      const mockInsights = [
        {
          id: '1',
          title: 'Dining Out Trend Increasing',
          description: 'Your restaurant spending has increased 23% compared to last month.',
          type: 'warning',
          priority: 'medium',
          actionable: true,
          impact: 'financial',
          confidence: 0.87,
          generatedAt: new Date()
        }
      ]
      
      mockFetch({ insights: mockInsights })
      
      const result = await AIService.getInsights('user-123')
      
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Dining Out Trend Increasing')
      expect(result[0].type).toBe('warning')
      expect(result[0].actionable).toBe(true)
    })

    it('should return mock insights when API fails', async () => {
      mockFetch({ error: 'Service unavailable' }, 500)
      
      const result = await AIService.getInsights('user-123')
      
      expect(result).toHaveLength(3) // Mock insights count
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('title')
      expect(result[0]).toHaveProperty('confidence')
    })
  })

  describe('getRecommendations', () => {
    it('should generate personalized recommendations', async () => {
      const mockRecommendations = [
        {
          id: '1',
          title: 'Optimize Subscription Spending',
          description: 'Cancel or downgrade 3 underutilized subscriptions to save €45/month',
          category: 'spending',
          priority: 'high',
          estimatedImpact: { savings: 540 },
          actionSteps: ['Review all active subscriptions'],
          difficulty: 'easy',
          timeframe: '1 week'
        }
      ]
      
      mockFetch({ recommendations: mockRecommendations })
      
      const context = createMockFinancialContext()
      const result = await AIService.getRecommendations(context)
      
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('spending')
      expect(result[0].estimatedImpact.savings).toBe(540)
      expect(result[0].actionSteps).toContain('Review all active subscriptions')
    })
  })

  describe('analyzeSpendingPatterns', () => {
    it('should analyze spending patterns for given timeframe', async () => {
      const mockAnalysis = {
        patterns: {
          weeklySpending: 287.50,
          peakSpendingDay: 'Friday',
          topCategories: ['Food & Dining', 'Transportation', 'Shopping']
        },
        trends: {
          monthOverMonth: 0.12,
          categoryTrends: {
            'Food & Dining': 0.23,
            'Transportation': -0.08
          }
        }
      }
      
      mockFetch(mockAnalysis)
      
      const result = await AIService.analyzeSpendingPatterns('user-123', '1month')
      
      expect(result.patterns.weeklySpending).toBe(287.50)
      expect(result.patterns.peakSpendingDay).toBe('Friday')
      expect(result.trends.monthOverMonth).toBe(0.12)
    })
  })

  describe('generateHealthReport', () => {
    it('should generate comprehensive financial health report', async () => {
      const mockReport = {
        score: 7.8,
        grade: 'B+',
        summary: 'Good financial health with room for improvement',
        metrics: {
          savingsRate: 0.22,
          debtToIncome: 0.15,
          emergencyFundMonths: 2.3,
          budgetAdherence: 0.78
        }
      }
      
      mockFetch(mockReport)
      
      const result = await AIService.generateHealthReport('user-123')
      
      expect(result.score).toBe(7.8)
      expect(result.grade).toBe('B+')
      expect(result.metrics.savingsRate).toBe(0.22)
      expect(result.metrics.debtToIncome).toBe(0.15)
    })
  })

  describe('fallback responses', () => {
    it('should provide spending-related fallback for spending queries', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')))
      
      const context = createMockFinancialContext()
      const result = await AIService.processQuery('my spending habits', context)
      
      expect(result.message).toContain('spending')
      expect(result.followUpQuestions).toContain('Check my spending')
    })

    it('should provide budget-related fallback for budget queries', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')))
      
      const context = createMockFinancialContext()
      const result = await AIService.processQuery('budget planning', context)
      
      expect(result.message).toContain('budget')
      expect(result.followUpQuestions).toContain('How\'s my budget?')
    })

    it('should provide savings-related fallback for savings queries', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')))
      
      const context = createMockFinancialContext()
      const result = await AIService.processQuery('save money tips', context)
      
      expect(result.message).toContain('savings')
      expect(result.followUpQuestions).toContain('Any savings tips?')
    })
  })
})