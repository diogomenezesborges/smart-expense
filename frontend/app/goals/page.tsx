"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Target, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Trophy, 
  Zap, 
  DollarSign, 
  PiggyBank, 
  Home, 
  GraduationCap,
  CreditCard,
  Star,
  Users,
  Settings,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react'

interface FinancialGoal {
  id: string
  name: string
  type: 'savings' | 'debt-payoff' | 'investment' | 'expense-reduction' | 'income'
  targetAmount: number
  currentAmount: number
  deadline: string
  priority: 'high' | 'medium' | 'low'
  status: 'on-track' | 'behind' | 'ahead' | 'completed' | 'at-risk'
  monthlyContribution: number
  description: string
  milestones: Array<{
    percentage: number
    amount: number
    reached: boolean
    date?: string
  }>
  tags: string[]
  createdDate: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  type: 'milestone' | 'streak' | 'challenge' | 'special'
  earnedDate?: string
  progress?: number
  target?: number
}

interface UserStats {
  totalGoals: number
  completedGoals: number
  totalSaved: number
  currentStreak: number
  level: number
  points: number
  nextLevelPoints: number
}

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    totalGoals: 0,
    completedGoals: 0,
    totalSaved: 0,
    currentStreak: 0,
    level: 0,
    points: 0,
    nextLevelPoints: 0
  })

  // Mock data initialization
  useEffect(() => {
    const loadGoals = () => {
      const mockGoals: FinancialGoal[] = [
        {
          id: '1',
          name: 'Emergency Fund',
          type: 'savings',
          targetAmount: 25000,
          currentAmount: 18750,
          deadline: '2025-12-31',
          priority: 'high',
          status: 'on-track',
          monthlyContribution: 500,
          description: 'Build 6-month emergency fund for financial security',
          milestones: [
            { percentage: 25, amount: 6250, reached: true, date: '2024-03-15' },
            { percentage: 50, amount: 12500, reached: true, date: '2024-07-20' },
            { percentage: 75, amount: 18750, reached: true, date: '2024-11-10' },
            { percentage: 100, amount: 25000, reached: false }
          ],
          tags: ['emergency', 'security', 'high-priority'],
          createdDate: '2024-01-01'
        },
        {
          id: '2',
          name: 'House Down Payment',
          type: 'savings',
          targetAmount: 50000,
          currentAmount: 12500,
          deadline: '2027-06-30',
          priority: 'high',
          status: 'on-track',
          monthlyContribution: 800,
          description: 'Save for 20% down payment on first home',
          milestones: [
            { percentage: 25, amount: 12500, reached: true, date: '2024-12-01' },
            { percentage: 50, amount: 25000, reached: false },
            { percentage: 75, amount: 37500, reached: false },
            { percentage: 100, amount: 50000, reached: false }
          ],
          tags: ['home', 'investment', 'long-term'],
          createdDate: '2024-01-15'
        },
        {
          id: '3',
          name: 'Vacation Fund',
          type: 'savings',
          targetAmount: 5000,
          currentAmount: 3200,
          deadline: '2025-06-01',
          priority: 'medium',
          status: 'ahead',
          monthlyContribution: 300,
          description: 'European vacation for 2 weeks',
          milestones: [
            { percentage: 25, amount: 1250, reached: true, date: '2024-09-01' },
            { percentage: 50, amount: 2500, reached: true, date: '2024-10-15' },
            { percentage: 75, amount: 3750, reached: false },
            { percentage: 100, amount: 5000, reached: false }
          ],
          tags: ['vacation', 'lifestyle', 'short-term'],
          createdDate: '2024-08-01'
        },
        {
          id: '4',
          name: 'Credit Card Debt',
          type: 'debt-payoff',
          targetAmount: 8500,
          currentAmount: 3400,
          deadline: '2025-08-31',
          priority: 'high',
          status: 'behind',
          monthlyContribution: 600,
          description: 'Pay off high-interest credit card debt',
          milestones: [
            { percentage: 25, amount: 2125, reached: true, date: '2024-05-01' },
            { percentage: 50, amount: 4250, reached: false },
            { percentage: 75, amount: 6375, reached: false },
            { percentage: 100, amount: 8500, reached: false }
          ],
          tags: ['debt', 'urgent', 'high-interest'],
          createdDate: '2024-02-01'
        }
      ]

      const mockAchievements: Achievement[] = [
        {
          id: '1',
          name: 'First Goal',
          description: 'Created your first financial goal',
          icon: 'target',
          type: 'milestone',
          earnedDate: '2024-01-01'
        },
        {
          id: '2',
          name: 'Milestone Master',
          description: 'Reached 5 goal milestones',
          icon: 'trophy',
          type: 'milestone',
          earnedDate: '2024-11-10'
        },
        {
          id: '3',
          name: 'Consistency Champion',
          description: 'Made contributions for 30 consecutive days',
          icon: 'star',
          type: 'streak',
          earnedDate: '2024-10-01'
        },
        {
          id: '4',
          name: 'Savings Superstar',
          description: 'Saved over €10,000 total',
          icon: 'piggy-bank',
          type: 'milestone',
          earnedDate: '2024-08-15'
        },
        {
          id: '5',
          name: 'Challenge Complete',
          description: 'Finish the Emergency Fund Challenge',
          icon: 'award',
          type: 'challenge',
          progress: 75,
          target: 100
        }
      ]

      const mockStats: UserStats = {
        totalGoals: 4,
        completedGoals: 1,
        totalSaved: 34450,
        currentStreak: 23,
        level: 5,
        points: 2450,
        nextLevelPoints: 3000
      }

      setGoals(mockGoals)
      setAchievements(mockAchievements)
      setUserStats(mockStats)
    }

    loadGoals()
  }, [])

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'savings': return <PiggyBank className="h-5 w-5" />
      case 'debt-payoff': return <CreditCard className="h-5 w-5" />
      case 'investment': return <TrendingUp className="h-5 w-5" />
      case 'expense-reduction': return <Target className="h-5 w-5" />
      case 'income': return <DollarSign className="h-5 w-5" />
      default: return <Target className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'ahead': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'behind': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'at-risk': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const calculateTimeLeft = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return '1 day left'
    if (diffDays < 30) return `${diffDays} days left`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months left`
    return `${Math.ceil(diffDays / 365)} years left`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Goals</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track progress and achieve your financial dreams
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Level {userStats.level}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{userStats.points}/{userStats.nextLevelPoints} XP</div>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </div>
          </div>

          {/* User Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="p-4">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.totalGoals}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Goals</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.completedGoals}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">€{userStats.totalSaved.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Saved</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.currentStreak}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">My Goals</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Goal Progress Summary */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Goal Progress Overview</h3>
                  <div className="space-y-4">
                    {goals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {getGoalIcon(goal.type)}
                            <span className="font-medium text-gray-900 dark:text-white ml-2">{goal.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={getStatusColor(goal.status)}>
                              {goal.status.replace('-', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                              {goal.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span>€{goal.currentAmount.toLocaleString()} of €{goal.targetAmount.toLocaleString()}</span>
                            <span>{calculateProgress(goal.currentAmount, goal.targetAmount).toFixed(1)}%</span>
                          </div>
                          <Progress value={calculateProgress(goal.currentAmount, goal.targetAmount)} className="h-2" />
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>€{goal.monthlyContribution}/month</span>
                          <span>{calculateTimeLeft(goal.deadline)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Milestones</h3>
                  <div className="space-y-3">
                    {goals.flatMap(goal => 
                      goal.milestones
                        .filter(milestone => milestone.reached && milestone.date)
                        .map(milestone => ({
                          ...milestone,
                          goalName: goal.name,
                          goalType: goal.type
                        }))
                    )
                    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
                    .slice(0, 5)
                    .map((milestone, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Trophy className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {milestone.goalName} - {milestone.percentage}% Milestone
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Reached €{milestone.amount.toLocaleString()} on {new Date(milestone.date!).toLocaleDateString()}
                          </div>
                        </div>
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Level Progress */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Level Progress</h3>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-blue-600 mb-2">Level {userStats.level}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Financial Achiever</div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>{userStats.points} XP</span>
                      <span>{userStats.nextLevelPoints} XP</span>
                    </div>
                    <Progress value={(userStats.points / userStats.nextLevelPoints) * 100} className="h-2" />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {userStats.nextLevelPoints - userStats.points} XP to next level
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Goal
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Join Challenge
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Goal Settings
                    </Button>
                  </div>
                </Card>

                {/* Recent Achievements */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Achievements</h3>
                  <div className="space-y-3">
                    {achievements
                      .filter(achievement => achievement.earnedDate)
                      .sort((a, b) => new Date(b.earnedDate!).getTime() - new Date(a.earnedDate!).getTime())
                      .slice(0, 3)
                      .map((achievement) => (
                        <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <Award className="h-5 w-5 text-yellow-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {achievement.name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {achievement.description}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* My Goals Tab */}
          <TabsContent value="goals">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <Card key={goal.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getGoalIcon(goal.type)}
                      <h3 className="font-semibold text-gray-900 dark:text-white ml-2">{goal.name}</h3>
                    </div>
                    <div className="flex space-x-1">
                      <Badge variant="outline" className={getStatusColor(goal.status)}>
                        {goal.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{goal.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Progress</span>
                      <span>{calculateProgress(goal.currentAmount, goal.targetAmount).toFixed(1)}%</span>
                    </div>
                    <Progress value={calculateProgress(goal.currentAmount, goal.targetAmount)} className="h-3 mb-2" />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">€{goal.currentAmount.toLocaleString()}</span>
                      <span className="text-gray-600 dark:text-gray-400">€{goal.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Milestones</span>
                    </div>
                    <div className="flex space-x-1">
                      {goal.milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className={`flex-1 h-2 rounded ${
                            milestone.reached 
                              ? 'bg-green-500' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                          title={`${milestone.percentage}% - €${milestone.amount.toLocaleString()}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>€{goal.monthlyContribution}/month</span>
                    <span>{calculateTimeLeft(goal.deadline)}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}

              {/* Add New Goal Card */}
              <Card className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors">
                <div className="text-center">
                  <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Create New Goal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Set a new financial target and start your journey
                  </p>
                  <Button>
                    Get Started
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`p-6 ${achievement.earnedDate ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : ''}`}>
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      achievement.earnedDate 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}>
                      <Award className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{achievement.description}</p>
                    
                    {achievement.earnedDate ? (
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                      </div>
                    ) : achievement.progress !== undefined ? (
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {achievement.progress}/{achievement.target}
                        </div>
                        <Progress value={(achievement.progress / achievement.target!) * 100} className="h-2" />
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Not yet earned
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Insights Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Get personalized recommendations and goal optimization insights.
              </p>
              <Button>Get Notified</Button>
            </div>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social">
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Social Features Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Share goals, join challenges, and connect with accountability partners.
              </p>
              <Button>Get Notified</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}