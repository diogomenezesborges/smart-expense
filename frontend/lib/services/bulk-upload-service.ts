import * as XLSX from 'xlsx';
import { TransactionFlow, MajorCategory, Month } from '@prisma/client';

export type TemplateType = 'transactions' | 'categories' | 'origins' | 'banks';

export interface TransactionTemplateRow {
  Date: string;
  Origin: string;
  Bank: string;
  Flow: string;
  'Major Category': string;
  Category: string;
  'Sub Category': string;
  Description: string;
  'Income Amount': number | '';
  'Outgoing Amount': number | '';
  Notes: string;
}

export interface CategoryTemplateRow {
  Flow: string;
  'Major Category': string;
  Category: string;
  'Sub Category': string;
}

export interface OriginTemplateRow {
  Name: string;
}

export interface BankTemplateRow {
  Name: string;
}

export interface ValidationError {
  row: number;
  column: string;
  value: any;
  error: string;
  suggestion?: string;
}

export interface ImportJob {
  id: string;
  filename: string;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorReport?: ValidationError[];
  createdAt: Date;
  completedAt?: Date;
}

export class BulkUploadService {
  
  /**
   * Generate Excel template for the specified data type
   */
  static generateTemplate(type: TemplateType): Uint8Array {
    try {
      const workbook = XLSX.utils.book_new();
      
      switch (type) {
        case 'transactions':
          this.createTransactionsTemplate(workbook);
          break;
        case 'categories':
          this.createCategoriesTemplate(workbook);
          break;
        case 'origins':
          this.createOriginsTemplate(workbook);
          break;
        case 'banks':
          this.createBanksTemplate(workbook);
          break;
        default:
          throw new Error(`Unknown template type: ${type}`);
      }
      
      const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error('Error generating template:', error);
      throw error;
    }
  }

