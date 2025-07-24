'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Calendar,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Target,
  Tags
} from 'lucide-react';

interface ExportRequest {
  format: 'csv' | 'excel' | 'pdf';
  type: 'transactions' | 'analytics' | 'budget' | 'categories';
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
  includeMetadata: boolean;
}

interface ExportHistory {
  id: string;
  filename: string;
  format: string;
  type: string;
  createdAt: Date;
  downloadUrl: string;
  recordCount: number;
  status: 'completed' | 'failed' | 'processing';
}

export default function ExportPage() {
  const [exportRequest, setExportRequest] = useState<ExportRequest>({
    format: 'csv',
    type: 'transactions',
    includeMetadata: true,
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const exportPresets = [
    {
      id: 'monthly-transactions',
      name: 'Monthly Transactions',
      description: 'Export all transactions from the current month',
      config: {
        type: 'transactions' as const,
        format: 'excel' as const,
        dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
      }
    },
    {
      id: 'yearly-analytics',
      name: 'Yearly Analytics Report',
      description: 'Comprehensive analytics for the current year',
      config: {
        type: 'analytics' as const,
        format: 'pdf' as const,
        dateFrom: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
      }
    },
    {
      id: 'budget-performance',
      name: 'Budget Performance',
      description: 'Current month budget vs actual spending',
      config: {
        type: 'budget' as const,
        format: 'excel' as const,
        dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
      }
    },
    {
      id: 'category-master',
      name: 'Category Master List',
      description: 'Complete list of all categories and subcategories',
      config: {
        type: 'categories' as const,
        format: 'csv' as const,
      }
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportRequest),
      });

      const result = await response.json();

      if (result.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.data.downloadUrl;
        link.download = result.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Add to history
        const newExport: ExportHistory = {
          id: Date.now().toString(),
          filename: result.data.filename,
          format: exportRequest.format,
          type: exportRequest.type,
          createdAt: new Date(),
          downloadUrl: result.data.downloadUrl,
          recordCount: result.data.metadata?.recordCount || 0,
          status: 'completed',
        };

        setExportHistory(prev => [newExport, ...prev]);
      } else {
        console.error('Export failed:', result.error);
        alert('Export failed: ' + result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + error);
    } finally {
      setIsExporting(false);
    }
  };

  const applyPreset = (presetId: string) => {
    const preset = exportPresets.find(p => p.id === presetId);
    if (preset) {
      setExportRequest(prev => ({
        ...prev,
        ...preset.config,
      }));
      setSelectedPreset(presetId);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transactions': return <BarChart3 className="h-4 w-4" />;
      case 'analytics': return <TrendingUp className="h-4 w-4" />;
      case 'budget': return <Target className="h-4 w-4" />;
      case 'categories': return <Tags className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'excel': return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'pdf': return <FileText className="h-4 w-4 text-red-600" />;
      case 'csv': return <FileText className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Export</h1>
          <p className="text-muted-foreground mt-1">Export your financial data in various formats</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Export Center
        </Badge>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="presets">Quick Presets</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Export Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Export Configuration
                </CardTitle>
                <CardDescription>
                  Configure your data export settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="export-type">Data Type</Label>
                    <Select value={exportRequest.type} onValueChange={(value: any) => 
                      setExportRequest(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transactions">
                          <div className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Transactions
                          </div>
                        </SelectItem>
                        <SelectItem value="analytics">
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Analytics Report
                          </div>
                        </SelectItem>
                        <SelectItem value="budget">
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-2" />
                            Budget Performance
                          </div>
                        </SelectItem>
                        <SelectItem value="categories">
                          <div className="flex items-center">
                            <Tags className="h-4 w-4 mr-2" />
                            Categories
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="export-format">Format</Label>
                    <Select value={exportRequest.format} onValueChange={(value: any) => 
                      setExportRequest(prev => ({ ...prev, format: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            CSV
                          </div>
                        </SelectItem>
                        <SelectItem value="excel">
                          <div className="flex items-center">
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                            Excel (XLSX)
                          </div>
                        </SelectItem>
                        <SelectItem value="pdf">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-red-600" />
                            PDF Report
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="date-from">From Date</Label>
                    <Input
                      type="date"
                      value={exportRequest.dateFrom || ''}
                      onChange={(e) => setExportRequest(prev => ({
                        ...prev,
                        dateFrom: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-to">To Date</Label>
                    <Input
                      type="date"
                      value={exportRequest.dateTo || ''}
                      onChange={(e) => setExportRequest(prev => ({
                        ...prev,
                        dateTo: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-metadata"
                    checked={exportRequest.includeMetadata}
                    onCheckedChange={(checked) => setExportRequest(prev => ({
                      ...prev,
                      includeMetadata: checked as boolean
                    }))}
                  />
                  <Label htmlFor="include-metadata" className="text-sm">
                    Include metadata and generation info
                  </Label>
                </div>

                <Button 
                  onClick={handleExport} 
                  disabled={isExporting} 
                  size="lg" 
                  className="w-full"
                >
                  {isExporting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Export Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Export Preview</CardTitle>
                <CardDescription>
                  Preview of what will be exported
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(exportRequest.type)}
                    <div>
                      <div className="font-medium capitalize">{exportRequest.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {exportRequest.type === 'transactions' && 'Individual transaction records'}
                        {exportRequest.type === 'analytics' && 'Summary statistics and insights'}
                        {exportRequest.type === 'budget' && 'Budget vs actual performance'}
                        {exportRequest.type === 'categories' && 'Category master data'}
                      </div>
                    </div>
                  </div>
                  {getFormatIcon(exportRequest.format)}
                </div>

                {(exportRequest.dateFrom || exportRequest.dateTo) && (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div className="text-sm">
                      <span className="font-medium">Date Range: </span>
                      {exportRequest.dateFrom || 'Start'} → {exportRequest.dateTo || 'End'}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-sm font-medium">Export will include:</div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {exportRequest.type === 'transactions' && (
                      <>
                        <li>• Transaction details and amounts</li>
                        <li>• Category and subcategory info</li>
                        <li>• Merchant and bank information</li>
                        <li>• Validation and AI generation flags</li>
                      </>
                    )}
                    {exportRequest.type === 'analytics' && (
                      <>
                        <li>• Summary statistics</li>
                        <li>• Monthly breakdown</li>
                        <li>• Category analysis</li>
                        <li>• Trends and insights</li>
                      </>
                    )}
                    {exportRequest.type === 'budget' && (
                      <>
                        <li>• Budgeted vs actual amounts</li>
                        <li>• Variance calculations</li>
                        <li>• Category performance</li>
                        <li>• Budget utilization rates</li>
                      </>
                    )}
                    {exportRequest.type === 'categories' && (
                      <>
                        <li>• Category hierarchy</li>
                        <li>• Flow types (income/expense)</li>
                        <li>• Category creation dates</li>
                        <li>• Complete master list</li>
                      </>
                    )}
                    {exportRequest.includeMetadata && (
                      <li>• Export metadata and timestamps</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="presets" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {exportPresets.map((preset) => (
              <Card key={preset.id} className={`cursor-pointer transition-colors ${
                selectedPreset === preset.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{preset.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(preset.config.type)}
                      {getFormatIcon(preset.config.format)}
                    </div>
                  </div>
                  <CardDescription>{preset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="capitalize">{preset.config.type}</span>
                      <span>•</span>
                      <span className="uppercase">{preset.config.format}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant={selectedPreset === preset.id ? "default" : "outline"}
                      onClick={() => applyPreset(preset.id)}
                    >
                      {selectedPreset === preset.id ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>
                Your recent data exports and downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exportHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No exports yet. Create your first export above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exportHistory.map((export_item) => (
                    <div key={export_item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(export_item.status)}
                          {getFormatIcon(export_item.format)}
                        </div>
                        <div>
                          <div className="font-medium">{export_item.filename}</div>
                          <div className="text-sm text-muted-foreground">
                            {export_item.recordCount.toLocaleString()} records • {export_item.createdAt.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {export_item.type}
                        </Badge>
                        {export_item.status === 'completed' && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={export_item.downloadUrl} download={export_item.filename}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}