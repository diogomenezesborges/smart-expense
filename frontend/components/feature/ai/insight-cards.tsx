'use client';

import { useState, useEffect } from 'react';
import { Insight, AIService } from '@/lib/services/ai-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Target,
  DollarSign,
  Clock,
  MoreHorizontal,
  X
} from 'lucide-react';

interface InsightCardsProps {
  userId: string;
  limit?: number;
  showActions?: boolean;
  className?: string;
}

export function InsightCards({ 
  userId, 
  limit = 6, 
  showActions = true, 
  className = '' 
}: InsightCardsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadInsights();
  }, [userId]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AIService.getInsights(userId);
      setInsights(data.slice(0, limit));
    } catch (err) {
      setError('Failed to load insights');
      console.error('Error loading insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'opportunity':
        return <Lightbulb className="h-5 w-5 text-blue-600" />;
      default:
        return <TrendingUp className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'opportunity':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: Insight['priority']) => {
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

  const getImpactIcon = (impact: Insight['impact']) => {
    switch (impact) {
      case 'financial':
        return <DollarSign className="h-3 w-3" />;
      case 'goal-related':
        return <Target className="h-3 w-3" />;
      case 'behavioral':
        return <TrendingUp className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const handleDismissInsight = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
  };

  const handleImplementRecommendation = (insight: Insight) => {
    // In a real app, this would navigate to the relevant section or create a task
    console.log('Implementing recommendations for:', insight.title);
    // For now, just dismiss the insight
    handleDismissInsight(insight.id);
  };

  const visibleInsights = insights.filter(insight => !dismissedInsights.has(insight.id));

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-muted-foreground">Loading AI insights...</span>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={loadInsights}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (visibleInsights.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
          <p className="text-gray-600">
            We're analyzing your financial data to generate personalized insights. 
            Check back soon for AI-powered recommendations!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">AI Insights</h3>
        <Button variant="outline" size="sm" onClick={loadInsights}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {visibleInsights.map((insight) => (
          <Card 
            key={insight.id} 
            className={`relative ${getInsightColor(insight.type)} transition-all hover:shadow-md`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(insight.priority)}
                  {showActions && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDismissInsight(insight.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <CardDescription className="text-sm mb-3">
                {insight.description}
              </CardDescription>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  {getImpactIcon(insight.impact)}
                  <span className="capitalize">{insight.impact.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{insight.generatedAt.toLocaleDateString()}</span>
                </div>
                <div>
                  {Math.round(insight.confidence * 100)}% confidence
                </div>
              </div>

              {insight.actionable && insight.recommendations && insight.recommendations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Recommendations:</div>
                  <ul className="text-sm space-y-1">
                    {insight.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {showActions && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleImplementRecommendation(insight)}
                      >
                        Take Action
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismissInsight(insight.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {insights.length > limit && (
        <Card className="border-dashed">
          <CardContent className="p-4 text-center">
            <Button variant="outline" className="w-full">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              View All {insights.length} Insights
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}