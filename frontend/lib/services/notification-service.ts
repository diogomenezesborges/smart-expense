// Smart Notification Service with AI-Powered Alerts
interface NotificationRule {
  id: string
  name: string
  type: 'budget' | 'goal' | 'transaction' | 'market' | 'social' | 'predictive'
  condition: string
  threshold?: number
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
  enabled: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  channels: ('push' | 'email' | 'sms' | 'in-app')[]
}

interface SmartNotification {
  id: string
  type: 'alert' | 'info' | 'success' | 'warning' | 'prediction'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  category: 'budget' | 'goal' | 'transaction' | 'market' | 'social' | 'system'
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionable: boolean
  actions?: Array<{
    label: string
    action: string
    variant?: 'default' | 'destructive' | 'outline'
  }>
  metadata?: Record<string, any>
  expiresAt?: Date
  deliveryChannels: string[]
  engagementScore?: number
}

interface NotificationPreferences {
  pushEnabled: boolean
  emailEnabled: boolean
  smsEnabled: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  categorySettings: {
    budget: { enabled: boolean; threshold: number }
    goal: { enabled: boolean; frequency: string }
    transaction: { enabled: boolean; threshold: number }
    market: { enabled: boolean }
    social: { enabled: boolean }
    predictive: { enabled: boolean }
  }
}

interface AnalyticsData {
  spending: { [category: string]: number }
  budgets: { [category: string]: { allocated: number; spent: number } }
  goals: Array<{ id: string; progress: number; target: number; deadline: string }>
  transactions: Array<{ amount: number; category: string; date: string; merchant: string }>
  patterns: {
    spendingVelocity: { [category: string]: number }
    unusualActivity: boolean
    seasonalTrends: { [month: string]: number }
  }
}

export class NotificationService {
  private notifications: SmartNotification[] = []
  private rules: NotificationRule[] = []
  private preferences: NotificationPreferences
  private maxNotifications = 100

