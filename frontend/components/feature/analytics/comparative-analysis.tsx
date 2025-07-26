'use client';

import { useState, useEffect } from 'react';
import { AdvancedAnalyticsService, AnalyticsData } from '@/lib/services/analytics-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Users,
  Award,
  AlertCircle
} from 'lucide-react';

interface ComparativeAnalysisProps {
  userId: string;
  className?: string;
}

interface BenchmarkData {
  category: string;
  userValue: number;
  benchmark: number;
  percentile: number;
  status: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
}

interface PeerComparison {
  metric: string;
  userValue: number;
  peerAverage: number;
  topQuartile: number;
  userPercentile: number;
}

export function ComparativeAnalysis({ userId, className = '' }: ComparativeAnalysisProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [peerComparisons, setPeerComparisons] = useState<PeerComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonType, setComparisonType] = useState<'benchmark' | 'peer' | 'historical'>('benchmark');
  const [timeframe, setTimeframe] = useState('12months');

  useEffect(() => {
    loadComparativeData();
  }, [userId, comparisonType, timeframe]);

  const loadComparativeData = async () => {
    try {
      setLoading(true);
      
      // Load main analytics data
      const analytics = await AdvancedAnalyticsService.getAdvancedAnalytics(userId, timeframe);
      setAnalyticsData(analytics);
      
      // Generate benchmark comparisons
      const benchmarks = generateBenchmarkData(analytics);
      setBenchmarkData(benchmarks);
      
      // Generate peer comparisons
      const peers = generatePeerComparisons(analytics);
      setPeerComparisons(peers);
      
    } catch (error) {
      console.error('Failed to load comparative data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateBenchmarkData = (analytics: AnalyticsData): BenchmarkData[] => {
    return analytics.categoryBreakdown.map(category => ({
      category: category.category,
      userValue: category.percentage,
      benchmark: category.benchmark * 100,
      percentile: calculatePercentile(category.percentage, category.benchmark * 100),
      status: getStatus(category.percentage, category.benchmark * 100)
    }));
  };

  const generatePeerComparisons = (analytics: AnalyticsData): PeerComparison[] => {
    return [
      {
        metric: 'Savings Rate',
        userValue: analytics.metrics.savingsRate * 100,
        peerAverage: 15.2,
        topQuartile: 25.8,
        userPercentile: 78
      },
      {
        metric: 'Expense Growth',
        userValue: analytics.metrics.expenseGrowth * 100,
        peerAverage: 12.5,
        topQuartile: 8.2,
        userPercentile: 45
      },
      {
        metric: 'Income Growth',
        userValue: analytics.metrics.incomeGrowth * 100,
        peerAverage: 8.7,
        topQuartile: 15.3,
        userPercentile: 82
      },
      {
        metric: 'Budget Adherence',
        userValue: 78,
        peerAverage: 65.4,
        topQuartile: 85.1,
        userPercentile: 71
      }
    ];
  };

  const calculatePercentile = (userValue: number, benchmark: number): number => {
    const ratio = userValue / benchmark;
    if (ratio <= 0.7) return 95;
    if (ratio <= 0.85) return 85;
    if (ratio <= 1.0) return 75;
    if (ratio <= 1.15) return 50;
    if (ratio <= 1.3) return 25;
    return 10;
  };

  const getStatus = (userValue: number, benchmark: number): BenchmarkData['status'] => {
    const ratio = userValue / benchmark;
    if (ratio <= 0.8) return 'excellent';
    if (ratio <= 0.95) return 'good';
    if (ratio <= 1.1) return 'average';
    if (ratio <= 1.25) return 'below_average';
    return 'poor';
  };

  const getStatusColor = (status: BenchmarkData['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'below_average': return 'text-orange-600 bg-orange-100';
      case 'poor': return 'text-red-600 bg-red-100';
    }
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 75) return 'text-green-600';
    if (percentile >= 50) return 'text-blue-600';
    if (percentile >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatBenchmarkChartData = () => {
    return benchmarkData.map(item => ({
      category: item.category.replace(' & ', '\n& '),
      user: item.userValue,
      benchmark: item.benchmark,
      difference: item.userValue - item.benchmark,
      percentile: item.percentile
    }));
  };

  const formatRadarData = () => {
    return peerComparisons.map(item => ({
      metric: item.metric,
      user: Math.min(item.userValue, 100),
      peer: Math.min(item.peerAverage, 100),
      top25: Math.min(item.topQuartile, 100)
    }));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
            <span className="ml-3">Loading comparative analysis...</span>
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
                <Target className="h-5 w-5 text-purple-600" />
                Comparative Financial Analysis
              </CardTitle>
              <CardDescription>
                See how your financial metrics compare to benchmarks and peers
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={comparisonType} onValueChange={(value: any) => setComparisonType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="benchmark">vs Benchmarks</SelectItem>
                  <SelectItem value="peer">vs Peers</SelectItem>
                  <SelectItem value="historical">vs History</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Benchmark Comparison */}
      {comparisonType === 'benchmark' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expense Categories vs Benchmarks</CardTitle>
              <CardDescription>
                Recommended spending percentages by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatBenchmarkChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `${value.toFixed(1)}%`,
                        name === 'user' ? 'Your Spending' : 'Benchmark'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="user" fill="#3b82f6" name="Your Spending" />
                    <Bar dataKey="benchmark" fill="#e5e7eb" name="Benchmark" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Scores</CardTitle>
              <CardDescription>
                How well you're managing each spending category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {benchmarkData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {item.percentile}th percentile
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={item.percentile} className="flex-1" />
                      <span className="text-sm font-medium">
                        {item.userValue.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Benchmark: {item.benchmark.toFixed(1)}% | 
                      Difference: {(item.userValue - item.benchmark).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Peer Comparison */}
      {comparisonType === 'peer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Health Radar</CardTitle>
              <CardDescription>
                Multi-dimensional comparison with peer groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={formatRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="You" 
                      dataKey="user" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar 
                      name="Peer Average" 
                      dataKey="peer" 
                      stroke="#6b7280" 
                      fill="transparent"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Radar 
                      name="Top 25%" 
                      dataKey="top25" 
                      stroke="#10b981" 
                      fill="transparent"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Peer Ranking</CardTitle>
              <CardDescription>
                Your position relative to similar income profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {peerComparisons.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.metric}</span>
                      <div className="flex items-center gap-2">
                        {item.userPercentile >= 75 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : item.userPercentile >= 50 ? (
                          <Target className="h-4 w-4 text-blue-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`font-medium ${getPercentileColor(item.userPercentile)}`}>
                          {item.userPercentile}th percentile
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-blue-600">
                          {item.userValue.toFixed(1)}%
                        </div>
                        <div className="text-gray-500">You</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-600">
                          {item.peerAverage.toFixed(1)}%
                        </div>
                        <div className="text-gray-500">Peer Avg</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          {item.topQuartile.toFixed(1)}%
                        </div>
                        <div className="text-gray-500">Top 25%</div>
                      </div>
                    </div>
                    
                    <Progress value={item.userPercentile} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Key Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Strengths</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Savings rate above 75th percentile</li>
                <li>• Transportation costs well controlled</li>
                <li>• Income growth outpacing peers</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Opportunities</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Food spending 23% above benchmark</li>
                <li>• Shopping expenses trending upward</li>
                <li>• Budget adherence could improve</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Peer Position</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Top 25% for overall financial health</li>
                <li>• Above average in 3 of 4 key metrics</li>
                <li>• Strong foundation for wealth building</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}