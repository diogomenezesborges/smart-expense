"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Bell, 
  Search, 
  Filter, 
  Settings, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Smartphone, 
  Mail, 
  MessageSquare,
  Clock,
  X,
  Volume2,
  VolumeX
} from 'lucide-react'

interface Notification {
  id: string
  type: 'alert' | 'info' | 'success' | 'warning' | 'prediction'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  category: 'budget' | 'goal' | 'transaction' | 'market' | 'social' | 'system'
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionable: boolean
  actions?: Array<{
    label: string
    action: string
    variant?: 'default' | 'destructive' | 'outline'
  }>
}

interface NotificationSettings {
  pushEnabled: boolean
  emailEnabled: boolean
  smsEnabled: boolean
  budgetAlerts: boolean
  goalReminders: boolean
  transactionAlerts: boolean
  marketUpdates: boolean
  socialNotifications: boolean
  predictiveAlerts: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('notifications')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    budgetAlerts: true,
    goalReminders: true,
    transactionAlerts: true,
    marketUpdates: false,
    socialNotifications: true,
    predictiveAlerts: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    }
  })

  // Mock notifications data
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'alert',
      title: 'Budget Alert: Dining Category',
      message: 'You&apos;ve spent €547 out of your €600 dining budget (91%). Consider slowing down to stay on track.',
      timestamp: '2 minutes ago',
      isRead: false,
      category: 'budget',
      priority: 'high',
      actionable: true,
      actions: [
        { label: 'View Budget', action: 'view-budget', variant: 'default' },
        { label: 'Adjust Budget', action: 'adjust-budget', variant: 'outline' }
      ]
    },
    {
      id: '2',
      type: 'prediction',
      title: 'Spending Prediction',
      message: 'Based on your current spending pattern, you&apos;re likely to exceed your transportation budget by €80 this month.',
      timestamp: '1 hour ago',
      isRead: false,
      category: 'budget',
      priority: 'medium',
      actionable: true,
      actions: [
        { label: 'View Details', action: 'view-prediction', variant: 'default' },
        { label: 'Adjust Habits', action: 'tips', variant: 'outline' }
      ]
    },
    {
      id: '3',
      type: 'success',
      title: 'Goal Milestone Reached!',
      message: 'Congratulations! You&apos;ve reached 75% of your Emergency Fund goal. You&apos;re €6,250 closer to financial security!',
      timestamp: '3 hours ago',
      isRead: false,
      category: 'goal',
      priority: 'medium',
      actionable: true,
      actions: [
        { label: 'View Goal', action: 'view-goal', variant: 'default' },
        { label: 'Share Achievement', action: 'share', variant: 'outline' }
      ]
    },
    {
      id: '4',
      type: 'info',
      title: 'Market Update',
      message: 'Interest rates decreased by 0.25%. This might be a good time to refinance your mortgage or consider investment opportunities.',
      timestamp: '5 hours ago',
      isRead: true,
      category: 'market',
      priority: 'low',
      actionable: true,
      actions: [
        { label: 'Learn More', action: 'market-details', variant: 'outline' }
      ]
    },
    {
      id: '5',
      type: 'warning',
      title: 'Unusual Transaction Detected',
      message: 'A €350 transaction at &quot;Tech Store XYZ&quot; was detected. If this wasn&apos;t you, please review immediately.',
      timestamp: '1 day ago',
      isRead: true,
      category: 'transaction',
      priority: 'critical',
      actionable: true,
      actions: [
        { label: 'Review Transaction', action: 'review-transaction', variant: 'default' },
        { label: 'Report Fraud', action: 'report-fraud', variant: 'destructive' }
      ]
    },
    {
      id: '6',
      type: 'info',
      title: 'Community Achievement',
      message: 'Sarah M. from your study group just reached her savings goal! Send congratulations and get inspired.',
      timestamp: '2 days ago',
      isRead: true,
      category: 'social',
      priority: 'low',
      actionable: true,
      actions: [
        { label: 'View Post', action: 'view-community', variant: 'outline' }
      ]
    }
  ]

  const getNotificationIcon = (type: string, category: string) => {
    if (type === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />
    if (type === 'warning' || type === 'alert') return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    if (type === 'prediction') return <TrendingUp className="h-5 w-5 text-blue-500" />
    
    switch (category) {
      case 'budget': return <DollarSign className="h-5 w-5 text-blue-500" />
      case 'goal': return <Target className="h-5 w-5 text-green-500" />
      case 'transaction': return <CreditCard className="h-5 w-5 text-purple-500" />
      case 'market': return <TrendingUp className="h-5 w-5 text-indigo-500" />
      case 'social': return <MessageSquare className="h-5 w-5 text-pink-500" />
      default: return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.isRead) ||
                         (filter === 'actionable' && notification.actionable) ||
                         notification.category === filter
    return matchesSearch && matchesFilter
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications & Search</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Stay updated with smart alerts and powerful search
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} unread</Badge>
              )}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="search">Global Search</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              {/* Search and Filter */}
              <Card className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                  >
                    <option value="all">All Notifications</option>
                    <option value="unread">Unread</option>
                    <option value="actionable">Actionable</option>
                    <option value="budget">Budget</option>
                    <option value="goal">Goals</option>
                    <option value="transaction">Transactions</option>
                    <option value="market">Market</option>
                    <option value="social">Social</option>
                  </select>
                </div>
              </Card>

              {/* Notifications List */}
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card key={notification.id} className={`p-4 ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {notification.title}
                            </h3>
                            <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{notification.timestamp}</span>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {notification.message}
                        </p>
                        
                        {notification.actions && (
                          <div className="flex items-center space-x-2">
                            {notification.actions.map((action, index) => (
                              <Button 
                                key={index}
                                variant={action.variant || 'default'}
                                size="sm"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredNotifications.length === 0 && (
                <Card className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Notifications Found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery || filter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'You\'re all caught up! Check back later for updates.'
                    }
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Global Search Tab */}
          <TabsContent value="search">
            <div className="space-y-6">
              {/* Search Interface */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search across all your financial data... (e.g., 'coffee purchases last month')"
                      className="pl-12 text-lg h-12"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">Transactions</Badge>
                    <Badge variant="outline">Budgets</Badge>
                    <Badge variant="outline">Goals</Badge>
                    <Badge variant="outline">Contacts</Badge>
                    <Badge variant="outline">Categories</Badge>
                  </div>
                </div>
              </Card>

              {/* Search Suggestions */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Try These Searches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Natural Language</h4>
                    <div className="space-y-1">
                      <button className="block text-sm text-blue-600 hover:text-blue-800">
                        "Show me all restaurant spending last month"
                      </button>
                      <button className="block text-sm text-blue-600 hover:text-blue-800">
                        "Transactions over €100 this week"
                      </button>
                      <button className="block text-sm text-blue-600 hover:text-blue-800">
                        "My subscription payments"
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Advanced Filters</h4>
                    <div className="space-y-1">
                      <button className="block text-sm text-blue-600 hover:text-blue-800">
                        "Budget variance analysis"
                      </button>
                      <button className="block text-sm text-blue-600 hover:text-blue-800">
                        "Goal progress this quarter"
                      </button>
                      <button className="block text-sm text-blue-600 hover:text-blue-800">
                        "Unusual spending patterns"
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recent Searches */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Searches</h3>
                <div className="space-y-2">
                  {[
                    'Amazon purchases November 2024',
                    'Transportation budget variance',
                    'Emergency fund progress',
                    'Coffee shop transactions'
                  ].map((search) => (
                    <div key={search} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{search}</span>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <button className="text-xs text-blue-600 hover:text-blue-800">Search again</button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Notification Channels */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Notification Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="font-medium">Push Notifications</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications on your device</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.pushEnabled}
                      onCheckedChange={(checked) => setSettings({...settings, pushEnabled: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="font-medium">Email Notifications</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.emailEnabled}
                      onCheckedChange={(checked) => setSettings({...settings, emailEnabled: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="font-medium">SMS Notifications</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive critical alerts via SMS</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.smsEnabled}
                      onCheckedChange={(checked) => setSettings({...settings, smsEnabled: checked})}
                    />
                  </div>
                </div>
              </Card>

              {/* Notification Types */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Notification Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Budget Alerts</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Overspending and budget limit notifications</p>
                    </div>
                    <Switch 
                      checked={settings.budgetAlerts}
                      onCheckedChange={(checked) => setSettings({...settings, budgetAlerts: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Goal Reminders</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Progress updates and milestone celebrations</p>
                    </div>
                    <Switch 
                      checked={settings.goalReminders}
                      onCheckedChange={(checked) => setSettings({...settings, goalReminders: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Transaction Alerts</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Unusual or large transaction notifications</p>
                    </div>
                    <Switch 
                      checked={settings.transactionAlerts}
                      onCheckedChange={(checked) => setSettings({...settings, transactionAlerts: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Market Updates</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Economic news and market changes</p>
                    </div>
                    <Switch 
                      checked={settings.marketUpdates}
                      onCheckedChange={(checked) => setSettings({...settings, marketUpdates: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Social Notifications</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Community interactions and updates</p>
                    </div>
                    <Switch 
                      checked={settings.socialNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, socialNotifications: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Predictive Alerts</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered spending predictions and recommendations</p>
                    </div>
                    <Switch 
                      checked={settings.predictiveAlerts}
                      onCheckedChange={(checked) => setSettings({...settings, predictiveAlerts: checked})}
                    />
                  </div>
                </div>
              </Card>

              {/* Quiet Hours */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quiet Hours</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {settings.quietHours.enabled ? (
                        <VolumeX className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Volume2 className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <span className="font-medium">Enable Quiet Hours</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pause non-critical notifications during specified hours</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.quietHours.enabled}
                      onCheckedChange={(checked) => setSettings({
                        ...settings, 
                        quietHours: {...settings.quietHours, enabled: checked}
                      })}
                    />
                  </div>
                  
                  {settings.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4 ml-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Time
                        </label>
                        <Input 
                          type="time" 
                          value={settings.quietHours.start}
                          onChange={(e) => setSettings({
                            ...settings,
                            quietHours: {...settings.quietHours, start: e.target.value}
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Time
                        </label>
                        <Input 
                          type="time" 
                          value={settings.quietHours.end}
                          onChange={(e) => setSettings({
                            ...settings,
                            quietHours: {...settings.quietHours, end: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}