'use client';

import { useState, useEffect } from 'react';
import { ForecastData, AdvancedAnalyticsService } from '@/lib/services/analytics-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  Info,
  Calendar,
  Target
} from 'lucide-react';

interface ForecastChartProps {
  userId: string;
  type?: 'cashflow' | 'expenses' | 'income';
  className?: string;
}

export function ForecastChart({ userId, type = 'cashflow', className = '' }: ForecastChartProps) {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('6');
  const [scenario, setScenario] = useState<'conservative' | 'optimistic' | 'pessimistic'>('conservative');
  const [showConfidence, setShowConfidence] = useState(true);

  useEffect(() => {
    loadForecast();
  }, [userId, timeframe, scenario]);

  const loadForecast = async () => {
    try {
      setLoading(true);
      const data = await AdvancedAnalyticsService.forecastCashFlow(
        userId, 
        parseInt(timeframe),
        scenario
      );
      setForecastData(data);
    } catch (error) {
      console.error('Failed to load forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScenarioDescription = (scenario: string) => {
    switch (scenario) {
      case 'optimistic':
        return 'Best-case scenario with income growth and controlled expenses';
      case 'pessimistic':
        return 'Conservative scenario accounting for potential income reduction';
      default:
        return 'Baseline forecast based on historical patterns';
    }
  };

  const formatChartData = () => {
    return forecastData.map((item, index) => ({
      period: new Date(item.period).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      predicted: item.predicted,
      confidence: item.confidence * 100,
      confidenceRange: item.predicted * (1 - item.confidence) * 0.2,
      upperBound: item.predicted + (item.predicted * (1 - item.confidence) * 0.1),
      lowerBound: item.predicted - (item.predicted * (1 - item.confidence) * 0.1),
      trend: item.trend,
      factors: item.factors
    }));
  };

  const chartData = formatChartData();
  const averagePrediction = chartData.reduce((sum, item) => sum + item.predicted, 0) / chartData.length;
  const averageConfidence = chartData.reduce((sum, item) => sum + item.confidence, 0) / chartData.length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Predicted: €{payload[0].value.toLocaleString()}
          </p>
          <p className="text-gray-600 text-sm">
            Confidence: {data.confidence.toFixed(1)}%
          </p>
          {data.factors && (
            <div className="text-xs text-gray-500 mt-1">
              Factors: {data.factors.join(', ')}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
            <span className="ml-3">Generating forecast...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {type === 'cashflow' ? 'Cash Flow' : type === 'income' ? 'Income' : 'Expense'} Forecast
            </CardTitle>
            <CardDescription>
              AI-powered {timeframe}-month financial predictions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getConfidenceColor(averageConfidence / 100)}>
              {averageConfidence.toFixed(1)}% avg confidence
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={scenario} onValueChange={(value: any) => setScenario(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="optimistic">Optimistic</SelectItem>
              <SelectItem value="pessimistic">Pessimistic</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfidence(!showConfidence)}
          >
            {showConfidence ? 'Hide' : 'Show'} Confidence Bands
          </Button>
        </div>

        {/* Scenario Description */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">
                {scenario.charAt(0).toUpperCase() + scenario.slice(1)} Scenario
              </div>
              <div className="text-sm text-blue-700">
                {getScenarioDescription(scenario)}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis 
                tickFormatter={(value) => `€${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {showConfidence && (
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stackId="1"
                  stroke="none"
                  fill="rgba(59, 130, 246, 0.1)"
                  name="Confidence Range"
                />
              )}
              
              {showConfidence && (
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stackId="1"
                  stroke="none"
                  fill="rgba(255, 255, 255, 1)"
                />
              )}
              
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Predicted Amount"
              />
              
              <ReferenceLine 
                y={averagePrediction} 
                stroke="#6b7280" 
                strokeDasharray="5 5"
                label="Average"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Forecast Range</div>
            <div className="font-medium">
              €{Math.min(...chartData.map(d => d.predicted)).toLocaleString()} - 
              €{Math.max(...chartData.map(d => d.predicted)).toLocaleString()}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Trend Direction</div>
            <div className="flex items-center gap-1">
              {getTrendIcon(forecastData[forecastData.length - 1]?.trend || 'stable')}
              <span className="font-medium capitalize">
                {forecastData[forecastData.length - 1]?.trend || 'stable'}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Model Accuracy</div>
            <div className="font-medium">
              {averageConfidence.toFixed(1)}% confidence
            </div>
          </div>
        </div>

        {/* Warning for low confidence */}
        {averageConfidence < 70 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <div className="text-sm">
              <span className="font-medium text-yellow-800">Lower confidence detected:</span>
              <span className="text-yellow-700 ml-1">
                Forecast accuracy may be affected by data volatility or insufficient historical patterns.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}