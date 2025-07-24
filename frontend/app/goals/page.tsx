'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  PiggyBank,
  DollarSign,
  TrendingDown,
  Shield,
  Lightbulb,
  Trophy,
  Settings
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'savings' | 'spending_limit' | 'investment' | 'debt_reduction' | 'emergency_fund';
  status: 'active' | 'completed' | 'paused' | 'failed';
  period: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate: Date;
  priority: 'low' | 'medium' | 'high';
  isRecurring: boolean;
  notifications: boolean;
}

interface GoalProgress {
  goalId: string;
  progress: number;
  amountToGo: number;
  daysRemaining: number;
  averageRequired: number;
  isOnTrack: boolean;
  projectedCompletion?: Date;
  velocity: number;
}

interface GoalInsight {
  type: 'achievement' | 'warning' | 'suggestion' | 'milestone';
  title: string;
  description: string;
  goalId: string;
  actionable?: boolean;
  action?: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [insights, setInsights] = useState<GoalInsight[]>([]);
  const [progressData, setProgressData] = useState<Map<string, GoalProgress>>(new Map());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'savings' as const,
    period: 'yearly' as const,
    targetAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium' as const,
    isRecurring: false,
    notifications: true,
  });

  useEffect(() => {
    loadGoals();
    loadInsights();
  }, [filterStatus, filterType]);

  useEffect(() => {
    // Load progress data for all goals
    goals.forEach(goal => {
      loadGoalProgress(goal.id);
    });
  }, [goals]);

  const loadGoals = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);

      const response = await fetch(`/api/goals?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setGoals(result.data.map((goal: any) => ({
          ...goal,
          startDate: new Date(goal.startDate),
          targetDate: new Date(goal.targetDate),
        })));
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await fetch('/api/goals?action=insights');
      const result = await response.json();
      
      if (result.success) {
        setInsights(result.data);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const loadGoalProgress = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals?action=progress&goalId=${goalId}`);
      const result = await response.json();
      
      if (result.success) {
        setProgressData(prev => new Map(prev.set(goalId, result.data)));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const createGoal = async () => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowCreateDialog(false);
        setNewGoal({
          title: '',
          description: '',
          type: 'savings',
          period: 'yearly',
          targetAmount: 0,
          startDate: new Date().toISOString().split('T')[0],
          targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'medium',
          isRecurring: false,
          notifications: true,
        });
        loadGoals();
        loadInsights();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const updateGoal = async (goalId: string, updates: any) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, ...updates }),
      });

      const result = await response.json();
      
      if (result.success) {
        loadGoals();
        loadInsights();
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals?goalId=${goalId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        loadGoals();
        loadInsights();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const createSampleGoals = async () => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_sample' }),
      });

      const result = await response.json();
      
      if (result.success) {
        loadGoals();
        loadInsights();
      }
    } catch (error) {
      console.error('Error creating sample goals:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'savings': return <PiggyBank className="h-4 w-4" />;
      case 'spending_limit': return <TrendingDown className="h-4 w-4" />;
      case 'investment': return <TrendingUp className="h-4 w-4" />;
      case 'debt_reduction': return <DollarSign className="h-4 w-4" />;
      case 'emergency_fund': return <Shield className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-blue-600" />;
      case 'milestone': return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">Track and achieve your financial objectives</p>
        </div>
        <div className="flex items-center space-x-3">
          {goals.length === 0 && (
            <Button variant="outline" onClick={createSampleGoals}>
              <Target className="h-4 w-4 mr-2" />
              Create Sample Goals
            </Button>
          )}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set up a new financial goal to track your progress
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Emergency Fund"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your goal..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Goal Type</Label>
                    <Select value={newGoal.type} onValueChange={(value: any) => 
                      setNewGoal(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="savings">Savings Goal</SelectItem>
                        <SelectItem value="spending_limit">Spending Limit</SelectItem>
                        <SelectItem value="investment">Investment Target</SelectItem>
                        <SelectItem value="debt_reduction">Debt Reduction</SelectItem>
                        <SelectItem value="emergency_fund">Emergency Fund</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="period">Period</Label>
                    <Select value={newGoal.period} onValueChange={(value: any) => 
                      setNewGoal(prev => ({ ...prev, period: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="one_time">One Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="targetAmount">Target Amount (€)</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: parseFloat(e.target.value) || 0 }))}
                    placeholder="1000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newGoal.startDate}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newGoal.priority} onValueChange={(value: any) => 
                    setNewGoal(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isRecurring"
                      checked={newGoal.isRecurring}
                      onCheckedChange={(checked) => setNewGoal(prev => ({
                        ...prev,
                        isRecurring: checked as boolean
                      }))}
                    />
                    <Label htmlFor="isRecurring" className="text-sm">
                      Recurring Goal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifications"
                      checked={newGoal.notifications}
                      onCheckedChange={(checked) => setNewGoal(prev => ({
                        ...prev,
                        notifications: checked as boolean
                      }))}
                    />
                    <Label htmlFor="notifications" className="text-sm">
                      Enable Notifications
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createGoal}>
                  Create Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Goal Insights
            </CardTitle>
            <CardDescription>
              AI-powered recommendations and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    {insight.actionable && insight.action && (
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                        {insight.action} →
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="spending_limit">Spending</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="emergency_fund">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeGoals.length}</div>
                <p className="text-xs text-muted-foreground">
                  {goals.filter(g => progressData.get(g.id)?.isOnTrack).length} on track
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Target</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {activeGoals.length} goals
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeGoals.length > 0 ? 
                    Math.round(activeGoals.reduce((sum, goal) => {
                      const progress = progressData.get(goal.id);
                      return sum + (progress?.progress || 0);
                    }, 0) / activeGoals.length) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average completion
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedGoals.length}</div>
                <p className="text-xs text-muted-foreground">
                  Goals achieved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Goals List */}
          <div className="grid gap-4 md:grid-cols-2">
            {goals.slice(0, 6).map((goal) => {
              const progress = progressData.get(goal.id);
              return (
                <Card key={goal.id} className={`border-l-4 ${getPriorityColor(goal.priority)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(goal.type)}
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedGoal(goal)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {goal.description && (
                      <CardDescription>{goal.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {formatCurrency(progress?.amountToGo ? goal.targetAmount - progress.amountToGo : goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <Progress value={progress?.progress || 0} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{Math.round(progress?.progress || 0)}% complete</span>
                        <span>{progress?.daysRemaining || 0} days left</span>
                      </div>
                    </div>
                    
                    {progress && !progress.isOnTrack && progress.daysRemaining > 0 && (
                      <div className="flex items-center space-x-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Need {formatCurrency(progress.averageRequired)}/day to stay on track</span>
                      </div>
                    )}
                    
                    {progress && progress.isOnTrack && (
                      <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                        <CheckCircle className="h-3 w-3" />
                        <span>On track for completion</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {activeGoals.map((goal) => {
              const progress = progressData.get(goal.id);
              return (
                <Card key={goal.id} className={`border-l-4 ${getPriorityColor(goal.priority)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(goal.type)}
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {goal.priority}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteGoal(goal.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {goal.description && (
                      <CardDescription>{goal.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <Progress value={progress?.progress || 0} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{Math.round(progress?.progress || 0)}% complete</span>
                        <span>Target: {goal.targetDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Remaining</div>
                        <div className="font-medium">{formatCurrency(progress?.amountToGo || goal.targetAmount)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Days Left</div>
                        <div className="font-medium">{progress?.daysRemaining || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="border-l-4 border-l-green-500 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(goal.type)}
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </div>
                  {goal.description && (
                    <CardDescription>{goal.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Achievement</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <Progress value={100} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      Completed on {goal.targetDate.toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}