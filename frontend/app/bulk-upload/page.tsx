'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  RotateCcw,
  Eye,
  FileX
} from 'lucide-react';

type TemplateType = 'transactions' | 'categories' | 'origins' | 'banks';
type UploadStep = 'select' | 'upload' | 'validate' | 'preview' | 'import' | 'complete';

interface ValidationError {
  row: number;
  column: string;
  value: any;
  error: string;
  suggestion?: string;
}

interface ImportJob {
  id: string;
  filename: string;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  errorReport?: ValidationError[];
}

export default function BulkUploadPage() {
  const [currentStep, setCurrentStep] = useState<UploadStep>('select');
  const [selectedType, setSelectedType] = useState<TemplateType>('transactions');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [importJob, setImportJob] = useState<ImportJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const templateInfo = {
    transactions: {
      title: 'Transactions',
      description: 'Import your financial transactions with dates, amounts, categories, and descriptions',
      columns: ['Date', 'Origin', 'Bank', 'Flow', 'Category', 'Amount', 'Description'],
      example: 'salary payments, grocery expenses, rent, utilities'
    },
    categories: {
      title: 'Categories',
      description: 'Define your transaction categories and subcategories',
      columns: ['Flow', 'Major Category', 'Category', 'Sub Category'],
      example: 'Food & Dining > Groceries, Housing > Rent'
    },
    origins: {
      title: 'Origins',
      description: 'Define who made the transactions (family members, accounts)',
      columns: ['Name'],
      example: 'John, Jane, Joint Account, Family Fund'
    },
    banks: {
      title: 'Banks',
      description: 'List of financial institutions for your accounts',
      columns: ['Name'],
      example: 'Chase Bank, Wells Fargo, Credit Union'
    }
  };

  const downloadTemplate = async (type: TemplateType) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/bulk-upload/templates/${type}`);
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_template_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload an Excel (.xlsx) or CSV file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setCurrentStep('validate');
    validateFile(file);
  };

  const validateFile = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);

      const response = await fetch('/api/bulk-upload/validate', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      setValidationResult(result);

      if (result.isValid) {
        setCurrentStep('preview');
      } else {
        setCurrentStep('validate');
      }
    } catch (error) {
      setError('Failed to validate file');
    } finally {
      setIsLoading(false);
    }
  };

  const startImport = async () => {
    if (!uploadedFile) return;

    try {
      setIsLoading(true);
      setCurrentStep('import');

      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('type', selectedType);

      const response = await fetch('/api/bulk-upload/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        // Start polling for job status
        pollJobStatus(result.jobId);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to start import');
    } finally {
      setIsLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/bulk-upload/import?jobId=${jobId}`);
        const result = await response.json();
        
        if (result.success) {
          setImportJob(result.job);
          
          if (result.job.status === 'completed') {
            setCurrentStep('complete');
          } else if (result.job.status === 'failed') {
            setError('Import failed. Please check the error report.');
          } else {
            // Continue polling
            setTimeout(poll, 2000);
          }
        }
      } catch (error) {
        setError('Failed to check import status');
      }
    };

    poll();
  };

  const downloadErrorReport = () => {
    if (!validationResult?.errorReport) return;

    const buffer = new Uint8Array(validationResult.errorReport.buffer);
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = validationResult.errorReport.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setCurrentStep('select');
    setUploadedFile(null);
    setValidationResult(null);
    setImportJob(null);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bulk Data Upload</h1>
        <p className="text-gray-600">
          Import your existing financial data using Excel templates. Perfect for migrating from other applications.
        </p>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={currentStep === 'select' ? 'templates' : 'upload'} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">1. Download Template</TabsTrigger>
          <TabsTrigger value="upload" disabled={currentStep === 'select'}>
            2. Upload Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose Template Type</CardTitle>
              <CardDescription>
                Select the type of data you want to import and download the corresponding template.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(templateInfo).map(([type, info]) => (
                  <Card 
                    key={type}
                    className={`cursor-pointer transition-colors ${
                      selectedType === type ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedType(type as TemplateType)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{info.title}</h3>
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                      <div className="text-xs text-gray-500">
                        <strong>Columns:</strong> {info.columns.join(', ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <strong>Examples:</strong> {info.example}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => downloadTemplate(selectedType)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download {templateInfo[selectedType].title} Template
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep('upload')}
                >
                  Skip to Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          {currentStep === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Data</CardTitle>
                <CardDescription>
                  Upload your completed {templateInfo[selectedType].title.toLowerCase()} template file.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={selectedType} onValueChange={(value: TemplateType) => setSelectedType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(templateInfo).map(([type, info]) => (
                        <SelectItem key={type} value={type}>
                          {info.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">Drop your file here or click to browse</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports Excel (.xlsx) and CSV files up to 10MB
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                </div>

                {uploadedFile && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileSpreadsheet className="h-5 w-5 mr-2 text-green-600" />
                        <span className="font-medium">{uploadedFile.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                        <FileX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 'validate' && validationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {validationResult.isValid ? (
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                  )}
                  Validation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {validationResult.totalRecords}
                    </div>
                    <div className="text-sm text-gray-600">Total Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {validationResult.totalRecords - validationResult.errorCount}
                    </div>
                    <div className="text-sm text-gray-600">Valid Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {validationResult.errorCount}
                    </div>
                    <div className="text-sm text-gray-600">Errors</div>
                  </div>
                </div>

                {!validationResult.isValid && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your file contains {validationResult.errorCount} error(s). 
                        Please fix these issues and upload again.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <h4 className="font-medium">Sample Errors:</h4>
                      {validationResult.errors?.slice(0, 5).map((error: ValidationError, index: number) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                          <strong>Row {error.row}, Column "{error.column}":</strong> {error.error}
                          {error.suggestion && (
                            <div className="text-gray-600 mt-1">
                              <strong>Suggestion:</strong> {error.suggestion}
                            </div>
                          )}
                        </div>
                      ))}
                      {validationResult.hasMoreErrors && (
                        <p className="text-sm text-gray-600">
                          And {validationResult.errorCount - 5} more errors...
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={downloadErrorReport} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Error Report
                      </Button>
                      <Button onClick={resetUpload} variant="outline">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Upload New File
                      </Button>
                    </div>
                  </div>
                )}

                {validationResult.isValid && (
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Great! Your file passed validation. {validationResult.totalRecords} records are ready to import.
                      </AlertDescription>
                    </Alert>

                    <Button onClick={() => setCurrentStep('preview')} className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 'preview' && validationResult?.preview && (
            <Card>
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  Review the first few records before importing. 
                  Showing {validationResult.preview.length} of {validationResult.totalRecords} records.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(validationResult.preview[0] || {}).map(key => (
                          <th key={key} className="px-4 py-2 text-left text-sm font-medium border-b">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.preview.map((row: any, index: number) => (
                        <tr key={index} className="border-b">
                          {Object.values(row).map((value: any, cellIndex: number) => (
                            <td key={cellIndex} className="px-4 py-2 text-sm">
                              {value?.toString() || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2">
                  <Button onClick={startImport} disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Start Import
                  </Button>
                  <Button onClick={resetUpload} variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'import' && importJob && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Importing Data
                </CardTitle>
                <CardDescription>
                  Processing {importJob.filename}...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={importJob.progress} className="w-full" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {importJob.totalRecords}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {importJob.processedRecords}
                      </div>
                      <div className="text-sm text-gray-600">Processed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {importJob.failedRecords}
                      </div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    {Math.round(importJob.progress)}% complete
                    {importJob.status === 'processing' && (
                      <span className="ml-2">• Processing...</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'complete' && importJob && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Import Complete
                </CardTitle>
                <CardDescription>
                  Your data has been successfully imported!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {importJob.processedRecords}
                    </div>
                    <div className="text-sm text-gray-600">Records Imported</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {importJob.failedRecords}
                    </div>
                    <div className="text-sm text-gray-600">Failed Records</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => window.location.href = '/dashboard'} className="flex-1">
                    View Dashboard
                  </Button>
                  <Button onClick={resetUpload} variant="outline">
                    Import More Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}