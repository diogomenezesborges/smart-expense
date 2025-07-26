'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  Calculator,
  Lightbulb,
  CheckCircle,
  PiggyBank,
  Home,
  ShoppingCart,
  Car,
  Coffee,
  Briefcase,
  Heart,
  Smartphone,
  BookOpen
} from 'lucide-react';

interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  allocation: {
    needs: number;
    wants: number;
    savings: number;
  };
  categories: CategoryBudget[];
}

interface CategoryBudget {
  id: string;
  name: string;
  icon: React.ReactNode;
  suggestedPercentage: number;
  amount: number;
  priority: 'high' | 'medium' | 'low';
  isEssential: boolean;
}

interface BudgetWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (budget: any) => void;
}

export function BudgetWizard({ isOpen, onClose, onComplete }: BudgetWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [categories, setCategories] = useState<CategoryBudget[]>([]);
  const [budgetName, setBudgetName] = useState('');

  const budgetTemplates: BudgetTemplate[] = [
    {
      id: '50-30-20',
      name: '50/30/20 Rule',
      description: 'Balanced approach: 50% needs, 30% wants, 20% savings',
      allocation: { needs: 50, wants: 30, savings: 20 },
      categories: [
        {
          id: 'housing',
          name: 'Housing & Bills',
          icon: <Home className="h-4 w-4" />,
          suggestedPercentage: 25,
          amount: 0,
          priority: 'high',
          isEssential: true
        },
        {
          id: 'food',
          name: 'Food & Groceries',
          icon: <ShoppingCart className="h-4 w-4" />,
          suggestedPercentage: 15,
          amount: 0,
          priority: 'high',
          isEssential: true
        },
        {
          id: 'transportation',
          name: 'Transportation',
          icon: <Car className="h-4 w-4" />,
          suggestedPercentage: 10,
          amount: 0,
          priority: 'high',
          isEssential: true
        },
        {
          id: 'entertainment',
          name: 'Entertainment',
          icon: <Coffee className="h-4 w-4" />,
          suggestedPercentage: 15,
          amount: 0,
          priority: 'medium',
          isEssential: false
        },
        {
          id: 'shopping',
          name: 'Shopping',
          icon: <ShoppingCart className="h-4 w-4" />,
          suggestedPercentage: 10,
          amount: 0,
          priority: 'medium',
          isEssential: false
        },
        {
          id: 'health',
          name: 'Health & Wellness',
          icon: <Heart className="h-4 w-4" />,
          suggestedPercentage: 5,
          amount: 0,
          priority: 'medium',
          isEssential: false
        },
        {
          id: 'savings',
          name: 'Emergency Fund',
          icon: <PiggyBank className="h-4 w-4" />,
          suggestedPercentage: 10,
          amount: 0,
          priority: 'high',
          isEssential: true
        },
        {
          id: 'investments',
          name: 'Investments',
          icon: <TrendingUp className="h-4 w-4" />,
          suggestedPercentage: 10,
          amount: 0,
          priority: 'medium',
          isEssential: false
        }
      ]
    },
    {
      id: 'zero-based',
      name: 'Zero-Based Budget',
      description: 'Every euro has a purpose - allocate all income to categories',
      allocation: { needs: 60, wants: 25, savings: 15 },
      categories: [
        {
          id: 'housing',
          name: 'Housing & Bills',
          icon: <Home className="h-4 w-4" />,
          suggestedPercentage: 30,
          amount: 0,
          priority: 'high',
          isEssential: true
        },
        {
          id: 'food',
          name: 'Food & Groceries',
          icon: <ShoppingCart className="h-4 w-4" />,
          suggestedPercentage: 20,
          amount: 0,
          priority: 'high',
          isEssential: true
        },
        {
          id: 'transportation',
          name: 'Transportation',
          icon: <Car className="h-4 w-4" />,
          suggestedPercentage: 10,
          amount: 0,
          priority: 'high',
          isEssential: true
        },
        {
          id: 'utilities',
          name: 'Utilities & Phone',
          icon: <Smartphone className="h-4 w-4" />,
          suggestedPercentage: 8,
          amount: 0,
          priority: 'high',
          isEssential: true
        },
        {
          id: 'entertainment',
          name: 'Entertainment',
          icon: <Coffee className="h-4 w-4" />,
          suggestedPercentage: 10,
          amount: 0,
          priority: 'medium',
          isEssential: false
        },
        {
          id: 'personal',
          name: 'Personal Care',
          icon: <Heart className="h-4 w-4" />,
          suggestedPercentage: 5,
          amount: 0,
          priority: 'medium',
          isEssential: false
        },
        {
          id: 'education',
          name: 'Education',
          icon: <BookOpen className="h-4 w-4" />,
          suggestedPercentage: 2,
          amount: 0,
          priority: 'low',
          isEssential: false
        },
        {
          id: 'savings',
          name: 'Emergency Fund',
          icon: <PiggyBank className="h-4 w-4" />,
          suggestedPercentage: 10,
          amount: 0,
          priority: 'high',
          isEssential: true
        },
        {
          id: 'investments',
          name: 'Investments',
          icon: <TrendingUp className="h-4 w-4" />,
          suggestedPercentage: 5,
          amount: 0,
          priority: 'medium',
          isEssential: false
        }
      ]
    },
    {
      id: 'aggressive-savings',
      name: 'Aggressive Savings',
      description: 'Maximize savings: 40% needs, 20% wants, 40% savings/investments',
      allocation: { needs: 40, wants: 20, savings: 40 },
      categories: [
        {
          id: 'housing',
          name: 'Housing & Bills',
          icon: <Home className="h-4 w-4" />,
          suggestedPercentage: 20,
          amount: 0,
          priority: 'high',
          isEssential: true
        },
        {
          id: 'food',
          name: 'Food & Groceries',
          icon: <ShoppingCart className="h-4 w-4" />,
          suggestedPercentage: 12,
          amount: 0,
          priority: 'high',
          isEssential: true
        },
        {
          id: 'transportation',
          name: 'Transportation',
          icon: <Car className="h-4 w-4" />,
          suggestedPercentage: 8,
          amount: 0,
          priority: 'high',
          isEssential: true
        },
        {
          id: 'entertainment',
          name: 'Entertainment',
          icon: <Coffee className="h-4 w-4" />,
          suggestedPercentage: 10,
          amount: 0,
          priority: 'low',
          isEssential: false
        },
        {
          id: 'shopping',
          name: 'Personal Shopping',
          icon: <ShoppingCart className="h-4 w-4" />,
          suggestedPercentage: 5,
          amount: 0,
          priority: 'low',
          isEssential: false
        },
        {
          id: 'health',
          name: 'Health & Wellness',
          icon: <Heart className="h-4 w-4" />,
          suggestedPercentage: 5,
          amount: 0,
          priority: 'medium',
          isEssential: false
        },
        {
          id: 'emergency',
          name: 'Emergency Fund',
          icon: <PiggyBank className="h-4 w-4" />,
          suggestedPercentage: 20,
          amount: 0,
          priority: 'high',
          isEssential: true
        },
        {
          id: 'investments',
          name: 'Investments',
          icon: <TrendingUp className="h-4 w-4" />,
          suggestedPercentage: 20,
          amount: 0,
          priority: 'high',
          isEssential: true
        }
      ]
    }
  ];

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleTemplateSelect = (templateId: string) => {
    const template = budgetTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      const categoriesWithAmounts = template.categories.map(cat => ({
        ...cat,
        amount: Math.round((monthlyIncome * cat.suggestedPercentage) / 100)
      }));
      setCategories(categoriesWithAmounts);
    }
  };

  const updateCategoryAmount = (categoryId: string, amount: number) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, amount } : cat
    ));
  };

  const getTotalAllocated = () => {
    return categories.reduce((sum, cat) => sum + cat.amount, 0);
  };

  const getRemainingAmount = () => {
    return monthlyIncome - getTotalAllocated();
  };

  const getAIRecommendations = () => {
    const recommendations = [];
    const totalAllocated = getTotalAllocated();
    
    if (totalAllocated > monthlyIncome) {
      recommendations.push({
        type: 'warning',
        title: 'Budget Exceeds Income',
        description: `You've allocated €${(totalAllocated - monthlyIncome).toFixed(0)} more than your income. Consider reducing non-essential categories.`
      });
    }
    
    if (totalAllocated < monthlyIncome * 0.9) {
      recommendations.push({
        type: 'info',
        title: 'Increase Savings',
        description: `You have €${(monthlyIncome - totalAllocated).toFixed(0)} unallocated. Consider increasing savings or investments.`
      });
    }

    const savingsRate = (categories.find(c => c.id === 'savings')?.amount || 0) / monthlyIncome * 100;
    if (savingsRate < 10) {
      recommendations.push({
        type: 'suggestion',
        title: 'Emergency Fund Priority',
        description: `Your emergency fund is ${savingsRate.toFixed(1)}% of income. Experts recommend at least 10-20%.`
      });
    }

    return recommendations;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const budgetData = {
      name: budgetName || `${selectedTemplate} Budget`,
      monthlyIncome,
      template: selectedTemplate,
      categories,
      totalAllocated: getTotalAllocated(),
      remainingAmount: getRemainingAmount(),
      createdAt: new Date().toISOString()
    };
    
    onComplete(budgetData);
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold">What's your monthly income?</h3>
              <p className="text-muted-foreground">This helps us create a personalized budget plan</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="income">Monthly Net Income (after taxes)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="Enter your monthly income in €"
                  value={monthlyIncome || ''}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="text-lg text-center"
                />
              </div>
              
              {monthlyIncome > 0 && (
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Based on €{monthlyIncome.toLocaleString()}/month, we'll suggest budget allocations
                    that fit your income level and financial goals.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Choose your budget approach</h3>
              <p className="text-muted-foreground">Select a template that matches your financial goals</p>
            </div>
            
            <div className="grid gap-4">
              {budgetTemplates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      {selectedTemplate === template.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Needs {template.allocation.needs}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span>Wants {template.allocation.wants}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Savings {template.allocation.savings}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Customize your categories</h3>
              <p className="text-muted-foreground">Adjust amounts based on your spending patterns</p>
            </div>
            
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {category.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{category.name}</span>
                        {category.isEssential && (
                          <Badge variant="outline" className="px-1 py-0 text-xs">Essential</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Suggested: {category.suggestedPercentage}% (€{Math.round((monthlyIncome * category.suggestedPercentage) / 100)})
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-32">
                    <Input
                      type="number"
                      value={category.amount}
                      onChange={(e) => updateCategoryAmount(category.id, Number(e.target.value))}
                      className="text-right"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Total Allocated:</span>
                <span className="font-bold text-lg">€{getTotalAllocated().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Remaining:</span>
                <span className={`font-medium ${getRemainingAmount() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  €{getRemainingAmount().toLocaleString()}
                </span>
              </div>
              <Progress 
                value={Math.min((getTotalAllocated() / monthlyIncome) * 100, 100)} 
                className="mt-2"
              />
            </div>
          </div>
        );

      case 4:
        const recommendations = getAIRecommendations();
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold">AI Budget Analysis</h3>
              <p className="text-muted-foreground">Here are some insights about your budget</p>
            </div>
            
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.type === 'warning' ? 'border-l-red-500 bg-red-50' :
                      rec.type === 'info' ? 'border-l-blue-500 bg-blue-50' :
                      'border-l-green-500 bg-green-50'
                    }`}
                  >
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-green-800">Great Budget Balance!</h4>
                <p className="text-sm text-green-600">Your budget allocation looks well-balanced and sustainable.</p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">
                  {Math.round((categories.filter(c => c.isEssential).reduce((sum, c) => sum + c.amount, 0) / monthlyIncome) * 100)}%
                </div>
                <div className="text-xs text-red-600">Needs</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">
                  {Math.round((categories.filter(c => !c.isEssential && c.id !== 'savings' && c.id !== 'investments').reduce((sum, c) => sum + c.amount, 0) / monthlyIncome) * 100)}%
                </div>
                <div className="text-xs text-yellow-600">Wants</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {Math.round((categories.filter(c => c.id === 'savings' || c.id === 'investments').reduce((sum, c) => sum + c.amount, 0) / monthlyIncome) * 100)}%
                </div>
                <div className="text-xs text-green-600">Savings</div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Name your budget</h3>
              <p className="text-muted-foreground">Give your budget a memorable name</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="budget-name">Budget Name</Label>
                <Input
                  id="budget-name"
                  placeholder="e.g., My Monthly Budget, January 2025"
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                />
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="font-medium mb-2">Budget Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Income:</span>
                    <span className="font-medium">€{monthlyIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Allocated:</span>
                    <span className="font-medium">€{getTotalAllocated().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categories:</span>
                    <span className="font-medium">{categories.length}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-2">
                    <span>Remaining:</span>
                    <span className={`font-bold ${getRemainingAmount() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      €{getRemainingAmount().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Budget Wizard</span>
            <Badge variant="outline">Step {currentStep} of {totalSteps}</Badge>
          </DialogTitle>
          <DialogDescription>
            Create a personalized budget with AI-powered recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={progress} className="w-full" />
          
          {renderStep()}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && monthlyIncome <= 0) ||
                  (currentStep === 2 && !selectedTemplate)
                }
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                disabled={!budgetName.trim() || getRemainingAmount() < 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}