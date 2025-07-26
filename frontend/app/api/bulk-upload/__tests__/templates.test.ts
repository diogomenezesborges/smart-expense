import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../templates/[type]/route';
import { BulkUploadService } from '@/lib/services/bulk-upload-service';

// Mock the BulkUploadService
vi.mock('@/lib/services/bulk-upload-service', () => ({
  BulkUploadService: {
    generateTemplate: vi.fn(),
    getTemplateFilename: vi.fn()
  }
}));

describe('Bulk Upload Templates API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/bulk-upload/templates/[type]', () => {
    it('should generate and return transactions template', async () => {
      const mockBuffer = new Uint8Array([1, 2, 3, 4]);
      const mockFilename = 'transactions_template_2024-01-15.xlsx';

      vi.mocked(BulkUploadService.generateTemplate).mockReturnValue(mockBuffer);
      vi.mocked(BulkUploadService.getTemplateFilename).mockReturnValue(mockFilename);

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/transactions');
      const response = await GET(request, { params: { type: 'transactions' } });

      expect(response.status).toBe(200);
      expect(BulkUploadService.generateTemplate).toHaveBeenCalledWith('transactions');
      expect(BulkUploadService.getTemplateFilename).toHaveBeenCalledWith('transactions');

      // Check headers
      expect(response.headers.get('Content-Type')).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(response.headers.get('Content-Disposition')).toBe(
        `attachment; filename="${mockFilename}"`
      );
      expect(response.headers.get('Content-Length')).toBe('4');
    });

    it('should generate and return categories template', async () => {
      const mockBuffer = new Uint8Array([5, 6, 7, 8]);
      const mockFilename = 'categories_template_2024-01-15.xlsx';

      vi.mocked(BulkUploadService.generateTemplate).mockReturnValue(mockBuffer);
      vi.mocked(BulkUploadService.getTemplateFilename).mockReturnValue(mockFilename);

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/categories');
      const response = await GET(request, { params: { type: 'categories' } });

      expect(response.status).toBe(200);
      expect(BulkUploadService.generateTemplate).toHaveBeenCalledWith('categories');
      expect(BulkUploadService.getTemplateFilename).toHaveBeenCalledWith('categories');
    });

    it('should generate and return origins template', async () => {
      const mockBuffer = new Uint8Array([9, 10, 11, 12]);
      const mockFilename = 'origins_template_2024-01-15.xlsx';

      vi.mocked(BulkUploadService.generateTemplate).mockReturnValue(mockBuffer);
      vi.mocked(BulkUploadService.getTemplateFilename).mockReturnValue(mockFilename);

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/origins');
      const response = await GET(request, { params: { type: 'origins' } });

      expect(response.status).toBe(200);
      expect(BulkUploadService.generateTemplate).toHaveBeenCalledWith('origins');
      expect(BulkUploadService.getTemplateFilename).toHaveBeenCalledWith('origins');
    });

    it('should generate and return banks template', async () => {
      const mockBuffer = new Uint8Array([13, 14, 15, 16]);
      const mockFilename = 'banks_template_2024-01-15.xlsx';

      vi.mocked(BulkUploadService.generateTemplate).mockReturnValue(mockBuffer);
      vi.mocked(BulkUploadService.getTemplateFilename).mockReturnValue(mockFilename);

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/banks');
      const response = await GET(request, { params: { type: 'banks' } });

      expect(response.status).toBe(200);
      expect(BulkUploadService.generateTemplate).toHaveBeenCalledWith('banks');
      expect(BulkUploadService.getTemplateFilename).toHaveBeenCalledWith('banks');
    });

    it('should return 400 for invalid template type', async () => {
      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/invalid');
      const response = await GET(request, { params: { type: 'invalid' } });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid template type');
      expect(data.error).toContain('transactions, categories, origins, banks');
    });

    it('should handle template generation errors', async () => {
      vi.mocked(BulkUploadService.generateTemplate).mockImplementation(() => {
        throw new Error('Template generation failed');
      });

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/transactions');
      const response = await GET(request, { params: { type: 'transactions' } });

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to generate template');
    });

    it('should handle service method errors gracefully', async () => {
      vi.mocked(BulkUploadService.generateTemplate).mockReturnValue(new Uint8Array([1, 2, 3]));
      vi.mocked(BulkUploadService.getTemplateFilename).mockImplementation(() => {
        throw new Error('Filename generation failed');
      });

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/transactions');
      const response = await GET(request, { params: { type: 'transactions' } });

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to generate template');
    });

    it('should validate all allowed template types', async () => {
      const validTypes = ['transactions', 'categories', 'origins', 'banks'];
      
      for (const type of validTypes) {
        vi.mocked(BulkUploadService.generateTemplate).mockReturnValue(new Uint8Array([1]));
        vi.mocked(BulkUploadService.getTemplateFilename).mockReturnValue(`${type}_template.xlsx`);

        const request = new NextRequest(`http://localhost:3000/api/bulk-upload/templates/${type}`);
        const response = await GET(request, { params: { type } });

        expect(response.status).toBe(200);
        expect(BulkUploadService.generateTemplate).toHaveBeenCalledWith(type);
      }
    });

    it('should return proper content headers for Excel files', async () => {
      const mockBuffer = new Uint8Array([1, 2, 3, 4, 5]);
      vi.mocked(BulkUploadService.generateTemplate).mockReturnValue(mockBuffer);
      vi.mocked(BulkUploadService.getTemplateFilename).mockReturnValue('test.xlsx');

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/transactions');
      const response = await GET(request, { params: { type: 'transactions' } });

      expect(response.headers.get('Content-Type')).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(response.headers.get('Content-Disposition')).toBe(
        'attachment; filename="test.xlsx"'
      );
      expect(response.headers.get('Content-Length')).toBe('5');
    });

    it('should handle empty buffer from service', async () => {
      const emptyBuffer = new Uint8Array([]);
      vi.mocked(BulkUploadService.generateTemplate).mockReturnValue(emptyBuffer);
      vi.mocked(BulkUploadService.getTemplateFilename).mockReturnValue('empty.xlsx');

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/transactions');
      const response = await GET(request, { params: { type: 'transactions' } });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Length')).toBe('0');
    });
  });

  describe('Error handling', () => {
    it('should log errors properly', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(BulkUploadService.generateTemplate).mockImplementation(() => {
        throw new Error('Service error');
      });

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/transactions');
      await GET(request, { params: { type: 'transactions' } });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Template generation error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle undefined params', async () => {
      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/');
      const response = await GET(request, { params: { type: undefined as any } });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid template type');
    });

    it('should handle null params', async () => {
      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/');
      const response = await GET(request, { params: { type: null as any } });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid template type');
    });
  });

  describe('Performance', () => {
    it('should handle large template generation efficiently', async () => {
      const largeBuffer = new Uint8Array(1024 * 1024); // 1MB buffer
      largeBuffer.fill(65); // Fill with 'A' characters

      vi.mocked(BulkUploadService.generateTemplate).mockReturnValue(largeBuffer);
      vi.mocked(BulkUploadService.getTemplateFilename).mockReturnValue('large_template.xlsx');

      const startTime = Date.now();
      
      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/transactions');
      const response = await GET(request, { params: { type: 'transactions' } });
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Length')).toBe('1048576');
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should call service methods only once per request', async () => {
      vi.mocked(BulkUploadService.generateTemplate).mockReturnValue(new Uint8Array([1]));
      vi.mocked(BulkUploadService.getTemplateFilename).mockReturnValue('test.xlsx');

      const request = new NextRequest('http://localhost:3000/api/bulk-upload/templates/transactions');
      await GET(request, { params: { type: 'transactions' } });

      expect(BulkUploadService.generateTemplate).toHaveBeenCalledTimes(1);
      expect(BulkUploadService.getTemplateFilename).toHaveBeenCalledTimes(1);
    });
  });
});