  /**
   * Create transactions template with examples and validation rules
   */
  private static createTransactionsTemplate(workbook: XLSX.WorkBook) {
    const sampleData: TransactionTemplateRow[] = [
      {
        Date: '2024-01-15',
        Origin: 'John',
        Bank: 'Chase Bank',
        Flow: 'ENTRADA',
        'Major Category': 'RENDIMENTO',
        Category: 'Salary',
        'Sub Category': 'Monthly Salary',
        Description: 'January salary payment',
        'Income Amount': 3500.00,
        'Outgoing Amount': '',
        Notes: 'Direct deposit'
      },
      {
        Date: '2024-01-16',
        Origin: 'Jane',
        Bank: 'Wells Fargo',
        Flow: 'SAIDA',
        'Major Category': 'CUSTOS_VARIAVEIS',
        Category: 'Food & Dining',
        'Sub Category': 'Groceries',
        Description: 'Weekly grocery shopping',
        'Income Amount': '',
        'Outgoing Amount': 85.50,
        Notes: 'Whole Foods receipt #12345'
      }
    ];

    try {
      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      
      // Add column width formatting
      if (worksheet) {
        worksheet['!cols'] = [
          { wch: 12 }, // Date
          { wch: 15 }, // Origin
          { wch: 20 }, // Bank
          { wch: 12 }, // Flow
          { wch: 25 }, // Major Category
          { wch: 20 }, // Category
          { wch: 20 }, // Sub Category
          { wch: 30 }, // Description
          { wch: 15 }, // Income Amount
          { wch: 15 }, // Outgoing Amount
          { wch: 25 }  // Notes
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
      }
      
      // Skip validation sheet for now to simplify
    } catch (error) {
      console.error('Error creating transactions template:', error);
      throw error;
    }
  }

  /**
   * Add validation reference sheet for transactions
   */
  private static addTransactionValidationSheet(workbook: XLSX.WorkBook) {
    const validationData = {
      'Flow Options': [
        { Value: 'ENTRADA', Description: 'Income transactions' },
        { Value: 'SAIDA', Description: 'Outgoing transactions' }
      ],
      'Major Categories': [
        { Value: 'RENDIMENTO', Description: 'Income' },
        { Value: 'RENDIMENTO_EXTRA', Description: 'Extra Income' },
        { Value: 'ECONOMIA_INVESTIMENTOS', Description: 'Economy & Investments' },
        { Value: 'CUSTOS_FIXOS', Description: 'Fixed Costs' },
        { Value: 'CUSTOS_VARIAVEIS', Description: 'Variable Costs' },
        { Value: 'GASTOS_SEM_CULPA', Description: 'Guilt-free Spending' }
      ],
      'Date Format': [
        { Example: '2024-01-15', Description: 'YYYY-MM-DD (recommended)' },
        { Example: '15/01/2024', Description: 'DD/MM/YYYY (alternative)' },
        { Example: '01/15/2024', Description: 'MM/DD/YYYY (US format)' }
      ],
      'Amount Format': [
        { Example: '1250.50', Description: 'Use decimal point for cents' },
        { Example: '85', Description: 'Whole numbers are fine' },
        { Example: '', Description: 'Leave empty if not applicable' }
      ]
    };

    // Create validation worksheet
    const validationSheet = XLSX.utils.aoa_to_sheet([]);
    let currentRow = 0;

    Object.entries(validationData).forEach(([section, data]) => {
      // Add section header
      XLSX.utils.sheet_add_aoa(validationSheet, [[section]], { origin: `A${currentRow + 1}` });
      currentRow++;
      
      // Add data
      const headers = Object.keys(data[0]);
      XLSX.utils.sheet_add_aoa(validationSheet, [headers], { origin: `A${currentRow + 1}` });
      currentRow++;
      
      data.forEach(row => {
        XLSX.utils.sheet_add_aoa(validationSheet, [Object.values(row)], { origin: `A${currentRow + 1}` });
        currentRow++;
      });
      
      currentRow += 2; // Add spacing between sections
    });

    XLSX.utils.book_append_sheet(workbook, validationSheet, 'Validation Rules');
  }

  /**
   * Create categories template
   */
  private static createCategoriesTemplate(workbook: XLSX.WorkBook) {
    const sampleData: CategoryTemplateRow[] = [
      {
        Flow: 'ENTRADA',
        'Major Category': 'RENDIMENTO',
        Category: 'Salary',
        'Sub Category': 'Monthly Salary'
      },
      {
        Flow: 'ENTRADA',
        'Major Category': 'RENDIMENTO_EXTRA',
        Category: 'Freelance',
        'Sub Category': 'Consulting Work'
      },
      {
        Flow: 'SAIDA',
        'Major Category': 'CUSTOS_FIXOS',
        Category: 'Housing',
        'Sub Category': 'Rent'
      },
      {
        Flow: 'SAIDA',
        'Major Category': 'CUSTOS_VARIAVEIS',
        Category: 'Food & Dining',
        'Sub Category': 'Groceries'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet['!cols'] = [
      { wch: 12 }, // Flow
      { wch: 25 }, // Major Category
      { wch: 20 }, // Category
      { wch: 20 }  // Sub Category
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
  }

  /**
   * Create origins template
   */
  private static createOriginsTemplate(workbook: XLSX.WorkBook) {
    const sampleData: OriginTemplateRow[] = [
      { Name: 'John' },
      { Name: 'Jane' },
      { Name: 'Joint Account' },
      { Name: 'Family Fund' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet['!cols'] = [{ wch: 20 }]; // Name column

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Origins');
  }

  /**
   * Create banks template
   */
  private static createBanksTemplate(workbook: XLSX.WorkBook) {
    const sampleData: BankTemplateRow[] = [
      { Name: 'Chase Bank' },
      { Name: 'Wells Fargo' },
      { Name: 'Bank of America' },
      { Name: 'Citibank' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet['!cols'] = [{ wch: 25 }]; // Name column

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Banks');
  }

  /**
   * Parse uploaded Excel file and validate data
   */
  static async parseAndValidate(file: File, type: TemplateType): Promise<{
    data: any[];
    errors: ValidationError[];
    isValid: boolean;
  }> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet);
    const errors: ValidationError[] = [];

    // Validate based on template type
    switch (type) {
      case 'transactions':
        return this.validateTransactions(data, errors);
      case 'categories':
        return this.validateCategories(data, errors);
      case 'origins':
        return this.validateOrigins(data, errors);
      case 'banks':
        return this.validateBanks(data, errors);
      default:
        throw new Error(`Unknown template type: ${type}`);
    }
  }

  /**
   * Validate transaction data
   */
  private static validateTransactions(data: any[], errors: ValidationError[]): {
    data: any[];
    errors: ValidationError[];
    isValid: boolean;
  } {
    const validFlows = ['ENTRADA', 'SAIDA'];
    const validMajorCategories = Object.values(MajorCategory);

    data.forEach((row, index) => {
      const rowNumber = index + 2; // Account for header row

      // Validate required fields
      if (!row.Date) {
        errors.push({
          row: rowNumber,
          column: 'Date',
          value: row.Date,
          error: 'Date is required',
          suggestion: 'Use format YYYY-MM-DD (e.g., 2024-01-15)'
        });
      } else {
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$|^\d{2}-\d{2}-\d{4}$/;
        if (!dateRegex.test(row.Date)) {
          errors.push({
            row: rowNumber,
            column: 'Date',
            value: row.Date,
            error: 'Invalid date format',
            suggestion: 'Use YYYY-MM-DD, DD/MM/YYYY, or MM/DD/YYYY'
          });
        }
      }

      // Validate flow
      if (!validFlows.includes(row.Flow)) {
        errors.push({
          row: rowNumber,
          column: 'Flow',
          value: row.Flow,
          error: 'Invalid flow value',
          suggestion: 'Use ENTRADA for income or SAIDA for expenses'
        });
      }

      // Validate major category
      if (!validMajorCategories.includes(row['Major Category'])) {
        errors.push({
          row: rowNumber,
          column: 'Major Category',
          value: row['Major Category'],
          error: 'Invalid major category',
          suggestion: 'Check the Validation Rules sheet for valid options'
        });
      }

      // Validate amounts based on flow
      if (row.Flow === 'ENTRADA') {
        if (!row['Income Amount'] || isNaN(parseFloat(row['Income Amount']))) {
          errors.push({
            row: rowNumber,
            column: 'Income Amount',
            value: row['Income Amount'],
            error: 'Income amount is required for ENTRADA transactions',
            suggestion: 'Enter a positive number'
          });
        }
        if (row['Outgoing Amount']) {
          errors.push({
            row: rowNumber,
            column: 'Outgoing Amount',
            value: row['Outgoing Amount'],
            error: 'Outgoing amount should be empty for ENTRADA transactions',
            suggestion: 'Leave this field empty'
          });
        }
      } else if (row.Flow === 'SAIDA') {
        if (!row['Outgoing Amount'] || isNaN(parseFloat(row['Outgoing Amount']))) {
          errors.push({
            row: rowNumber,
            column: 'Outgoing Amount',
            value: row['Outgoing Amount'],
            error: 'Outgoing amount is required for SAIDA transactions',
            suggestion: 'Enter a positive number'
          });
        }
        if (row['Income Amount']) {
          errors.push({
            row: rowNumber,
            column: 'Income Amount',
            value: row['Income Amount'],
            error: 'Income amount should be empty for SAIDA transactions',
            suggestion: 'Leave this field empty'
          });
        }
      }

      // Validate required text fields
      ['Origin', 'Bank', 'Category', 'Sub Category', 'Description'].forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          errors.push({
            row: rowNumber,
            column: field,
            value: row[field],
            error: `${field} is required`,
            suggestion: 'Provide a descriptive value'
          });
        }
      });
    });

    return {
      data,
      errors,
      isValid: errors.length === 0
    };
  }

  /**
   * Validate categories data
   */
  private static validateCategories(data: any[], errors: ValidationError[]): {
    data: any[];
    errors: ValidationError[];
    isValid: boolean;
  } {
    const validFlows = ['ENTRADA', 'SAIDA'];
    const validMajorCategories = Object.values(MajorCategory);

    data.forEach((row, index) => {
      const rowNumber = index + 2;

      if (!validFlows.includes(row.Flow)) {
        errors.push({
          row: rowNumber,
          column: 'Flow',
          value: row.Flow,
          error: 'Invalid flow value'
        });
      }

      if (!validMajorCategories.includes(row['Major Category'])) {
        errors.push({
          row: rowNumber,
          column: 'Major Category',
          value: row['Major Category'],
          error: 'Invalid major category'
        });
      }

      ['Category', 'Sub Category'].forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          errors.push({
            row: rowNumber,
            column: field,
            value: row[field],
            error: `${field} is required`
          });
        }
      });
    });

    return { data, errors, isValid: errors.length === 0 };
  }

