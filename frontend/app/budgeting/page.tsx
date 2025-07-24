'use client';

import { useState } from 'react';
import { BudgetOverview } from '@/components/feature/budgeting/budget-overview';
import { CategoryBudgets } from '@/components/feature/budgeting/category-budgets';
import { BudgetChart } from '@/components/feature/budgeting/budget-chart';
import { BudgetGoals } from '@/components/feature/budgeting/budget-goals';
import { BudgetWizard } from '@/components/feature/budgeting/budget-wizard';
import { BudgetAnalytics } from '@/components/feature/budgeting/budget-analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  Plus, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  Target
} from 'lucide-react';

interface BudgetAlert {
  id: string;
  category: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export default function SmartBudgetingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showBudgetWizard, setShowBudgetWizard] = useState(false);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([
    {
      id: '1',
      category: 'Transportes',
      type: 'warning',
      message: 'You\'ve reached 90% of your transportation budget (€360/€400)',
      timestamp: new Date().toISOString(),
      isRead: false
    },
    {
      id: '2',
      category: 'Casa',
      type: 'danger',
      message: 'Casa budget exceeded! €645 spent of €600 budget',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: false
    },
    {
      id: '3',
      category: 'Alimentação',
      type: 'info',
      message: 'Great job! You\'re 15% under budget for food this month',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isRead: true
    }
  ]);

  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  const markAlertAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertStyle = (type: string, isRead: boolean) => {
    const baseStyle = `p-4 border-l-4 rounded-lg ${isRead ? 'opacity-60' : ''}`;
    switch (type) {
      case 'danger': return `${baseStyle} border-l-red-500 bg-red-50`;
      case 'warning': return `${baseStyle} border-l-yellow-500 bg-yellow-50`;
      case 'info': return `${baseStyle} border-l-blue-500 bg-blue-50`;
      default: return `${baseStyle} border-l-gray-500 bg-gray-50`;
    }
  };

  const handleBudgetCreated = (budgetData: any) => {
    setBudgets([...budgets, { ...budgetData, id: Date.now().toString() }]);
    // Here you would typically save to database
    console.log('New budget created:', budgetData);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Smart Budgeting</h1>
          <p className="text-muted-foreground mt-1">AI-powered budget management and alerts</p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadAlerts.length > 0 && (
            <Badge variant="destructive" className="relative">
              <Bell className="h-4 w-4 mr-1" />
              {unreadAlerts.length} Alert{unreadAlerts.length !== 1 ? 's' : ''}
            </Badge>
          )}
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowBudgetWizard(true)} variant="default">
            <Target className="h-4 w-4 mr-2" />
            Budget Wizard
          </Button>
          <Dialog open={showCreateBudget} onOpenChange={setShowCreateBudget}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Budget</DialogTitle>
                <DialogDescription>
                  Set up a new budget for a spending category with smart alerts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Alimentação</SelectItem>
                      <SelectItem value="transport">Transportes</SelectItem>
                      <SelectItem value="home">Casa</SelectItem>
                      <SelectItem value="entertainment">Entretenimento</SelectItem>
                      <SelectItem value="shopping">Compras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Monthly Budget (€)</Label>
                  <Input id="amount" type="number" placeholder="Enter amount" />
                </div>
                <div>
                  <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
                  <Input id="alertThreshold" type="number" placeholder="80" min="50" max="95" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get alerts when spending reaches this percentage
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateBudget(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateBudget(false)}>
                  Create Budget
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Smart Alerts Section */}
      {unreadAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-orange-800">
              <Bell className="h-5 w-5 mr-2" />
              Budget Alerts ({unreadAlerts.length})
            </CardTitle>
            <CardDescription className="text-orange-700">
              You have {unreadAlerts.length} active budget alert{unreadAlerts.length !== 1 ? 's' : ''} requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {unreadAlerts.slice(0, 2).map((alert) => (
              <div key={alert.id} className={getAlertStyle(alert.type, alert.isRead)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{alert.category}</span>
                        <Badge variant="outline" className="text-xs">
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAlertAsRead(alert.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
            {unreadAlerts.length > 2 && (
              <p className="text-sm text-muted-foreground text-center">
                +{unreadAlerts.length - 2} more alerts. View all in Budget Management.
              </p>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Budget Overview Cards */}
      <BudgetOverview />
      
      {/* Enhanced Tabs Layout */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Budget Chart - Takes 2 columns */}
            <div className="lg:col-span-2">
              <BudgetChart />
            </div>
            
            {/* Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">This Month Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Budgeted</span>
                    <span className="font-medium">€2,100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Spent</span>
                    <span className="font-medium text-red-600">€1,748</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Remaining</span>
                    <span className="font-medium text-green-600">€352</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Performance</span>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">16.7% under</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Budget Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600">On Track</span>
                      <span>2 categories</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-yellow-600">Near Limit</span>
                      <span>1 category</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-600">Over Budget</span>
                      <span>1 category</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoryBudgets />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <BudgetGoals />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <BudgetAnalytics />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                AI Budget Insights
              </CardTitle>
              <CardDescription>
                Smart recommendations to optimize your budget performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border-l-4 border-l-blue-500 rounded-lg">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Savings Opportunity</h4>
                    <p className="text-blue-800 text-sm mt-1">
                      You consistently spend 15% less on food. Consider reducing your food budget by €100 
                      and allocating it to your emergency fund.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-blue-700 mt-2">
                      Apply Suggestion →
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 border-l-4 border-l-yellow-500 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Budget Rebalancing</h4>
                    <p className="text-yellow-800 text-sm mt-1">
                      Your transportation spending is consistently high. Consider increasing this budget 
                      or exploring alternative transport options.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-yellow-700 mt-2">
                      Review Transportation →
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 border-l-4 border-l-green-500 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Excellent Progress</h4>
                    <p className="text-green-800 text-sm mt-1">
                      You've maintained budget discipline for 3 consecutive months. 
                      Your financial stability is improving significantly.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Budget Wizard */}
      <BudgetWizard 
        isOpen={showBudgetWizard}
        onClose={() => setShowBudgetWizard(false)}
        onComplete={handleBudgetCreated}
      />
    </div>
  );
}