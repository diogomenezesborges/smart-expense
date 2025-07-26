'use client';

import { useState, useEffect } from 'react';
import { CustomMetric, AdvancedAnalyticsService } from '@/lib/services/analytics-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown,
  Edit,
  Trash2,
  Calculator,
  Target,
  DollarSign,
  Percent
} from 'lucide-react';

interface CustomMetricsProps {
  userId: string;
  className?: string;
}

interface MetricFormData {
  name: string;
  formula: string;
  benchmark?: number;
}

const PREDEFINED_FORMULAS = [
  {
    name: 'Debt-to-Income Ratio',
    formula: '(total_debt / monthly_income) * 100',
    description: 'Percentage of income going to debt payments'
  },
  {
    name: 'Emergency Fund Months',
    formula: 'emergency_fund / monthly_expenses',
    description: 'Number of months your emergency fund will last'
  },
  {
    name: 'Discretionary Income',
    formula: 'monthly_income - (needs_expenses + debt_payments)',
    description: 'Income available for wants and savings'
  },
  {
    name: 'Investment Allocation',
    formula: '(investment_contributions / monthly_income) * 100',
    description: 'Percentage of income going to investments'
  },
  {
    name: 'Fixed Expense Ratio',
    formula: '(fixed_expenses / monthly_income) * 100',
    description: 'Percentage of income for non-negotiable expenses'
  },
  {
    name: 'Net Worth Growth Rate',
    formula: '((current_net_worth - previous_net_worth) / previous_net_worth) * 100',
    description: 'Annual percentage change in net worth'
  }
];

export function CustomMetrics({ userId, className = '' }: CustomMetricsProps) {
  const [metrics, setMetrics] = useState<CustomMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<CustomMetric | null>(null);
  const [formData, setFormData] = useState<MetricFormData>({
    name: '',
    formula: '',
    benchmark: undefined
  });

  useEffect(() => {
    loadCustomMetrics();
  }, [userId]);

  const loadCustomMetrics = async () => {
    try {
      setLoading(true);
      // Mock data - in production, fetch from API
      const mockMetrics: CustomMetric[] = [
        {
          id: '1',
          name: 'Savings Efficiency',
          formula: '(monthly_savings / monthly_income) * 100',
          value: 25.2,
          trend: 0.08,
          benchmark: 20
        },
        {
          id: '2',
          name: 'Lifestyle Inflation',
          formula: '(current_expenses - baseline_expenses) / baseline_expenses * 100',
          value: 12.5,
          trend: -0.03,
          benchmark: 15
        },
        {
          id: '3',
          name: 'Goal Velocity',
          formula: 'monthly_goal_progress / target_monthly_progress',
          value: 1.15,
          trend: 0.12,
          benchmark: 1.0
        }
      ];
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load custom metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMetric = async () => {
    if (!formData.name || !formData.formula) return;

    try {
      const newMetric = await AdvancedAnalyticsService.createCustomMetric(userId, {
        name: formData.name,
        formula: formData.formula,
        benchmark: formData.benchmark
      });

      setMetrics(prev => [...prev, newMetric]);
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create metric:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', formula: '', benchmark: undefined });
    setEditingMetric(null);
  };

  const handleUsePredefined = (formula: any) => {
    setFormData({
      name: formula.name,
      formula: formula.formula,
      benchmark: undefined
    });
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getValueColor = (value: number, benchmark?: number) => {
    if (!benchmark) return 'text-gray-900';
    if (value >= benchmark * 1.1) return 'text-green-600';
    if (value >= benchmark * 0.9) return 'text-blue-600';
    return 'text-red-600';
  };

  const formatValue = (value: number, formula: string) => {
    if (formula.includes('* 100') || formula.includes('percentage')) {
      return `${value.toFixed(1)}%`;
    }
    if (formula.includes('ratio') || formula.includes('/ ')) {
      return value.toFixed(2);
    }
    return `€${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-purple-600" />
                Custom Financial Metrics
              </CardTitle>
              <CardDescription>
                Create and track personalized financial KPIs
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Metric
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Custom Metric</DialogTitle>
                  <DialogDescription>
                    Define a custom formula to track specific aspects of your finances
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Predefined Templates */}
                  <div>
                    <Label className="text-sm font-medium">Quick Templates</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {PREDEFINED_FORMULAS.slice(0, 3).map((formula, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start h-auto p-3"
                          onClick={() => handleUsePredefined(formula)}
                        >
                          <div className="text-left">
                            <div className="font-medium">{formula.name}</div>
                            <div className="text-xs text-gray-600">{formula.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Form */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Metric Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        placeholder="e.g., Savings Rate"
                      />
                    </div>
                    <div>
                      <Label htmlFor="benchmark">Benchmark (optional)</Label>
                      <Input
                        id="benchmark"
                        type="number"
                        value={formData.benchmark || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          benchmark: e.target.value ? parseFloat(e.target.value) : undefined
                        }))}
                        placeholder="e.g., 20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="formula">Formula</Label>
                    <Input
                      id="formula"
                      value={formData.formula}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        formula: e.target.value
                      }))}
                      placeholder="e.g., (monthly_savings / monthly_income) * 100"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Available variables: monthly_income, monthly_expenses, total_debt, savings, etc.
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateMetric}>
                      Create Metric
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{metric.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Value Display */}
              <div className="text-center">
                <div className={`text-3xl font-bold ${getValueColor(metric.value, metric.benchmark)}`}>
                  {formatValue(metric.value, metric.formula)}
                </div>
                {metric.benchmark && (
                  <div className="text-sm text-gray-600">
                    Target: {formatValue(metric.benchmark, metric.formula)}
                  </div>
                )}
              </div>

              {/* Trend */}
              <div className="flex items-center justify-center gap-2">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                  {metric.trend > 0 ? '+' : ''}{(metric.trend * 100).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500">vs last period</span>
              </div>

              {/* Progress Bar */}
              {metric.benchmark && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progress to Target</span>
                    <span>{Math.round((metric.value / metric.benchmark) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.value >= metric.benchmark ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${Math.min((metric.value / metric.benchmark) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Formula */}
              <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                {metric.formula}
              </div>

              {/* Status Badge */}
              <div className="flex justify-center">
                {metric.benchmark ? (
                  <Badge 
                    variant={metric.value >= metric.benchmark ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {metric.value >= metric.benchmark ? 'On Target' : 'Below Target'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    No Benchmark
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Card */}
        <Card className="border-dashed border-2 hover:border-blue-300 transition-colors">
          <CardContent className="p-6">
            <div 
              className="h-full flex flex-col items-center justify-center gap-3 cursor-pointer"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-8 w-8 text-gray-400" />
              <div className="text-center">
                <div className="font-medium text-gray-700">Add Custom Metric</div>
                <div className="text-sm text-gray-500">Track your unique KPIs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Metric Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Performance Summary</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span>2 metrics exceeding targets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-blue-600" />
                  <span>1 metric approaching target</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-gray-600" />
                  <span>Overall trend: improving</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Consider increasing savings rate target to 30%</li>
                <li>• Monitor lifestyle inflation closely</li>
                <li>• Goal velocity indicates strong momentum</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}