  /**
   * Validate origins data
   */
  private static validateOrigins(data: any[], errors: ValidationError[]): {
    data: any[];
    errors: ValidationError[];
    isValid: boolean;
  } {
    data.forEach((row, index) => {
      const rowNumber = index + 2;

      if (!row.Name || row.Name.toString().trim() === '') {
        errors.push({
          row: rowNumber,
          column: 'Name',
          value: row.Name,
          error: 'Name is required'
        });
      }
    });

    return { data, errors, isValid: errors.length === 0 };
  }

  /**
   * Validate banks data
   */
  private static validateBanks(data: any[], errors: ValidationError[]): {
    data: any[];
    errors: ValidationError[];
    isValid: boolean;
  } {
    data.forEach((row, index) => {
      const rowNumber = index + 2;

      if (!row.Name || row.Name.toString().trim() === '') {
        errors.push({
          row: rowNumber,
          column: 'Name',
          value: row.Name,
          error: 'Name is required'
        });
      }
    });

    return { data, errors, isValid: errors.length === 0 };
  }

  /**
   * Generate error report as Excel file
   */
  static generateErrorReport(errors: ValidationError[], originalFilename: string): Uint8Array {
    const workbook = XLSX.utils.book_new();
    
    const errorData = errors.map(error => ({
      Row: error.row,
      Column: error.column,
      'Current Value': error.value,
      Error: error.error,
      Suggestion: error.suggestion || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(errorData);
    worksheet['!cols'] = [
      { wch: 8 },  // Row
      { wch: 15 }, // Column
      { wch: 20 }, // Current Value
      { wch: 40 }, // Error
      { wch: 40 }  // Suggestion
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Errors');
    
    const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Uint8Array(arrayBuffer);
  }

  /**
   * Get template filename
   */
  static getTemplateFilename(type: TemplateType): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${type}_template_${timestamp}.xlsx`;
  }

  /**
   * Get error report filename
   */
  static getErrorReportFilename(originalFilename: string): string {
    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    const timestamp = new Date().toISOString().split('T')[0];
    return `${baseName}_errors_${timestamp}.xlsx`;
  }
}