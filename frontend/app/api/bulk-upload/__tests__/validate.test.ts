import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../validate/route';
import { BulkUploadService } from '@/lib/services/bulk-upload-service';

// Mock dependencies
vi.mock('@/lib/services/bulk-upload-service', () => ({
  BulkUploadService: {
    parseAndValidate: vi.fn(),
    generateErrorReport: vi.fn(),
    getErrorReportFilename: vi.fn()
  }
}));

vi.mock('@/lib/utils/logger', () => ({
  logApiRequest: vi.fn(),
  logError: vi.fn()
}));

describe('Bulk Upload Validation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/bulk-upload/validate', () => {
    const createMockFile = (
      name = 'test.xlsx',
      type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size = 1024
    ) => {
      const file = new File(['test content'], name, { type });
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    const createFormData = (file: File, type = 'transactions') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      return formData;
    };

    it('should validate file successfully', async () => {
      const mockFile = createMockFile();
      const formData = createFormData(mockFile);
      
      const mockValidationResult = {
        isValid: true,
        data: [
          { Date: '2024-01-15', Origin: 'John', Amount: 1000 },
          { Date: '2024-01-16', Origin: 'Jane', Amount: 500 }
        ],
        errors: []
      };

      vi.mocked(BulkUploadService.parseAndValidate).mockResolvedValue(mockValidationResult);

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.isValid).toBe(true);
      expect(data.totalRecords).toBe(2);
      expect(data.errorCount).toBe(0);
      expect(data.preview).toHaveLength(2);
      expect(data.message).toContain('2 records ready for import');
    });

    it('should handle validation errors and return error report', async () => {
      const mockFile = createMockFile();
      const formData = createFormData(mockFile);
      
      const mockErrors = [
        {
          row: 2,
          column: 'Date',
          value: 'invalid-date',
          error: 'Invalid date format',
          suggestion: 'Use YYYY-MM-DD format'
        },
        {
          row: 3,
          column: 'Amount',
          value: 'abc',
          error: 'Invalid amount',
          suggestion: 'Enter a numeric value'
        }
      ];

      const mockValidationResult = {
        isValid: false,
        data: [{ Date: 'invalid-date' }, { Amount: 'abc' }],
        errors: mockErrors
      };

      const mockErrorReport = new Uint8Array([1, 2, 3, 4]);
      const mockErrorFilename = 'test_errors_2024-01-15.xlsx';

      vi.mocked(BulkUploadService.parseAndValidate).mockResolvedValue(mockValidationResult);
      vi.mocked(BulkUploadService.generateErrorReport).mockReturnValue(mockErrorReport);
      vi.mocked(BulkUploadService.getErrorReportFilename).mockReturnValue(mockErrorFilename);

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.isValid).toBe(false);
      expect(data.totalRecords).toBe(2);
      expect(data.errorCount).toBe(2);
      expect(data.errors).toHaveLength(2);
      expect(data.hasMoreErrors).toBe(false);
      expect(data.errorReport.filename).toBe(mockErrorFilename);
      expect(data.errorReport.buffer).toEqual([1, 2, 3, 4]);
    });

    it('should limit error preview to first 10 errors', async () => {
      const mockFile = createMockFile();
      const formData = createFormData(mockFile);
      
      const mockErrors = Array.from({ length: 15 }, (_, i) => ({
        row: i + 2,
        column: 'Date',
        value: 'invalid',
        error: `Error ${i + 1}`
      }));

      const mockValidationResult = {
        isValid: false,
        data: Array.from({ length: 15 }, () => ({ Date: 'invalid' })),
        errors: mockErrors
      };

      vi.mocked(BulkUploadService.parseAndValidate).mockResolvedValue(mockValidationResult);
      vi.mocked(BulkUploadService.generateErrorReport).mockReturnValue(new Uint8Array([1]));
      vi.mocked(BulkUploadService.getErrorReportFilename).mockReturnValue('errors.xlsx');

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.errors).toHaveLength(10);
      expect(data.hasMoreErrors).toBe(true);
      expect(data.errorCount).toBe(15);
    });

    it('should limit preview to first 5 records for valid files', async () => {
      const mockFile = createMockFile();
      const formData = createFormData(mockFile);
      
      const mockData = Array.from({ length: 100 }, (_, i) => ({
        Date: `2024-01-${i + 1}`,
        Origin: 'John',
        Amount: 1000 + i
      }));

      const mockValidationResult = {
        isValid: true,
        data: mockData,
        errors: []
      };

      vi.mocked(BulkUploadService.parseAndValidate).mockResolvedValue(mockValidationResult);

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.preview).toHaveLength(5);
      expect(data.totalRecords).toBe(100);
    });

    it('should return 400 for missing file', async () => {
      const formData = new FormData();
      formData.append('type', 'transactions');

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('No file provided');
    });

    it('should return 400 for missing type', async () => {
      const mockFile = createMockFile();
      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Template type is required');
    });

    it('should validate file types', async () => {
      const invalidFile = createMockFile('test.txt', 'text/plain');
      const formData = createFormData(invalidFile);

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid file type');
      expect(data.error).toContain('Excel (.xlsx) or CSV files only');
    });

    it('should accept valid file types', async () => {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ];

      for (const type of validTypes) {
        const mockFile = createMockFile('test.file', type);
        const formData = createFormData(mockFile);

        vi.mocked(BulkUploadService.parseAndValidate).mockResolvedValue({
          isValid: true,
          data: [],
          errors: []
        });

        const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
          method: 'POST',
          body: formData
        });

        const response = await POST(request);
        
        expect(response.status).toBe(200);
      }
    });

    it('should validate file size limit', async () => {
      const largeFile = createMockFile('large.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 11 * 1024 * 1024); // 11MB
      const formData = createFormData(largeFile);

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('File size exceeds 10MB limit');
    });

    it('should accept files under size limit', async () => {
      const validFile = createMockFile('valid.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 5 * 1024 * 1024); // 5MB
      const formData = createFormData(validFile);

      vi.mocked(BulkUploadService.parseAndValidate).mockResolvedValue({
        isValid: true,
        data: [],
        errors: []
      });

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle service parsing errors', async () => {
      const mockFile = createMockFile();
      const formData = createFormData(mockFile);

      vi.mocked(BulkUploadService.parseAndValidate).mockRejectedValue(
        new Error('Failed to parse file')
      );

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to validate file. Please check the file format and try again.');
    });

    it('should handle all template types', async () => {
      const validTypes = ['transactions', 'categories', 'origins', 'banks'];

      for (const type of validTypes) {
        const mockFile = createMockFile();
        const formData = createFormData(mockFile, type);

        vi.mocked(BulkUploadService.parseAndValidate).mockResolvedValue({
          isValid: true,
          data: [],
          errors: []
        });

        const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
          method: 'POST',
          body: formData
        });

        const response = await POST(request);
        
        expect(response.status).toBe(200);
        expect(BulkUploadService.parseAndValidate).toHaveBeenCalledWith(mockFile, type);
      }
    });

    it('should handle FormData parsing errors', async () => {
      // Create a request with invalid FormData
      const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
        method: 'POST',
        body: 'invalid-form-data'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to validate file. Please check the file format and try again.');
    });

    it('should handle empty validation results', async () => {
      const mockFile = createMockFile();
      const formData = createFormData(mockFile);

      vi.mocked(BulkUploadService.parseAndValidate).mockResolvedValue({
        isValid: true,
        data: [],
        errors: []
      });

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.totalRecords).toBe(0);
      expect(data.preview).toEqual([]);
      expect(data.message).toContain('0 records ready for import');
    });

    it('should preserve error order in response', async () => {
      const mockFile = createMockFile();
      const formData = createFormData(mockFile);
      
      const mockErrors = [
        { row: 2, column: 'A', value: 'x', error: 'Error A' },
        { row: 3, column: 'B', value: 'y', error: 'Error B' },
        { row: 4, column: 'C', value: 'z', error: 'Error C' }
      ];

      vi.mocked(BulkUploadService.parseAndValidate).mockResolvedValue({
        isValid: false,
        data: [],
        errors: mockErrors
      });

      vi.mocked(BulkUploadService.generateErrorReport).mockReturnValue(new Uint8Array([1]));
      vi.mocked(BulkUploadService.getErrorReportFilename).mockReturnValue('errors.xlsx');

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/validate', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.errors).toHaveLength(3);
      expect(data.errors[0].error).toBe('Error A');
      expect(data.errors[1].error).toBe('Error B');
      expect(data.errors[2].error).toBe('Error C');
    });
  });
});