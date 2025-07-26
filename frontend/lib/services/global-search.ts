// Global Search Service with Natural Language Processing
interface SearchableItem {
  id: string
  type: 'transaction' | 'budget' | 'goal' | 'category' | 'merchant' | 'contact'
  title: string
  description?: string
  amount?: number
  date?: string
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
}

interface SearchResult {
  item: SearchableItem
  relevanceScore: number
  matchType: 'exact' | 'partial' | 'fuzzy' | 'semantic'
  matchedFields: string[]
  snippet?: string
}

interface SearchFilters {
  types?: string[]
  dateRange?: {
    start: string
    end: string
  }
  amountRange?: {
    min: number
    max: number
  }
  categories?: string[]
  tags?: string[]
}

interface SearchQuery {
  query: string
  filters?: SearchFilters
  limit?: number
  offset?: number
}

interface SearchResponse {
  results: SearchResult[]
  totalCount: number
  suggestions?: string[]
  facets?: {
    types: { [key: string]: number }
    categories: { [key: string]: number }
    dateRanges: { [key: string]: number }
  }
  queryTime: number
}

export class GlobalSearchService {
  private searchIndex: SearchableItem[] = []
  private recentSearches: string[] = []
  private maxRecentSearches = 10

  constructor() {
    this.initializeSearchIndex()
  }

  private initializeSearchIndex(): void {
    // Mock searchable data - in production this would come from various data sources
    this.searchIndex = [
      // Transactions
      {
        id: 'tx-1',
        type: 'transaction',
        title: 'Amazon Purchase',
        description: 'Online purchase - Electronics',
        amount: -89.99,
        date: '2024-11-15',
        category: 'Shopping',
        tags: ['online', 'electronics', 'amazon'],
        metadata: { merchant: 'Amazon', location: 'Online' }
      },
      {
        id: 'tx-2',
        type: 'transaction',
        title: 'Starbucks Coffee',
        description: 'Coffee and pastry',
        amount: -12.50,
        date: '2024-11-14',
        category: 'Food & Dining',
        tags: ['coffee', 'breakfast', 'starbucks'],
        metadata: { merchant: 'Starbucks', location: 'Downtown Location' }
      },
      {
        id: 'tx-3',
        type: 'transaction',
        title: 'Salary Deposit',
        description: 'Monthly salary payment',
        amount: 4200.00,
        date: '2024-11-01',
        category: 'Income',
        tags: ['salary', 'monthly', 'income'],
        metadata: { source: 'Employer', type: 'direct-deposit' }
      },
      {
        id: 'tx-4',
        type: 'transaction',
        title: 'Netflix Subscription',
        description: 'Monthly streaming subscription',
        amount: -15.99,
        date: '2024-11-10',
        category: 'Entertainment',
        tags: ['subscription', 'streaming', 'netflix', 'monthly'],
        metadata: { merchant: 'Netflix', recurring: true }
      },
      {
        id: 'tx-5',
        type: 'transaction',
        title: 'Grocery Shopping',
        description: 'Weekly groceries - Supermarket',
        amount: -127.85,
        date: '2024-11-12',
        category: 'Food & Dining',
        tags: ['groceries', 'weekly', 'supermarket'],
        metadata: { merchant: 'Local Supermarket', essential: true }
      },

      // Budgets
      {
        id: 'budget-1',
        type: 'budget',
        title: 'Monthly Budget November 2024',
        description: 'Complete budget plan for November',
        amount: 4200.00,
        date: '2024-11-01',
        tags: ['monthly', 'budget', 'planning'],
        metadata: { totalAllocated: 4200, categories: 8 }
      },
      {
        id: 'budget-2',
        type: 'budget',
        title: 'Food & Dining Budget',
        description: 'Monthly allocation for food expenses',
        amount: 600.00,
        category: 'Food & Dining',
        tags: ['food', 'dining', 'monthly'],
        metadata: { spent: 547, remaining: 53, percentage: 91 }
      },

      // Goals
      {
        id: 'goal-1',
        type: 'goal',
        title: 'Emergency Fund',
        description: 'Build 6-month emergency fund for financial security',
        amount: 25000.00,
        tags: ['emergency', 'savings', 'security'],
        metadata: { progress: 18750, percentage: 75, deadline: '2025-12-31' }
      },
      {
        id: 'goal-2',
        type: 'goal',
        title: 'Vacation Fund',
        description: 'Save for summer vacation to Europe',
        amount: 5000.00,
        tags: ['vacation', 'travel', 'europe'],
        metadata: { progress: 2000, percentage: 40, deadline: '2025-06-01' }
      },
      {
        id: 'goal-3',
        type: 'goal',
        title: 'House Down Payment',
        description: 'Save for house down payment',
        amount: 50000.00,
        tags: ['house', 'downpayment', 'property'],
        metadata: { progress: 12500, percentage: 25, deadline: '2027-06-30' }
      },

      // Categories
      {
        id: 'cat-1',
        type: 'category',
        title: 'Food & Dining',
        description: 'Restaurant meals, groceries, and food delivery',
        tags: ['food', 'dining', 'groceries', 'restaurants'],
        metadata: { monthlyBudget: 600, monthlySpent: 547, transactionCount: 23 }
      },
      {
        id: 'cat-2',
        type: 'category',
        title: 'Transportation',
        description: 'Gas, public transport, ride-sharing, car maintenance',
        tags: ['transport', 'gas', 'public-transport', 'car'],
        metadata: { monthlyBudget: 400, monthlySpent: 379, transactionCount: 12 }
      },

      // Merchants
      {
        id: 'merchant-1',
        type: 'merchant',
        title: 'Amazon',
        description: 'Online retail purchases',
        tags: ['online', 'retail', 'shopping', 'ecommerce'],
        metadata: { totalSpent: 450.50, transactionCount: 6, category: 'Shopping' }
      },
      {
        id: 'merchant-2',
        type: 'merchant',
        title: 'Starbucks',
        description: 'Coffee shop purchases',
        tags: ['coffee', 'food', 'dining', 'cafe'],
        metadata: { totalSpent: 85.50, transactionCount: 8, category: 'Food & Dining' }
      }
    ]
  }

