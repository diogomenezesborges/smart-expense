import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the export service
const mockExportService = {
  exportData: vi.fn(),
};

vi.mock('@/lib/services/export-service', () => ({
  exportService: mockExportService,
}));

import { GET, POST } from '../route';

describe('Export API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful export response
    mockExportService.exportData.mockResolvedValue({
      success: true,
      downloadUrl: 'mock-download-url',
      filename: 'finance_transactions_20240115.csv',
      metadata: {
        recordCount: 100,
        generatedAt: new Date('2024-01-15'),
        filters: {},
      },
    });
  });

  describe('POST /api/export', () => {
    it('should handle valid export request', async () => {
      const requestBody = {
        format: 'csv',
        type: 'transactions',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        categoryId: 'cat-food',
        includeMetadata: true,
      };

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        downloadUrl: 'mock-download-url',
        filename: 'finance_transactions_20240115.csv',
        metadata: expect.any(Object),
      });

      expect(mockExportService.exportData).toHaveBeenCalledWith({
        format: 'csv',
        type: 'transactions',
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-01-31'),
        categoryId: 'cat-food',
        includeMetadata: true,
      });
    });

    it('should handle minimal export request', async () => {
      const requestBody = {
        format: 'excel',
        type: 'analytics',
      };

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      expect(mockExportService.exportData).toHaveBeenCalledWith({
        format: 'excel',
        type: 'analytics',
        dateFrom: undefined,
        dateTo: undefined,
        categoryId: undefined,
        includeMetadata: true, // default value
      });
    });

    it('should handle export service failure', async () => {
      mockExportService.exportData.mockResolvedValue({
        success: false,
        error: 'Database connection failed',
      });

      const requestBody = {
        format: 'csv',
        type: 'transactions',
      };

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database connection failed');
    });

    it('should handle invalid request parameters', async () => {
      const requestBody = {
        format: 'invalid-format',
        type: 'transactions',
      };

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request parameters');
      expect(data.details).toBeDefined();
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should validate enum values correctly', async () => {
      const requestBody = {
        format: 'csv',
        type: 'invalid-type',
      };

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request parameters');
    });

    it('should handle missing required fields', async () => {
      const requestBody = {
        format: 'csv',
        // missing type field
      };

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request parameters');
    });
  });

  describe('GET /api/export', () => {
    it('should handle GET request with query parameters', async () => {
      const url = 'http://localhost:3000/api/export?format=excel&type=budget&dateFrom=2024-01-01&dateTo=2024-01-31&includeMetadata=true';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      expect(mockExportService.exportData).toHaveBeenCalledWith({
        format: 'excel',
        type: 'budget',
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-01-31'),
        categoryId: undefined,
        includeMetadata: true,
      });
    });

    it('should use default values for missing query parameters', async () => {
      const url = 'http://localhost:3000/api/export';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      expect(mockExportService.exportData).toHaveBeenCalledWith({
        format: 'csv', // default
        type: 'transactions', // default
        dateFrom: undefined,
        dateTo: undefined,
        categoryId: undefined,
        includeMetadata: false, // default for string 'false'
      });
    });

    it('should handle invalid query parameters', async () => {
      const url = 'http://localhost:3000/api/export?format=invalid&type=transactions';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request parameters');
    });

    it('should handle export service errors in GET request', async () => {
      mockExportService.exportData.mockRejectedValue(new Error('Unexpected error'));

      const url = 'http://localhost:3000/api/export?format=csv&type=transactions';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle boolean query parameter parsing', async () => {
      const url = 'http://localhost:3000/api/export?format=csv&type=transactions&includeMetadata=true';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockExportService.exportData).toHaveBeenCalledWith(
        expect.objectContaining({
          includeMetadata: true,
        })
      );
    });

    it('should handle date parameter parsing', async () => {
      const url = 'http://localhost:3000/api/export?format=csv&type=transactions&dateFrom=2024-01-15';
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(mockExportService.exportData).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: new Date('2024-01-15'),
        })
      );
    });
  });

  describe('format validation', () => {
    const validFormats = ['csv', 'excel', 'pdf'];
    const validTypes = ['transactions', 'analytics', 'budget', 'categories'];

    validFormats.forEach(format => {
      it(`should accept format: ${format}`, async () => {
        const requestBody = { format, type: 'transactions' };
        const request = new NextRequest('http://localhost:3000/api/export', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      });
    });

    validTypes.forEach(type => {
      it(`should accept type: ${type}`, async () => {
        const requestBody = { format: 'csv', type };
        const request = new NextRequest('http://localhost:3000/api/export', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      });
    });
  });

  describe('date handling', () => {
    it('should handle valid ISO date strings', async () => {
      const requestBody = {
        format: 'csv',
        type: 'transactions',
        dateFrom: '2024-01-01T00:00:00.000Z',
        dateTo: '2024-01-31T23:59:59.999Z',
      };

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      expect(mockExportService.exportData).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: new Date('2024-01-01T00:00:00.000Z'),
          dateTo: new Date('2024-01-31T23:59:59.999Z'),
        })
      );
    });

    it('should handle simple date strings', async () => {
      const requestBody = {
        format: 'csv',
        type: 'transactions',
        dateFrom: '2024-01-01',
      };

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      expect(mockExportService.exportData).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: new Date('2024-01-01'),
        })
      );
    });
  });
});