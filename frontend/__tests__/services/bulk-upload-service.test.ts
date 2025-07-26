import { BulkUploadService } from '@/lib/services/bulk-upload-service'

// Mock XLSX library
jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(() => ({})),
    json_to_sheet: jest.fn(() => ({ '!cols': [] })),
    book_append_sheet: jest.fn(),
    aoa_to_sheet: jest.fn(() => ({ '!cols': [] })),
    sheet_add_aoa: jest.fn(),
    sheet_to_json: jest.fn()
  },
  write: jest.fn(() => new ArrayBuffer(100)),
  read: jest.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: { Sheet1: {} }
  }))
}))

describe('BulkUploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateTemplate', () => {
    it('should generate transactions template successfully', () => {
      const XLSX = require('xlsx')
      XLSX.utils.book_append_sheet.mockImplementation(() => {})
      XLSX.write.mockReturnValue(new ArrayBuffer(100))

      const result = BulkUploadService.generateTemplate('transactions')
      
      expect(result).toBeInstanceOf(Uint8Array)
      expect(XLSX.utils.book_new).toHaveBeenCalled()
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled()
      expect(XLSX.write).toHaveBeenCalledWith({}, { bookType: 'xlsx', type: 'array' })
    })

    it('should generate categories template successfully', () => {
      const XLSX = require('xlsx')
      const result = BulkUploadService.generateTemplate('categories')
      
      expect(result).toBeInstanceOf(Uint8Array)
      expect(XLSX.utils.book_new).toHaveBeenCalled()
    })

    it('should generate origins template successfully', () => {
      const result = BulkUploadService.generateTemplate('origins')
      expect(result).toBeInstanceOf(Uint8Array)
    })

    it('should generate banks template successfully', () => {
      const result = BulkUploadService.generateTemplate('banks')
      expect(result).toBeInstanceOf(Uint8Array)
    })

    it('should throw error for unknown template type', () => {
      expect(() => {
        BulkUploadService.generateTemplate('invalid' as any)
      }).toThrow('Unknown template type: invalid')
    })
  })

  describe('parseAndValidate', () => {
    const createMockFile = (content: any[] = []) => {
      const XLSX = require('xlsx')
      XLSX.utils.sheet_to_json.mockReturnValue(content)
      
      return {
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
      } as File
    }

    it('should parse and validate transactions successfully', async () => {
      const mockData = [
        {
          Date: '2024-01-15',
          Origin: 'Diogo',
          Bank: 'Test Bank',
          Flow: 'SAIDA',
          'Major Category': 'CUSTOS_VARIAVEIS',
          Category: 'Food & Dining',
          'Sub Category': 'Groceries',
          Description: 'Supermarket purchase',
          'Income Amount': '',
          'Outgoing Amount': 85.50,
          Notes: 'Weekly shopping'
        }
      ]

      const file = createMockFile(mockData)
      const result = await BulkUploadService.parseAndValidate(file, 'transactions')

      expect(result.transformationResult).toBeDefined()
      expect(result.transformationResult?.transformedData).toHaveLength(1)
      expect(result.errors).toHaveLength(0)
      expect(result.isValid).toBe(true)
    })

    it('should validate required fields and add errors for missing data', async () => {
      const mockData = [
        {
          Date: '', // Missing required field
          Origin: 'Diogo',
          Bank: '',  // Missing required field
          Flow: 'INVALID_FLOW', // Invalid value
          'Major Category': 'CUSTOS_VARIAVEIS',
          Category: 'Food & Dining',
          'Sub Category': 'Groceries',
          Description: 'Test',
          'Income Amount': '',
          'Outgoing Amount': 'invalid_amount', // Invalid amount
          Notes: ''
        }
      ]

      const file = createMockFile(mockData)
      const result = await BulkUploadService.parseAndValidate(file, 'transactions')

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.isValid).toBe(false)
      
      // Check for specific error types
      const errorColumns = result.errors.map(e => e.column)
      expect(errorColumns).toContain('Date')
      expect(errorColumns).toContain('Bank')
      expect(errorColumns).toContain('Flow')
      expect(errorColumns).toContain('Outgoing Amount')
    })

    it('should apply AI data transformation', async () => {
      const mockData = [
        {
          Date: '15/01/2024', // European date format
          Origin: 'comum',     // Lowercase, should normalize to 'Comum'
          Bank: 'Test Bank',
          Flow: '',            // Missing, should auto-detect
          'Major Category': '',     // Missing, should predict
          Category: '',             // Missing, should predict  
          'Sub Category': '',       // Missing, should predict
          Description: 'continente supermarket shopping',  // Should categorize as Groceries
          'Income Amount': '',
          'Outgoing Amount': '85,50', // European decimal format
          Notes: ''
        }
      ]

      const file = createMockFile(mockData)
      const result = await BulkUploadService.parseAndValidate(file, 'transactions')

      const transformedData = result.transformationResult?.transformedData[0]
      const transformationLog = result.transformationResult?.transformationLog || []
      
      // Check transformations
      expect(transformedData?.Date).toBe('2024-01-15') // Date normalized
      expect(transformedData?.Origin).toBe('Comum')   // Origin normalized
      expect(transformedData?.Flow).toBe('SAIDA')     // Flow auto-detected
      expect(transformedData?.['Outgoing Amount']).toBe(85.50) // Amount normalized
      
      // Check transformation log
      expect(transformationLog.length).toBeGreaterThan(0)
      const dateTransformation = transformationLog.find(log => log.field === 'Date')
      expect(dateTransformation?.transformation).toBe('Date Normalization')
    })

    it('should predict categories from merchant patterns', async () => {
      const mockData = [
        {
          Date: '2024-01-15',
          Origin: 'Diogo',
          Bank: 'Test Bank',
          Flow: 'SAIDA',
          'Major Category': '',
          Category: '',
          'Sub Category': '',
          Description: 'galp gas station fuel purchase',
          'Income Amount': '',
          'Outgoing Amount': 65.20,
          Notes: ''
        }
      ]

      const file = createMockFile(mockData)
      const result = await BulkUploadService.parseAndValidate(file, 'transactions')

      const transformedData = result.transformationResult?.transformedData[0]
      const aiSuggestions = result.transformationResult?.aiSuggestions || []
      
      // Should predict Fuel category from "galp" pattern
      expect(transformedData?.Category).toBe('Fuel')
      expect(aiSuggestions.length).toBeGreaterThan(0)
      expect(aiSuggestions[0].suggestedCategory).toContain('Fuel')
      expect(aiSuggestions[0].reasoning).toContain('galp')
    })

    it('should handle different amount formats correctly', async () => {
      const testCases = [
        { input: '1,234.56', expected: 1234.56 },   // US format
        { input: '1.234,56', expected: 1234.56 },   // European format
        { input: '1234,56', expected: 1234.56 },    // European no thousands
        { input: '1234.56', expected: 1234.56 },    // US no thousands
        { input: '1,234', expected: 1234 },         // Thousands separator
        { input: '85,50', expected: 85.50 },        // European decimal
        { input: '85', expected: 85 }               // Whole number
      ]

      for (const testCase of testCases) {
        const mockData = [{
          Date: '2024-01-15',
          Origin: 'Diogo',
          Bank: 'Test Bank',
          Flow: 'SAIDA',
          'Major Category': 'CUSTOS_VARIAVEIS',
          Category: 'Food',
          'Sub Category': 'Groceries',
          Description: 'Test',
          'Income Amount': '',
          'Outgoing Amount': testCase.input,
          Notes: ''
        }]

        const file = createMockFile(mockData)
        const result = await BulkUploadService.parseAndValidate(file, 'transactions')
        
        const transformedAmount = result.transformationResult?.transformedData[0]['Outgoing Amount']
        expect(transformedAmount).toBe(testCase.expected)
      }
    })

    it('should normalize date formats correctly', async () => {
      const testCases = [
        { input: '2024-01-15', expected: '2024-01-15' },  // Already correct
        { input: '15/01/2024', expected: '2024-01-15' },  // DD/MM/YYYY
        { input: '15-01-2024', expected: '2024-01-15' },  // DD-MM-YYYY
        { input: '1/5/2024', expected: '2024-05-01' },    // D/M/YYYY
      ]

      for (const testCase of testCases) {
        const mockData = [{
          Date: testCase.input,
          Origin: 'Diogo',
          Bank: 'Test Bank',
          Flow: 'SAIDA',
          'Major Category': 'CUSTOS_VARIAVEIS',
          Category: 'Food',
          'Sub Category': 'Groceries',
          Description: 'Test',
          'Income Amount': '',
          'Outgoing Amount': 100,
          Notes: ''
        }]

        const file = createMockFile(mockData)
        const result = await BulkUploadService.parseAndValidate(file, 'transactions')
        
        const transformedDate = result.transformationResult?.transformedData[0].Date
        expect(transformedDate).toBe(testCase.expected)
      }
    })

    it('should validate categories template', async () => {
      const mockData = [
        {
          Flow: 'ENTRADA',
          'Major Category': 'RENDIMENTO',
          Category: 'Salary',
          'Sub Category': 'Monthly Salary'
        },
        {
          Flow: 'INVALID', // Invalid flow
          'Major Category': '', // Missing
          Category: 'Food',
          'Sub Category': '' // Missing
        }
      ]

      const file = createMockFile(mockData)
      const result = await BulkUploadService.parseAndValidate(file, 'categories')

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.isValid).toBe(false)
      
      const errorColumns = result.errors.map(e => e.column)
      expect(errorColumns).toContain('Flow')
      expect(errorColumns).toContain('Major Category')
      expect(errorColumns).toContain('Sub Category')
    })

    it('should validate origins template', async () => {
      const mockData = [
        { Name: 'Diogo' },
        { Name: '' }, // Missing name
        { Name: 'Joana' }
      ]

      const file = createMockFile(mockData)
      const result = await BulkUploadService.parseAndValidate(file, 'origins')

      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].column).toBe('Name')
      expect(result.errors[0].error).toBe('Name is required')
    })

    it('should validate banks template', async () => {
      const mockData = [
        { Name: 'Chase Bank' },
        { Name: '' }, // Missing name
      ]

      const file = createMockFile(mockData)
      const result = await BulkUploadService.parseAndValidate(file, 'banks')

      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].column).toBe('Name')
      expect(result.errors[0].error).toBe('Name is required')
    })
  })

  describe('generateErrorReport', () => {
    it('should generate error report successfully', () => {
      const XLSX = require('xlsx')
      
      const errors = [
        {
          row: 2,
          column: 'Date',
          value: '',
          error: 'Date is required',
          suggestion: 'Use format YYYY-MM-DD'
        },
        {
          row: 3,
          column: 'Amount',
          value: 'invalid',
          error: 'Invalid amount format',
          suggestion: 'Enter a valid number'
        }
      ]

      const result = BulkUploadService.generateErrorReport(errors, 'test-file.xlsx')

      expect(result).toBeInstanceOf(Uint8Array)
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
        {
          Row: 2,
          Column: 'Date',
          'Current Value': '',
          Error: 'Date is required',
          Suggestion: 'Use format YYYY-MM-DD'
        },
        {
          Row: 3,
          Column: 'Amount',
          'Current Value': 'invalid',
          Error: 'Invalid amount format',
          Suggestion: 'Enter a valid number'
        }
      ])
    })
  })

  describe('getTemplateFilename', () => {
    it('should generate template filename with date', () => {
      const filename = BulkUploadService.getTemplateFilename('transactions')
      expect(filename).toMatch(/^transactions_template_\d{4}-\d{2}-\d{2}\.xlsx$/)
    })
  })

  describe('getErrorReportFilename', () => {
    it('should generate error report filename', () => {
      const filename = BulkUploadService.getErrorReportFilename('original-file.xlsx')
      expect(filename).toMatch(/^original-file_errors_\d{4}-\d{2}-\d{2}\.xlsx$/)
    })
  })
})