  async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now()
    
    // Add to recent searches
    if (searchQuery.query.trim()) {
      this.addToRecentSearches(searchQuery.query)
    }

    // Parse natural language query
    const parsedQuery = this.parseNaturalLanguage(searchQuery.query)
    
    // Filter items based on search criteria
    let filteredItems = this.searchIndex

    // Apply type filters
    if (searchQuery.filters?.types?.length) {
      filteredItems = filteredItems.filter(item => 
        searchQuery.filters!.types!.includes(item.type)
      )
    }

    // Apply date range filters
    if (searchQuery.filters?.dateRange) {
      filteredItems = filteredItems.filter(item => {
        if (!item.date) return false
        const itemDate = new Date(item.date)
        const startDate = new Date(searchQuery.filters!.dateRange!.start)
        const endDate = new Date(searchQuery.filters!.dateRange!.end)
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    // Apply amount range filters
    if (searchQuery.filters?.amountRange) {
      filteredItems = filteredItems.filter(item => {
        if (item.amount === undefined) return false
        const amount = Math.abs(item.amount)
        return amount >= searchQuery.filters!.amountRange!.min && 
               amount <= searchQuery.filters!.amountRange!.max
      })
    }

    // Apply category filters
    if (searchQuery.filters?.categories?.length) {
      filteredItems = filteredItems.filter(item => 
        item.category && searchQuery.filters!.categories!.includes(item.category)
      )
    }

    // Perform text search and ranking
    const searchResults = this.performTextSearch(filteredItems, parsedQuery)
    
    // Sort by relevance score
    const sortedResults = searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
    
    // Apply pagination
    const limit = searchQuery.limit || 20
    const offset = searchQuery.offset || 0
    const paginatedResults = sortedResults.slice(offset, offset + limit)

    // Generate suggestions
    const suggestions = this.generateSuggestions(searchQuery.query, searchResults)

    // Generate facets
    const facets = this.generateFacets(searchResults)

    const queryTime = Date.now() - startTime

    return {
      results: paginatedResults,
      totalCount: searchResults.length,
      suggestions,
      facets,
      queryTime
    }
  }

  private parseNaturalLanguage(query: string): {
    keywords: string[]
    filters: SearchFilters
    intent: string
  } {
    const lowerQuery = query.toLowerCase()
    const keywords: string[] = []
    const filters: SearchFilters = {}
    let intent = 'general'

    // Extract keywords (remove common words)
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'show', 'me', 'my', 'all']
    const words = lowerQuery.split(/\s+/).filter(word => 
      word.length > 2 && !stopWords.includes(word)
    )
    keywords.push(...words)

    // Detect time-based queries
    if (lowerQuery.includes('last month') || lowerQuery.includes('previous month')) {
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1, 1)
      const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
      
      filters.dateRange = {
        start: lastMonth.toISOString().split('T')[0],
        end: endOfLastMonth.toISOString().split('T')[0]
      }
      intent = 'historical'
    }

    if (lowerQuery.includes('this month')) {
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const endOfThisMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0)
      
      filters.dateRange = {
        start: thisMonth.toISOString().split('T')[0],
        end: endOfThisMonth.toISOString().split('T')[0]
      }
      intent = 'current'
    }