  constructor() {
    this.preferences = this.getDefaultPreferences()
    this.initializeDefaultRules()
    this.startNotificationEngine()
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      },
      categorySettings: {
        budget: { enabled: true, threshold: 85 },
        goal: { enabled: true, frequency: 'weekly' },
        transaction: { enabled: true, threshold: 100 },
        market: { enabled: false },
        social: { enabled: true },
        predictive: { enabled: true }
      }
    }
  }

  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'budget-warning',
        name: 'Budget Warning',
        type: 'budget',
        condition: 'spending_percentage > threshold',
        threshold: 85,
        frequency: 'immediate',
        enabled: true,
        priority: 'high',
        channels: ['push', 'in-app']
      },
      {
        id: 'budget-exceeded',
        name: 'Budget Exceeded',
        type: 'budget',
        condition: 'spending_percentage > 100',
        frequency: 'immediate',
        enabled: true,
        priority: 'critical',
        channels: ['push', 'email', 'in-app']
      },
      {
        id: 'goal-milestone',
        name: 'Goal Milestone',
        type: 'goal',
        condition: 'progress_percentage in [25, 50, 75, 100]',
        frequency: 'immediate',
        enabled: true,
        priority: 'medium',
        channels: ['push', 'in-app']
      },
      {
        id: 'unusual-transaction',
        name: 'Unusual Transaction',
        type: 'transaction',
        condition: 'amount > usual_amount * 3',
        frequency: 'immediate',
        enabled: true,
        priority: 'high',
        channels: ['push', 'email', 'in-app']
      },
      {
        id: 'spending-prediction',
        name: 'Spending Prediction',
        type: 'predictive',
        condition: 'predicted_overspend > 50',
        frequency: 'daily',
        enabled: true,
        priority: 'medium',
        channels: ['push', 'in-app']
      },
      {
        id: 'goal-deadline-warning',
        name: 'Goal Deadline Warning',
        type: 'goal',
        condition: 'days_to_deadline <= 30 AND progress_percentage < 80',
        frequency: 'weekly',
        enabled: true,
        priority: 'medium',
        channels: ['push', 'email', 'in-app']
      }
    ]
  }

  private startNotificationEngine(): void {
    // Simulate periodic notification checks
    setInterval(() => {
      this.processNotificationRules()
    }, 60000) // Check every minute
  }

  async processNotificationRules(): Promise<void> {
    const analyticsData = await this.getAnalyticsData()
    
    for (const rule of this.rules) {
      if (!rule.enabled) continue
      
      const shouldTrigger = await this.evaluateRule(rule, analyticsData)
      
      if (shouldTrigger) {
        const notification = await this.createNotificationFromRule(rule, analyticsData)
        if (notification) {
          await this.addNotification(notification)
        }
      }
    }
  }

  private async evaluateRule(rule: NotificationRule, data: AnalyticsData): Promise<boolean> {
    switch (rule.type) {
      case 'budget':
        return this.evaluateBudgetRule(rule, data)
      case 'goal':
        return this.evaluateGoalRule(rule, data)
      case 'transaction':
        return this.evaluateTransactionRule(rule, data)
      case 'predictive':
        return this.evaluatePredictiveRule(rule, data)
      default:
        return false
    }
  }

  private evaluateBudgetRule(rule: NotificationRule, data: AnalyticsData): boolean {
    for (const [category, budget] of Object.entries(data.budgets)) {
      const spentPercentage = (budget.spent / budget.allocated) * 100
      
      if (rule.condition.includes('spending_percentage > threshold')) {
        if (spentPercentage > (rule.threshold || 85)) {
          return true
        }
      }
      
      if (rule.condition.includes('spending_percentage > 100')) {
        if (spentPercentage > 100) {
          return true
        }
      }
    }
    return false
  }

  private evaluateGoalRule(rule: NotificationRule, data: AnalyticsData): boolean {
    for (const goal of data.goals) {
      const progressPercentage = (goal.progress / goal.target) * 100
      
      if (rule.condition.includes('progress_percentage in [25, 50, 75, 100]')) {
        const milestones = [25, 50, 75, 100]
        if (milestones.some(milestone => 
          Math.abs(progressPercentage - milestone) < 1 && 
          !this.hasRecentMilestoneNotification(goal.id, milestone)
        )) {
          return true
        }
      }
      
      if (rule.condition.includes('days_to_deadline')) {
        const daysToDeadline = Math.ceil(
          (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        if (daysToDeadline <= 30 && progressPercentage < 80) {
          return true
        }
      }
    }
    return false
  }

  private evaluateTransactionRule(rule: NotificationRule, data: AnalyticsData): boolean {
    const recentTransactions = data.transactions.filter(tx => {
      const txDate = new Date(tx.date)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return txDate > oneDayAgo
    })

    for (const transaction of recentTransactions) {
      if (rule.condition.includes('amount > usual_amount * 3')) {
        const categoryTransactions = data.transactions.filter(tx => 
          tx.category === transaction.category
        )
        const avgAmount = categoryTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / categoryTransactions.length
        
        if (Math.abs(transaction.amount) > avgAmount * 3) {
          return true
        }
      }
    }
    return false
  }

  private evaluatePredictiveRule(rule: NotificationRule, data: AnalyticsData): boolean {
    // Simple predictive logic based on spending velocity
    for (const [category, velocity] of Object.entries(data.patterns.spendingVelocity)) {
      const budget = data.budgets[category]
      if (budget) {
        const predictedSpend = budget.spent + (velocity * (30 - new Date().getDate()))
        const predictedOverspend = predictedSpend - budget.allocated
        
        if (predictedOverspend > 50) {
          return true
        }
      }
    }
    return false
  }

  private async createNotificationFromRule(rule: NotificationRule, data: AnalyticsData): Promise<SmartNotification | null> {
    const baseNotification = {
      id: `${rule.id}-${Date.now()}`,
      timestamp: new Date(),
      isRead: false,
      actionable: true,
      deliveryChannels: rule.channels,
      priority: rule.priority
    }

    switch (rule.type) {
      case 'budget':
        return this.createBudgetNotification(rule, data, baseNotification)
      case 'goal':
        return this.createGoalNotification(rule, data, baseNotification)
      case 'transaction':
        return this.createTransactionNotification(rule, data, baseNotification)
      case 'predictive':
        return this.createPredictiveNotification(rule, data, baseNotification)
      default:
        return null
    }
  }

  private createBudgetNotification(rule: NotificationRule, data: AnalyticsData, base: any): SmartNotification {
    // Find the category that triggered the rule
    let triggerCategory = ''
    let spentAmount = 0
    let budgetAmount = 0
    let percentage = 0

    for (const [category, budget] of Object.entries(data.budgets)) {
      const spentPercentage = (budget.spent / budget.allocated) * 100
      if (spentPercentage > (rule.threshold || 85)) {
        triggerCategory = category
        spentAmount = budget.spent
        budgetAmount = budget.allocated
        percentage = spentPercentage
        break
      }
    }

    return {
      ...base,
      type: percentage > 100 ? 'alert' : 'warning',
      title: percentage > 100 ? `Budget Exceeded: ${triggerCategory}` : `Budget Alert: ${triggerCategory}`,
      message: `You've spent €${spentAmount} out of your €${budgetAmount} ${triggerCategory.toLowerCase()} budget (${Math.round(percentage)}%). ${percentage > 100 ? 'You are over budget.' : 'Consider slowing down to stay on track.'}`,
      category: 'budget' as const,
      actions: [
        { label: 'View Budget', action: 'view-budget', variant: 'default' as const },
        { label: 'Adjust Budget', action: 'adjust-budget', variant: 'outline' as const }
      ],
      metadata: { category: triggerCategory, percentage, spent: spentAmount, budget: budgetAmount }
    }
  }

  private createGoalNotification(rule: NotificationRule, data: AnalyticsData, base: any): SmartNotification {
    // Find the goal that triggered the notification
    let triggerGoal = data.goals[0] // Default to first goal
    
    for (const goal of data.goals) {
      const progressPercentage = (goal.progress / goal.target) * 100
      const milestones = [25, 50, 75, 100]
      if (milestones.some(milestone => Math.abs(progressPercentage - milestone) < 1)) {
        triggerGoal = goal
        break
      }
    }

    const progressPercentage = Math.round((triggerGoal.progress / triggerGoal.target) * 100)
    const milestone = progressPercentage >= 100 ? 100 : Math.floor(progressPercentage / 25) * 25

    return {
      ...base,
      type: progressPercentage >= 100 ? 'success' : 'info',
      title: progressPercentage >= 100 ? 'Goal Completed!' : 'Goal Milestone Reached!',
      message: progressPercentage >= 100 
        ? `Congratulations! You've completed your goal. You've reached €${triggerGoal.progress} of your €${triggerGoal.target} target!`
        : `Congratulations! You've reached ${milestone}% of your goal. You're €${triggerGoal.progress} closer to your €${triggerGoal.target} target!`,
      category: 'goal' as const,
      actions: [
        { label: 'View Goal', action: 'view-goal', variant: 'default' as const },
        { label: 'Share Achievement', action: 'share', variant: 'outline' as const }
      ],
      metadata: { goalId: triggerGoal.id, progress: triggerGoal.progress, target: triggerGoal.target, percentage: progressPercentage }
    }
  }

  private createTransactionNotification(rule: NotificationRule, data: AnalyticsData, base: any): SmartNotification {
    // Find the unusual transaction
    const recentTransactions = data.transactions.filter(tx => {
      const txDate = new Date(tx.date)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return txDate > oneDayAgo
    })

    const unusualTransaction = recentTransactions[0] // Simplified - get first recent transaction

    return {
      ...base,
      type: 'warning',
      title: 'Unusual Transaction Detected',
      message: `A €${Math.abs(unusualTransaction.amount)} transaction at "${unusualTransaction.merchant}" was detected. If this wasn't you, please review immediately.`,
      category: 'transaction' as const,
      priority: 'critical' as const,
      actions: [
        { label: 'Review Transaction', action: 'review-transaction', variant: 'default' as const },
        { label: 'Report Fraud', action: 'report-fraud', variant: 'destructive' as const }
      ],
      metadata: { 
        amount: unusualTransaction.amount, 
        merchant: unusualTransaction.merchant, 
        category: unusualTransaction.category 
      }
    }
  }

  private createPredictiveNotification(rule: NotificationRule, data: AnalyticsData, base: any): SmartNotification {
    // Find category with predicted overspend
    let triggerCategory = ''
    let predictedOverspend = 0

    for (const [category, velocity] of Object.entries(data.patterns.spendingVelocity)) {
      const budget = data.budgets[category]
      if (budget) {
        const predictedSpend = budget.spent + (velocity * (30 - new Date().getDate()))
        const overspend = predictedSpend - budget.allocated
        
        if (overspend > 50) {
          triggerCategory = category
          predictedOverspend = overspend
          break
        }
      }
    }

    return {
      ...base,
      type: 'prediction',
      title: 'Spending Prediction',
      message: `Based on your current spending pattern, you're likely to exceed your ${triggerCategory.toLowerCase()} budget by €${Math.round(predictedOverspend)} this month.`,
      category: 'budget' as const,
      actions: [
        { label: 'View Details', action: 'view-prediction', variant: 'default' as const },
        { label: 'Adjust Habits', action: 'tips', variant: 'outline' as const }
      ],
      metadata: { category: triggerCategory, predictedOverspend }
    }
  }

  private hasRecentMilestoneNotification(goalId: string, milestone: number): boolean {
    const recentNotifications = this.notifications.filter(n => 
      n.category === 'goal' && 
      n.metadata?.goalId === goalId &&
      Date.now() - n.timestamp.getTime() < 24 * 60 * 60 * 1000 // Within last 24 hours
    )
    
    return recentNotifications.some(n => n.metadata?.percentage >= milestone - 5 && n.metadata?.percentage <= milestone + 5)
  }

  private async getAnalyticsData(): Promise<AnalyticsData> {
    // Mock analytics data - in production this would come from actual analytics service
    return {
      spending: {
        'Food & Dining': 547,
        'Transportation': 379,
        'Entertainment': 235,
        'Bills & Utilities': 645
      },
      budgets: {
        'Food & Dining': { allocated: 600, spent: 547 },
        'Transportation': { allocated: 400, spent: 379 },
        'Entertainment': { allocated: 250, spent: 235 },
        'Bills & Utilities': { allocated: 650, spent: 645 }
      },
      goals: [
        { id: 'emergency-fund', progress: 18750, target: 25000, deadline: '2025-12-31' },
        { id: 'vacation', progress: 2000, target: 5000, deadline: '2025-06-01' }
      ],
      transactions: [
        { amount: -89.99, category: 'Shopping', date: '2024-11-15', merchant: 'Amazon' },
        { amount: -12.50, category: 'Food & Dining', date: '2024-11-14', merchant: 'Starbucks' },
        { amount: 4200.00, category: 'Income', date: '2024-11-01', merchant: 'Employer' }
      ],
      patterns: {
        spendingVelocity: {
          'Food & Dining': 25.5,
          'Transportation': 18.9,
          'Entertainment': 12.8
        },
        unusualActivity: false,
        seasonalTrends: {
          '2024-11': 3245,
          '2024-10': 3156,
          '2024-09': 2987
        }
      }
    }
  }

  async addNotification(notification: SmartNotification): Promise<void> {
    // Check if notification should be sent based on quiet hours
    if (!this.shouldSendNotification(notification)) {
      return
    }

    // Add to notifications list
    this.notifications.unshift(notification)
    
    // Keep only the most recent notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications)
    }

    // Send notification through configured channels
    await this.deliverNotification(notification)
  }

  private shouldSendNotification(notification: SmartNotification): boolean {
    // Check quiet hours
    if (this.preferences.quietHours.enabled) {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      if (currentTime >= this.preferences.quietHours.start || currentTime <= this.preferences.quietHours.end) {
        // Allow critical notifications during quiet hours
        if (notification.priority !== 'critical') {
          return false
        }
      }
    }

    // Check category preferences
    const categorySettings = this.preferences.categorySettings[notification.category]
    if (categorySettings && !categorySettings.enabled) {
      return false
    }

    // Check for duplicate notifications
    const recentSimilar = this.notifications.filter(n => 
      n.category === notification.category &&
      n.type === notification.type &&
      Date.now() - n.timestamp.getTime() < 60 * 60 * 1000 // Within last hour
    )
    
    if (recentSimilar.length > 0) {
      return false
    }

    return true
  }

  private async deliverNotification(notification: SmartNotification): Promise<void> {
    // In a real implementation, this would send notifications through various channels
    console.log('Delivering notification:', notification.title)
    
    // Simulate push notification
    if (notification.deliveryChannels.includes('push') && this.preferences.pushEnabled) {
      // Send push notification
    }
    
    // Simulate email notification
    if (notification.deliveryChannels.includes('email') && this.preferences.emailEnabled) {
      // Send email notification
    }
    
    // Simulate SMS notification
    if (notification.deliveryChannels.includes('sms') && this.preferences.smsEnabled) {
      // Send SMS notification
    }
  }

  // Public methods for managing notifications
  getNotifications(filter?: { category?: string; isRead?: boolean; limit?: number }): SmartNotification[] {
    let filtered = this.notifications

    if (filter?.category) {
      filtered = filtered.filter(n => n.category === filter.category)
    }

    if (filter?.isRead !== undefined) {
      filtered = filtered.filter(n => n.isRead === filter.isRead)
    }

    if (filter?.limit) {
      filtered = filtered.slice(0, filter.limit)
    }

    return filtered
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true)
  }

  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId)
  }

  updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences }
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences }
  }

  // Analytics methods
  getNotificationStats(): {
    total: number
    unread: number
    byCategory: { [key: string]: number }
    byPriority: { [key: string]: number }
  } {
    const stats = {
      total: this.notifications.length,
      unread: this.notifications.filter(n => !n.isRead).length,
      byCategory: {} as { [key: string]: number },
      byPriority: {} as { [key: string]: number }
    }

    this.notifications.forEach(notification => {
      stats.byCategory[notification.category] = (stats.byCategory[notification.category] || 0) + 1
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1
    })

    return stats
  }
}

// Singleton instance
export const notificationService = new NotificationService()