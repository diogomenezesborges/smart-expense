'use client';

import { useState, useEffect } from 'react';
import { Recommendation, AIService, FinancialContext } from '@/lib/services/ai-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Target, 
  DollarSign, 
  Clock, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Shield,
  RefreshCw
} from 'lucide-react';

interface RecommendationPanelProps {
  financialContext: FinancialContext;
  onRecommendationAction?: (recommendation: Recommendation, action: string) => void;
  className?: string;
}

export function RecommendationPanel({ 
  financialContext, 
  onRecommendationAction,
  className = '' 
}: RecommendationPanelProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [implementedRecommendations, setImplementedRecommendations] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
  }, [financialContext]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AIService.getRecommendations(financialContext);
      setRecommendations(data);
    } catch (err) {
      setError('Failed to load recommendations');
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: Recommendation['category']) => {
    switch (category) {
      case 'spending':
        return <DollarSign className="h-4 w-4 text-red-600" />;
      case 'saving':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'investing':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'budgeting':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'goal-setting':
        return <Star className="h-4 w-4 text-yellow-600" />;
      default:
        return <Zap className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: Recommendation['category']) => {
    switch (category) {
      case 'spending':
        return 'border-red-200 bg-red-50';
      case 'saving':
        return 'border-green-200 bg-green-50';
      case 'investing':
        return 'border-blue-200 bg-blue-50';
      case 'budgeting':
        return 'border-purple-200 bg-purple-50';
      case 'goal-setting':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: Recommendation['priority']) => {
    const variants = {
      high: 'destructive',
      medium: 'default', 
      low: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: Recommendation['difficulty']) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge variant="outline" className={`text-xs ${colors[difficulty]}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Badge>
    );
  };

  const formatImpact = (impact: Recommendation['estimatedImpact']) => {
    const items = [];
    
    if (impact.savings) {
      items.push(`€${impact.savings.toLocaleString()} saved/year`);
    }
    if (impact.timeToGoal) {
      const days = Math.abs(impact.timeToGoal);
      items.push(`${days} days ${impact.timeToGoal < 0 ? 'faster' : 'slower'}`);
    }
    if (impact.riskReduction) {
      items.push(`${impact.riskReduction}% risk reduction`);
    }
    
    return items.join(' • ');
  };

  const handleImplement = (recommendation: Recommendation) => {
    setImplementedRecommendations(prev => new Set([...prev, recommendation.id]));
    onRecommendationAction?.(recommendation, 'implement');
  };

  const handleDismiss = (recommendation: Recommendation) => {
    onRecommendationAction?.(recommendation, 'dismiss');
  };

  const getImplementationProgress = (recommendation: Recommendation) => {
    // Mock progress calculation - in real app, track actual implementation
    if (implementedRecommendations.has(recommendation.id)) {
      return 100;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-muted-foreground">Generating recommendations...</span>
        </div>
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={loadRecommendations}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
          <p className="text-gray-600">
            We're analyzing your financial patterns to provide personalized recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">AI Recommendations</h3>
        <Button variant="outline" size="sm" onClick={loadRecommendations}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {recommendations.map((recommendation) => {
          const progress = getImplementationProgress(recommendation);
          const isImplemented = implementedRecommendations.has(recommendation.id);
          
          return (
            <Card 
              key={recommendation.id} 
              className={`${getCategoryColor(recommendation.category)} transition-all hover:shadow-md`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(recommendation.category)}
                    <CardTitle className="text-base">{recommendation.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(recommendation.priority)}
                    {getDifficultyBadge(recommendation.difficulty)}
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {recommendation.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                {/* Impact and Timeframe */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Estimated Impact</div>
                    <div className="text-green-600">{formatImpact(recommendation.estimatedImpact)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Timeframe</div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{recommendation.timeframe}</span>
                    </div>
                  </div>
                </div>

                {/* Action Steps */}
                <div>
                  <div className="font-medium text-gray-700 mb-2">Action Steps:</div>
                  <div className="space-y-1">
                    {recommendation.actionSteps.slice(0, 3).map((step, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-600 mt-1 text-xs font-bold">
                          {index + 1}.
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                    {recommendation.actionSteps.length > 3 && (
                      <div className="text-sm text-gray-600 ml-4">
                        +{recommendation.actionSteps.length - 3} more steps...
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {progress > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">Implementation Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {!isImplemented ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleImplement(recommendation)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Implement
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismiss(recommendation)}
                      >
                        Dismiss
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      <span>Implemented</span>
                    </div>
                  )}
                  <Button size="sm" variant="ghost">
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {recommendations.length}
              </div>
              <div className="text-sm text-gray-600">Total Recommendations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {implementedRecommendations.size}
              </div>
              <div className="text-sm text-gray-600">Implemented</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                €{recommendations.reduce((total, rec) => 
                  total + (rec.estimatedImpact.savings || 0), 0
                ).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Potential Annual Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}