    if (lowerQuery.includes('this week')) {
      const today = new Date()
      const thisWeek = new Date(today.setDate(today.getDate() - today.getDay()))
      const endOfWeek = new Date(thisWeek)
      endOfWeek.setDate(thisWeek.getDate() + 6)
      
      filters.dateRange = {
        start: thisWeek.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0]
      }
      intent = 'recent'
    }

    // Detect amount-based queries
    const amountMatch = lowerQuery.match(/over (\d+)|above (\d+)|more than (\d+)|greater than (\d+)/i)
    if (amountMatch) {
      const amount = parseInt(amountMatch[1] || amountMatch[2] || amountMatch[3] || amountMatch[4])
      filters.amountRange = { min: amount, max: 999999 }
      intent = 'high-value'
    }

    const underMatch = lowerQuery.match(/under (\d+)|below (\d+)|less than (\d+)/i)
    if (underMatch) {
      const amount = parseInt(underMatch[1] || underMatch[2] || underMatch[3])
      filters.amountRange = { min: 0, max: amount }
      intent = 'low-value'
    }

    // Detect category-specific queries
    const categoryKeywords = {
      'food': ['food', 'dining', 'restaurant', 'grocery', 'coffee', 'lunch', 'dinner'],
      'transport': ['transport', 'gas', 'fuel', 'bus', 'train', 'uber', 'taxi', 'car'],
      'entertainment': ['entertainment', 'movie', 'netflix', 'streaming', 'game', 'music'],
      'shopping': ['shopping', 'amazon', 'store', 'retail', 'clothes', 'electronics'],
      'bills': ['bills', 'utilities', 'electric', 'water', 'internet', 'phone', 'rent']
    }

    for (const [category, categoryWords] of Object.entries(categoryKeywords)) {
      if (categoryWords.some(word => lowerQuery.includes(word))) {
        filters.categories = [category]
        intent = 'category-specific'
        break
      }
    }

    // Detect transaction type queries
    if (lowerQuery.includes('subscription') || lowerQuery.includes('recurring')) {
      filters.tags = ['subscription', 'recurring']
      intent = 'subscription'
    }

    if (lowerQuery.includes('income') || lowerQuery.includes('salary') || lowerQuery.includes('deposit')) {
      filters.types = ['transaction']
      intent = 'income'
    }

    return { keywords, filters, intent }
  }

  private performTextSearch(items: SearchableItem[], parsedQuery: any): SearchResult[] {
    const results: SearchResult[] = []

    for (const item of items) {
      const relevanceScore = this.calculateRelevanceScore(item, parsedQuery)
      
      if (relevanceScore > 0) {
        const matchedFields = this.getMatchedFields(item, parsedQuery.keywords)
        const snippet = this.generateSnippet(item, parsedQuery.keywords)
        
        results.push({
          item,
          relevanceScore,
          matchType: this.getMatchType(item, parsedQuery.keywords),
          matchedFields,
          snippet
        })
      }
    }

    return results
  }

  private calculateRelevanceScore(item: SearchableItem, parsedQuery: any): number {
    let score = 0
    const keywords = parsedQuery.keywords

    if (keywords.length === 0) return 100 // Return all items if no keywords

    // Title matches (highest weight)
    for (const keyword of keywords) {
      if (item.title.toLowerCase().includes(keyword)) {
        score += item.title.toLowerCase() === keyword ? 100 : 50
      }
    }

    // Description matches
    if (item.description) {
      for (const keyword of keywords) {
        if (item.description.toLowerCase().includes(keyword)) {
          score += 30
        }
      }
    }

    // Category matches
    if (item.category) {
      for (const keyword of keywords) {
        if (item.category.toLowerCase().includes(keyword)) {
          score += 40
        }
      }
    }

    // Tag matches
    if (item.tags) {
      for (const keyword of keywords) {
        for (const tag of item.tags) {
          if (tag.toLowerCase().includes(keyword)) {
            score += 20
          }
        }
      }
    }

    // Metadata matches
    if (item.metadata) {
      for (const keyword of keywords) {
        for (const [key, value] of Object.entries(item.metadata)) {
          if (typeof value === 'string' && value.toLowerCase().includes(keyword)) {
            score += 15
          }
        }
      }
    }

    // Boost recent items
    if (item.date) {
      const itemDate = new Date(item.date)
      const now = new Date()
      const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24)
      
      if (daysDiff <= 30) score += 10 // Boost items from last 30 days
      if (daysDiff <= 7) score += 5   // Extra boost for last 7 days
    }

    // Boost high-value transactions
    if (item.amount && Math.abs(item.amount) > 100) {
      score += 5
    }

    return score
  }

  private getMatchedFields(item: SearchableItem, keywords: string[]): string[] {
    const matchedFields: string[] = []

    for (const keyword of keywords) {
      if (item.title.toLowerCase().includes(keyword)) {
        matchedFields.push('title')
      }
      if (item.description?.toLowerCase().includes(keyword)) {
        matchedFields.push('description')
      }
      if (item.category?.toLowerCase().includes(keyword)) {
        matchedFields.push('category')
      }
      if (item.tags?.some(tag => tag.toLowerCase().includes(keyword))) {
        matchedFields.push('tags')
      }
    }

    return [...new Set(matchedFields)] // Remove duplicates
  }

  private getMatchType(item: SearchableItem, keywords: string[]): 'exact' | 'partial' | 'fuzzy' | 'semantic' {
    for (const keyword of keywords) {
      if (item.title.toLowerCase() === keyword) return 'exact'
      if (item.title.toLowerCase().includes(keyword)) return 'partial'
    }
    return 'fuzzy'
  }

  private generateSnippet(item: SearchableItem, keywords: string[]): string {
    let snippet = item.description || item.title
    
    // Highlight keywords in snippet
    for (const keyword of keywords) {
      const regex = new RegExp(`(${keyword})`, 'gi')
      snippet = snippet.replace(regex, '<mark>$1</mark>')
    }
    
    // Truncate if too long
    if (snippet.length > 150) {
      snippet = snippet.substring(0, 147) + '...'
    }
    
    return snippet
  }

  private generateSuggestions(query: string, results: SearchResult[]): string[] {
    const suggestions: string[] = []
    
    // Add popular search terms based on results
    if (results.length > 0) {
      const categories = [...new Set(results.map(r => r.item.category).filter(Boolean))]
      const types = [...new Set(results.map(r => r.item.type))]
      
      categories.slice(0, 3).forEach(category => {
        suggestions.push(`${query} in ${category}`)
      })
      
      if (query.length > 3) {
        suggestions.push(`${query} last month`)
        suggestions.push(`${query} over €100`)
      }
    }
    
    return suggestions.slice(0, 5)
  }

  private generateFacets(results: SearchResult[]): {
    types: { [key: string]: number }
    categories: { [key: string]: number }
    dateRanges: { [key: string]: number }
  } {
    const facets = {
      types: {} as { [key: string]: number },
      categories: {} as { [key: string]: number },
      dateRanges: {} as { [key: string]: number }
    }

    results.forEach(result => {
      // Count types
      facets.types[result.item.type] = (facets.types[result.item.type] || 0) + 1
      
      // Count categories
      if (result.item.category) {
        facets.categories[result.item.category] = (facets.categories[result.item.category] || 0) + 1
      }
      
      // Count date ranges
      if (result.item.date) {
        const date = new Date(result.item.date)
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
        facets.dateRanges[monthYear] = (facets.dateRanges[monthYear] || 0) + 1
      }
    })

    return facets
  }

  private addToRecentSearches(query: string): void {
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(q => q !== query)
    
    // Add to beginning
    this.recentSearches.unshift(query)
    
    // Keep only the most recent searches
    if (this.recentSearches.length > this.maxRecentSearches) {
      this.recentSearches = this.recentSearches.slice(0, this.maxRecentSearches)
    }
  }

  getRecentSearches(): string[] {
    return [...this.recentSearches]
  }

  clearRecentSearches(): void {
    this.recentSearches = []
  }

  // Quick search for autocomplete
  async quickSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
    const searchQuery: SearchQuery = { query, limit }
    const results = await this.search(searchQuery)
    return results.results
  }

  // Search suggestions for autocomplete
  getSearchSuggestions(query: string): string[] {
    const suggestions: string[] = []
    const lowerQuery = query.toLowerCase()

    // Common search patterns
    const patterns = [
      'coffee purchases',
      'restaurant spending',
      'Amazon purchases',
      'subscription payments',
      'transportation costs',
      'grocery expenses',
      'entertainment spending',
      'salary deposits'
    ]

    patterns.forEach(pattern => {
      if (pattern.toLowerCase().includes(lowerQuery) || lowerQuery.includes(pattern.toLowerCase())) {
        suggestions.push(pattern)
      }
    })

    // Add recent searches that match
    this.recentSearches.forEach(recent => {
      if (recent.toLowerCase().includes(lowerQuery)) {
        suggestions.push(recent)
      }
    })

    return [...new Set(suggestions)].slice(0, 8)
  }
}

// Singleton instance
export const globalSearch = new GlobalSearchService()