'use client';

import { useState } from 'react';

type TemplateType = 'transactions' | 'categories' | 'origins' | 'banks';

export default function BulkUploadPage() {
  const [selectedType, setSelectedType] = useState<TemplateType>('transactions');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  const templates = {
    transactions: { name: 'Transactions', icon: '💰' },
    categories: { name: 'Categories', icon: '📂' },
    origins: { name: 'Origins', icon: '👥' },
    banks: { name: 'Banks', icon: '🏦' }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`/api/bulk-upload/templates/${selectedType}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedType}_template.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download template');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);

      // Import directly
      const importResponse = await fetch('/api/bulk-upload/import', {
        method: 'POST',
        body: formData,
      });

      if (!importResponse.ok) {
        const errorResult = await importResponse.json();
        throw new Error(errorResult.details || errorResult.error || 'Import failed');
      }

      const result = await importResponse.json();
      setUploadResult(`✅ Successfully imported ${selectedType} records!`);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult(`❌ Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Bulk Data Upload</h1>
      <p className="text-gray-600 mb-8">
        Download a template, fill it with your data, and upload it back.
      </p>

      <div className="bg-white border rounded-lg p-6 space-y-6">
        {/* Step 1: Choose Type */}
        <div>
          <h2 className="text-lg font-semibold mb-3">1. Choose Data Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(templates).map(([type, info]) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as TemplateType)}
                className={`p-3 border rounded-lg text-center ${
                  selectedType === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="text-2xl mb-1">{info.icon}</div>
                <div className="text-sm font-medium">{info.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Download Template */}
        <div>
          <h2 className="text-lg font-semibold mb-3">2. Download Template</h2>
          <button
            onClick={handleDownloadTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Download {templates[selectedType].name} Template
          </button>
        </div>

        {/* Step 3: Upload File */}
        <div>
          <h2 className="text-lg font-semibold mb-3">3. Upload Your File</h2>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported: Excel files (.xlsx) • Max size: 10MB
          </p>
        </div>

        {/* Result */}
        {isUploading && (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Processing...</p>
          </div>
        )}

        {uploadResult && (
          <div className={`p-4 rounded-lg ${
            uploadResult.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {uploadResult}
            
          </div>
        )}
      </div>
    </div>
  );
}