import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BulkUploadService } from '../bulk-upload-service';
import * as XLSX from 'xlsx';

// Mock XLSX
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    json_to_sheet: vi.fn(() => ({ '!cols': [] })),
    book_append_sheet: vi.fn(),
    sheet_to_json: vi.fn(),
    aoa_to_sheet: vi.fn(() => ({})),
    sheet_add_aoa: vi.fn()
  },
  write: vi.fn(() => new Uint8Array([1, 2, 3, 4])),
  read: vi.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {}
    }
  }))
}));

describe('BulkUploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateTemplate', () => {
    it('should generate transactions template successfully', () => {
      const result = BulkUploadService.generateTemplate('transactions');
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(2); // Main sheet + validation sheet
      expect(XLSX.write).toHaveBeenCalledWith(
        expect.any(Object),
        { bookType: 'xlsx', type: 'array' }
      );
    });

    it('should generate categories template successfully', () => {
      const result = BulkUploadService.generateTemplate('categories');
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(1);
    });

    it('should generate origins template successfully', () => {
      const result = BulkUploadService.generateTemplate('origins');
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(1);
    });

    it('should generate banks template successfully', () => {
      const result = BulkUploadService.generateTemplate('banks');
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(1);
    });

    it('should throw error for unknown template type', () => {
      expect(() => {
        BulkUploadService.generateTemplate('unknown' as any);
      }).toThrow('Unknown template type: unknown');
    });
  });

  describe('parseAndValidate', () => {
    let mockFile: File;

    beforeEach(() => {
      mockFile = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Mock file.arrayBuffer()
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(
        new ArrayBuffer(8)
      );
    });

    it('should validate transactions data successfully', async () => {
      const validTransactionData = [
        {
          Date: '2024-01-15',
          Origin: 'John',
          Bank: 'Chase Bank',
          Flow: 'ENTRADA',
          'Major Category': 'RENDIMENTO',
          Category: 'Salary',
          'Sub Category': 'Monthly Salary',
          Description: 'January salary',
          'Income Amount': 3500,
          'Outgoing Amount': '',
          Notes: 'Direct deposit'
        }
      ];

      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(validTransactionData);

      const result = await BulkUploadService.parseAndValidate(mockFile, 'transactions');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validTransactionData);
    });

    it('should detect validation errors in transactions data', async () => {
      const invalidTransactionData = [
        {
          Date: '', // Missing date
          Origin: 'John',
          Bank: 'Chase Bank',
          Flow: 'INVALID_FLOW', // Invalid flow
          'Major Category': 'RENDIMENTO',
          Category: 'Salary',
          'Sub Category': 'Monthly Salary',
          Description: 'January salary',
          'Income Amount': '', // Missing income for ENTRADA flow
          'Outgoing Amount': '',
          Notes: ''
        }
      ];

      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(invalidTransactionData);

      const result = await BulkUploadService.parseAndValidate(mockFile, 'transactions');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Check for specific errors
      expect(result.errors.some(e => e.column === 'Date')).toBe(true);
      expect(result.errors.some(e => e.column === 'Flow')).toBe(true);
    });

    it('should validate categories data successfully', async () => {
      const validCategoryData = [
        {
          Flow: 'ENTRADA',
          'Major Category': 'RENDIMENTO',
          Category: 'Salary',
          'Sub Category': 'Monthly Salary'
        }
      ];

      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(validCategoryData);

      const result = await BulkUploadService.parseAndValidate(mockFile, 'categories');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validCategoryData);
    });

    it('should validate origins data successfully', async () => {
      const validOriginData = [
        { Name: 'John' },
        { Name: 'Jane' },
        { Name: 'Joint Account' }
      ];

      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(validOriginData);

      const result = await BulkUploadService.parseAndValidate(mockFile, 'origins');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validOriginData);
    });

    it('should validate banks data successfully', async () => {
      const validBankData = [
        { Name: 'Chase Bank' },
        { Name: 'Wells Fargo' },
        { Name: 'Bank of America' }
      ];

      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(validBankData);

      const result = await BulkUploadService.parseAndValidate(mockFile, 'banks');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validBankData);
    });

    it('should handle parsing errors gracefully', async () => {
      vi.mocked(XLSX.read).mockImplementation(() => {
        throw new Error('Invalid file format');
      });

      await expect(
        BulkUploadService.parseAndValidate(mockFile, 'transactions')
      ).rejects.toThrow('Invalid file format');
    });
  });

  describe('validation rules', () => {
    let mockFile: File;

    beforeEach(() => {
      mockFile = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(8));
    });

    it('should validate date formats correctly', async () => {
      const testData = [
        {
          Date: '2024-01-15', // Valid YYYY-MM-DD
          Origin: 'John',
          Bank: 'Chase',
          Flow: 'ENTRADA',
          'Major Category': 'RENDIMENTO',
          Category: 'Salary',
          'Sub Category': 'Monthly',
          Description: 'Test',
          'Income Amount': 1000,
          'Outgoing Amount': '',
          Notes: ''
        },
        {
          Date: '15/01/2024', // Valid DD/MM/YYYY
          Origin: 'John',
          Bank: 'Chase',
          Flow: 'ENTRADA',
          'Major Category': 'RENDIMENTO',
          Category: 'Salary',
          'Sub Category': 'Monthly',
          Description: 'Test',
          'Income Amount': 1000,
          'Outgoing Amount': '',
          Notes: ''
        },
        {
          Date: 'invalid-date', // Invalid format
          Origin: 'John',
          Bank: 'Chase',
          Flow: 'ENTRADA',
          'Major Category': 'RENDIMENTO',
          Category: 'Salary',
          'Sub Category': 'Monthly',
          Description: 'Test',
          'Income Amount': 1000,
          'Outgoing Amount': '',
          Notes: ''
        }
      ];

      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(testData);

      const result = await BulkUploadService.parseAndValidate(mockFile, 'transactions');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.column === 'Date' && e.row === 4 // Third row (index 2 + 2 for header)
      )).toBe(true);
    });

    it('should validate flow-amount consistency', async () => {
      const testData = [
        {
          Date: '2024-01-15',
          Origin: 'John',
          Bank: 'Chase',
          Flow: 'ENTRADA',
          'Major Category': 'RENDIMENTO',
          Category: 'Salary',
          'Sub Category': 'Monthly',
          Description: 'Test',
          'Income Amount': '', // Missing income for ENTRADA
          'Outgoing Amount': 1000, // Incorrect outgoing for ENTRADA
          Notes: ''
        },
        {
          Date: '2024-01-16',
          Origin: 'Jane',
          Bank: 'Wells Fargo',
          Flow: 'SAIDA',
          'Major Category': 'CUSTOS_VARIAVEIS',
          Category: 'Food',
          'Sub Category': 'Groceries',
          Description: 'Test',
          'Income Amount': 500, // Incorrect income for SAIDA
          'Outgoing Amount': '', // Missing outgoing for SAIDA
          Notes: ''
        }
      ];

      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(testData);

      const result = await BulkUploadService.parseAndValidate(mockFile, 'transactions');

      expect(result.isValid).toBe(false);
      
      // Should have errors for both rows
      expect(result.errors.some(e => 
        e.column === 'Income Amount' && e.row === 2
      )).toBe(true);
      expect(result.errors.some(e => 
        e.column === 'Outgoing Amount' && e.row === 2
      )).toBe(true);
      expect(result.errors.some(e => 
        e.column === 'Income Amount' && e.row === 3
      )).toBe(true);
      expect(result.errors.some(e => 
        e.column === 'Outgoing Amount' && e.row === 3
      )).toBe(true);
    });

    it('should validate required fields', async () => {
      const testData = [
        {
          Date: '2024-01-15',
          Origin: '', // Missing required field
          Bank: 'Chase',
          Flow: 'ENTRADA',
          'Major Category': 'RENDIMENTO',
          Category: '', // Missing required field
          'Sub Category': 'Monthly',
          Description: '', // Missing required field
          'Income Amount': 1000,
          'Outgoing Amount': '',
          Notes: ''
        }
      ];

      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(testData);

      const result = await BulkUploadService.parseAndValidate(mockFile, 'transactions');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.column === 'Origin')).toBe(true);
      expect(result.errors.some(e => e.column === 'Category')).toBe(true);
      expect(result.errors.some(e => e.column === 'Description')).toBe(true);
    });
  });

  describe('generateErrorReport', () => {
    it('should generate error report successfully', () => {
      const errors = [
        {
          row: 2,
          column: 'Date',
          value: 'invalid-date',
          error: 'Invalid date format',
          suggestion: 'Use YYYY-MM-DD format'
        },
        {
          row: 3,
          column: 'Flow',
          value: 'INVALID',
          error: 'Invalid flow value',
          suggestion: 'Use ENTRADA or SAIDA'
        }
      ];

      const result = BulkUploadService.generateErrorReport(errors, 'test.xlsx');

      expect(result).toBeInstanceOf(Uint8Array);
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
        {
          Row: 2,
          Column: 'Date',
          'Current Value': 'invalid-date',
          Error: 'Invalid date format',
          Suggestion: 'Use YYYY-MM-DD format'
        },
        {
          Row: 3,
          Column: 'Flow',
          'Current Value': 'INVALID',
          Error: 'Invalid flow value',
          Suggestion: 'Use ENTRADA or SAIDA'
        }
      ]);
    });

    it('should handle errors without suggestions', () => {
      const errors = [
        {
          row: 2,
          column: 'Date',
          value: '',
          error: 'Date is required'
        }
      ];

      const result = BulkUploadService.generateErrorReport(errors, 'test.xlsx');

      expect(result).toBeInstanceOf(Uint8Array);
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
        {
          Row: 2,
          Column: 'Date',
          'Current Value': '',
          Error: 'Date is required',
          Suggestion: ''
        }
      ]);
    });
  });

  describe('utility functions', () => {
    it('should generate correct template filename', () => {
      const filename = BulkUploadService.getTemplateFilename('transactions');
      
      expect(filename).toMatch(/^transactions_template_\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    it('should generate correct error report filename', () => {
      const filename = BulkUploadService.getErrorReportFilename('my_data.xlsx');
      
      expect(filename).toMatch(/^my_data_errors_\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    it('should handle filenames without extensions', () => {
      const filename = BulkUploadService.getErrorReportFilename('my_data');
      
      expect(filename).toMatch(/^my_data_errors_\d{4}-\d{2}-\d{2}\.xlsx$/);
    });
  });

  describe('edge cases', () => {
    let mockFile: File;

    beforeEach(() => {
      mockFile = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(8));
    });

    it('should handle empty data arrays', async () => {
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([]);

      const result = await BulkUploadService.parseAndValidate(mockFile, 'transactions');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual([]);
    });

    it('should handle numeric values as strings', async () => {
      const testData = [
        {
          Date: '2024-01-15',
          Origin: 'John',
          Bank: 'Chase',
          Flow: 'ENTRADA',
          'Major Category': 'RENDIMENTO',
          Category: 'Salary',
          'Sub Category': 'Monthly',
          Description: 'Test',
          'Income Amount': '1000.50', // String number
          'Outgoing Amount': '',
          Notes: ''
        }
      ];

      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(testData);

      const result = await BulkUploadService.parseAndValidate(mockFile, 'transactions');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle whitespace in text fields', async () => {
      const testData = [
        {
          Date: '2024-01-15',
          Origin: '  John  ', // Whitespace
          Bank: 'Chase',
          Flow: 'ENTRADA',
          'Major Category': 'RENDIMENTO',
          Category: '  Salary  ', // Whitespace
          'Sub Category': 'Monthly',
          Description: 'Test',
          'Income Amount': 1000,
          'Outgoing Amount': '',
          Notes: ''
        }
      ];

      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(testData);

      const result = await BulkUploadService.parseAndValidate(mockFile, 'transactions');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should throw error for unknown template type in validation', async () => {
      await expect(
        BulkUploadService.parseAndValidate(mockFile, 'unknown' as any)
      ).rejects.toThrow('Unknown template type: unknown');
    });
  });
});