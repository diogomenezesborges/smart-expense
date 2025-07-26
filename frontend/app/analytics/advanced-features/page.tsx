'use client';

import { useState } from 'react';
import { FeatureGate } from '@/components/feature/permissions/feature-gate';
import { ForecastChart } from '@/components/feature/analytics/forecast-chart';
import { ComparativeAnalysis } from '@/components/feature/analytics/comparative-analysis';
import { CustomMetrics } from '@/components/feature/analytics/custom-metrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Calculator,
  Download,
  Settings,
  Brain,
  Zap,
  Calendar,
  Users
} from 'lucide-react';

export default function AdvancedAnalyticsPage() {
  const [timeframe, setTimeframe] = useState('12months');
  const [activeTab, setActiveTab] = useState('forecasting');

  // Mock user ID - in real app, get from auth context
  const userId = '1';

  const handleExport = async () => {
    try {
      // In production, call AdvancedAnalyticsService.exportAnalytics
      console.log('Exporting analytics data...');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <FeatureGate feature="advanced_charts">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-600" />
              Advanced Analytics Suite
            </h1>
            <p className="text-muted-foreground">
              Predictive forecasting, comparative analysis, and custom metrics
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="12months">12 Months</SelectItem>
                <SelectItem value="24months">24 Months</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div className="text-sm font-medium">Predictive Models</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-xs text-muted-foreground">
                Active forecasting models
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <div className="text-sm font-medium">Accuracy Score</div>
              </div>
              <div className="text-2xl font-bold text-green-600">87%</div>
              <div className="text-xs text-muted-foreground">
                Model prediction accuracy
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <div className="text-sm font-medium">Peer Ranking</div>
              </div>
              <div className="text-2xl font-bold text-purple-600">78th</div>
              <div className="text-xs text-muted-foreground">
                Percentile vs peers
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-orange-600" />
                <div className="text-sm font-medium">Custom Metrics</div>
              </div>
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-xs text-muted-foreground">
                Tracking active KPIs
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="forecasting" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Forecasting
            </TabsTrigger>
            <TabsTrigger value="comparative" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Comparative
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Custom Metrics
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Forecasting Tab */}
          <TabsContent value="forecasting" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ForecastChart 
                userId={userId}
                type="cashflow"
              />
              <ForecastChart 
                userId={userId}
                type="expenses"
              />
            </div>
            
            <ForecastChart 
              userId={userId}
              type="income"
              className="col-span-full"
            />

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription>
                  Machine learning analysis of your financial patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Pattern Recognition</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">ML</Badge>
                        <span>Seasonal spending increase detected in Q4 (+18%)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">ML</Badge>
                        <span>Income growth correlation with skill development spending</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">ML</Badge>
                        <span>Weekend spending 34% above weekday average</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Predictive Alerts</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Badge variant="destructive" className="mt-0.5">High</Badge>
                        <span>Budget overage likely in "Entertainment" category</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="default" className="mt-0.5">Med</Badge>
                        <span>Goal achievement ahead of schedule by 2 months</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-0.5">Low</Badge>
                        <span>Subscription renewal spike expected next month</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparative Analysis Tab */}
          <TabsContent value="comparative" className="space-y-6">
            <ComparativeAnalysis userId={userId} />
          </TabsContent>

          {/* Custom Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <CustomMetrics userId={userId} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automated Reports</CardTitle>
                  <CardDescription>
                    Schedule and manage recurring financial reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Monthly Portfolio Review</div>
                        <div className="text-sm text-gray-600">Next: Feb 1, 2024</div>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Quarterly Tax Summary</div>
                        <div className="text-sm text-gray-600">Next: Mar 31, 2024</div>
                      </div>
                      <Badge variant="secondary">Scheduled</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Annual Financial Health</div>
                        <div className="text-sm text-gray-600">Next: Dec 31, 2024</div>
                      </div>
                      <Badge variant="outline">Draft</Badge>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    Create New Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>
                    Download your analytics in various formats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        PDF Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Excel Data
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        CSV Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        JSON API
                      </Button>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-900">Pro Tip</div>
                      <div className="text-sm text-blue-700">
                        Connect with your favorite financial tools using our REST API
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>
                  Professional financial analysis templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium">Investment Performance</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Portfolio analysis with benchmark comparisons
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline">Premium</Badge>
                      <Button size="sm" variant="ghost">Generate</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium">Tax Optimization</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Tax-loss harvesting and deduction opportunities
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline">Pro</Badge>
                      <Button size="sm" variant="ghost">Generate</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium">Retirement Readiness</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Long-term financial planning assessment
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline">Pro</Badge>
                      <Button size="sm" variant="ghost">Generate</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FeatureGate>
  );
}