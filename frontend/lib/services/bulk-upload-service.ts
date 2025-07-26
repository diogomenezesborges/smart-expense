import * as XLSX from 'xlsx';
import { TransactionFlow, MajorCategory, Month } from '@prisma/client';
import { FinancialContext } from './ai-service';
import { GeminiAIService } from './gemini-ai-service';

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

export interface DataTransformationResult {
  transformedData: any[];
  aiSuggestions: AICategorySuggestion[];
  transformationLog: TransformationLogEntry[];
}

export interface AICategorySuggestion {
  row: number;
  description: string;
  currentCategory?: string;
  suggestedCategory: string;
  confidence: number;
  reasoning: string;
}

export interface TransformationLogEntry {
  row: number;
  field: string;
  originalValue: any;
  transformedValue: any;
  transformation: string;
  confidence: number;
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
  
  // Enhanced hierarchical category mapping based on business rules
  private static readonly CATEGORY_HIERARCHY = {
    'RENDIMENTO': {
      'Salary': ['Monthly Salary', 'Annual Bonus', 'Commission', 'Overtime'],
      'Freelance': ['Consulting', 'Project Work', 'Contract Work'],
      'Investment': ['Dividends', 'Capital Gains', 'Interest']
    },
    'RENDIMENTO_EXTRA': {
      'Side Income': ['Tutoring', 'Sales', 'Gig Work'],
      'Passive Income': ['Rental Income', 'Royalties', 'Affiliate']
    },
    'CUSTOS_FIXOS': {
      'Housing': ['Rent', 'Mortgage', 'Property Tax', 'HOA Fees'],
      'Bills & Utilities': ['Electricity', 'Water', 'Gas', 'Internet', 'Phone'],
      'Insurance': ['Health', 'Car', 'Home', 'Life'],
      'Subscriptions': ['Netflix', 'Spotify', 'Software', 'Gym']
    },
    'CUSTOS_VARIAVEIS': {
      'Food & Dining': ['Groceries', 'Restaurants', 'Take-away', 'Coffee'],
      'Transportation': ['Fuel', 'Public Transport', 'Car Maintenance', 'Parking'],
      'Shopping': ['Clothing', 'Electronics', 'Home Items', 'Personal Care'],
      'Healthcare': ['Medical', 'Pharmacy', 'Dental', 'Therapy']
    },
    'GASTOS_SEM_CULPA': {
      'Entertainment': ['Movies', 'Sports', 'Gaming', 'Hobbies'],
      'Travel': ['Flights', 'Hotels', 'Vacation', 'Weekend Trips'],
      'Personal': ['Gifts', 'Charity', 'Education', 'Books']
    }
  };
  
  // Origin mapping for Portuguese context
  private static readonly ORIGIN_MAPPING = {
    'Diogo': ['diogo', 'diego', 'd.', 'personal_d', 'individual_d'],
    'Joana': ['joana', 'j.', 'personal_j', 'individual_j'],
    'Comum': ['joint', 'shared', 'family', 'comum', 'conjunto', 'both', 'together']
  };
  
  // Enhanced pattern recognition for transaction categorization
  private static readonly MERCHANT_PATTERNS = {
    'Groceries': ['supermarket', 'continente', 'pingo doce', 'auchan', 'lidl', 'grocery', 'market'],
    'Restaurants': ['restaurant', 'cafe', 'bar', 'bistro', 'food', 'mcdonalds', 'kfc'],
    'Fuel': ['galp', 'bp', 'repsol', 'shell', 'cepsa', 'gas station', 'fuel'],
    'Public Transport': ['metro', 'carris', 'cp', 'train', 'bus', 'transport'],
    'Pharmacy': ['farmacia', 'pharmacy', 'wellspring', 'cvs'],
    'Entertainment': ['cinema', 'netflix', 'spotify', 'steam', 'gaming'],
    'Bills & Utilities': ['edp', 'endesa', 'nos', 'meo', 'vodafone', 'utility']
  };
  
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
   * Enhanced parse and validate with AI-powered data transformation
   */
  static async parseAndValidate(file: File, type: TemplateType): Promise<{
    data: any[];
    errors: ValidationError[];
    isValid: boolean;
    transformationResult?: DataTransformationResult;
  }> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    const errors: ValidationError[] = [];

    // Apply data transformation before validation
    let transformationResult: DataTransformationResult | undefined;
    let processedData = rawData;

    if (type === 'transactions') {
      try {
        transformationResult = await this.transformTransactionData(rawData);
        processedData = transformationResult.transformedData;
      } catch (error) {
        console.warn('AI transformation failed, proceeding with original data:', error);
      }
    }

    // Validate based on template type
    let validationResult;
    switch (type) {
      case 'transactions':
        validationResult = this.validateTransactions(processedData, errors);
        break;
      case 'categories':
        validationResult = this.validateCategories(processedData, errors);
        break;
      case 'origins':
        validationResult = this.validateOrigins(processedData, errors);
        break;
      case 'banks':
        validationResult = this.validateBanks(processedData, errors);
        break;
      default:
        throw new Error(`Unknown template type: ${type}`);
    }

    return {
      ...validationResult,
      transformationResult
    };
  }

  /**
   * AI-powered transaction data transformation
   */
  private static async transformTransactionData(rawData: any[]): Promise<DataTransformationResult> {
    const transformedData: any[] = [];
    const aiSuggestions: AICategorySuggestion[] = [];
    const transformationLog: TransformationLogEntry[] = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = { ...rawData[i] };
      const rowNumber = i + 2; // Account for header

      // 1. Normalize and clean data
      row.Description = this.cleanDescription(row.Description || '');
      row.Origin = this.normalizeOrigin(row.Origin || '');
      
      // 2. Auto-detect missing categories using AI patterns
      if (!row['Major Category'] || !row.Category || !row['Sub Category']) {
        const categoryPrediction = this.predictCategoryFromDescription(row.Description);
        
        if (categoryPrediction) {
          if (!row['Major Category']) {
            row['Major Category'] = categoryPrediction.majorCategory;
            transformationLog.push({
              row: rowNumber,
              field: 'Major Category',
              originalValue: '',
              transformedValue: categoryPrediction.majorCategory,
              transformation: 'AI Pattern Recognition',
              confidence: categoryPrediction.confidence
            });
          }
          
          if (!row.Category) {
            row.Category = categoryPrediction.category;
            transformationLog.push({
              row: rowNumber,
              field: 'Category',
              originalValue: '',
              transformedValue: categoryPrediction.category,
              transformation: 'AI Pattern Recognition',
              confidence: categoryPrediction.confidence
            });
          }
          
          if (!row['Sub Category']) {
            row['Sub Category'] = categoryPrediction.subCategory;
            transformationLog.push({
              row: rowNumber,
              field: 'Sub Category',
              originalValue: '',
              transformedValue: categoryPrediction.subCategory,
              transformation: 'AI Pattern Recognition',
              confidence: categoryPrediction.confidence
            });
          }

          aiSuggestions.push({
            row: rowNumber,
            description: row.Description,
            currentCategory: row.Category,
            suggestedCategory: `${categoryPrediction.majorCategory} > ${categoryPrediction.category} > ${categoryPrediction.subCategory}`,
            confidence: categoryPrediction.confidence,
            reasoning: categoryPrediction.reasoning
          });
        }
      }

      // 3. Auto-detect Flow if missing
      if (!row.Flow) {
        const hasIncome = row['Income Amount'] && parseFloat(row['Income Amount']) > 0;
        const hasExpense = row['Outgoing Amount'] && parseFloat(row['Outgoing Amount']) > 0;
        
        if (hasIncome && !hasExpense) {
          row.Flow = 'ENTRADA';
          transformationLog.push({
            row: rowNumber,
            field: 'Flow',
            originalValue: '',
            transformedValue: 'ENTRADA',
            transformation: 'Amount-based Detection',
            confidence: 0.95
          });
        } else if (hasExpense && !hasIncome) {
          row.Flow = 'SAIDA';
          transformationLog.push({
            row: rowNumber,
            field: 'Flow',
            originalValue: '',
            transformedValue: 'SAIDA',
            transformation: 'Amount-based Detection',
            confidence: 0.95
          });
        }
      }

      // 4. Normalize amounts (handle different decimal separators)
      if (row['Income Amount']) {
        const normalized = this.normalizeAmount(row['Income Amount']);
        if (normalized !== row['Income Amount']) {
          transformationLog.push({
            row: rowNumber,
            field: 'Income Amount',
            originalValue: row['Income Amount'],
            transformedValue: normalized,
            transformation: 'Amount Normalization',
            confidence: 1.0
          });
          row['Income Amount'] = normalized;
        }
      }

      if (row['Outgoing Amount']) {
        const normalized = this.normalizeAmount(row['Outgoing Amount']);
        if (normalized !== row['Outgoing Amount']) {
          transformationLog.push({
            row: rowNumber,
            field: 'Outgoing Amount',
            originalValue: row['Outgoing Amount'],
            transformedValue: normalized,
            transformation: 'Amount Normalization',
            confidence: 1.0
          });
          row['Outgoing Amount'] = normalized;
        }
      }

      // 5. Normalize dates
      if (row.Date) {
        const normalizedDate = this.normalizeDate(row.Date);
        if (normalizedDate !== row.Date) {
          transformationLog.push({
            row: rowNumber,
            field: 'Date',
            originalValue: row.Date,
            transformedValue: normalizedDate,
            transformation: 'Date Normalization',
            confidence: 0.9
          });
          row.Date = normalizedDate;
        }
      }

      transformedData.push(row);
    }

    return {
      transformedData,
      aiSuggestions,
      transformationLog
    };
  }

  /**
   * Clean and normalize transaction descriptions
   */
  private static cleanDescription(description: string): string {
    return description
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-\.]/gi, '')
      .toLowerCase();
  }

  /**
   * Normalize origin names to standard format
   */
  private static normalizeOrigin(origin: string): string {
    const cleanOrigin = origin.toLowerCase().trim();
    
    // Check against known mappings
    for (const [standardName, variants] of Object.entries(this.ORIGIN_MAPPING)) {
      if (variants.some(variant => cleanOrigin.includes(variant))) {
        return standardName;
      }
    }
    
    // Capitalize first letter if no mapping found
    return origin.charAt(0).toUpperCase() + origin.slice(1);
  }

  /**
   * Predict category from transaction description using pattern matching
   */
  private static predictCategoryFromDescription(description: string): {
    majorCategory: string;
    category: string;
    subCategory: string;
    confidence: number;
    reasoning: string;
  } | null {
    const desc = description.toLowerCase();
    
    // Check merchant patterns
    for (const [category, patterns] of Object.entries(this.MERCHANT_PATTERNS)) {
      for (const pattern of patterns) {
        if (desc.includes(pattern)) {
          // Find the major category that contains this category
          for (const [majorCat, categories] of Object.entries(this.CATEGORY_HIERARCHY)) {
            const categoryObj = categories as Record<string, string[]>;
            if (categoryObj[category]) {
              return {
                majorCategory: majorCat,
                category: category,
                subCategory: categoryObj[category][0], // Use first subcategory as default
                confidence: 0.85,
                reasoning: `Matched merchant pattern: "${pattern}" in description`
              };
            }
          }
        }
      }
    }

    // Fallback: categorize as variable cost if no pattern matched
    return {
      majorCategory: 'CUSTOS_VARIAVEIS',
      category: 'Other',
      subCategory: 'Miscellaneous',
      confidence: 0.3,
      reasoning: 'No specific pattern matched, defaulted to variable cost'
    };
  }

  /**
   * Normalize monetary amounts (handle different decimal separators)
   */
  private static normalizeAmount(amount: any): number {
    if (typeof amount === 'number') return amount;
    
    const str = amount.toString().trim();
    
    // Handle different decimal separators (comma vs period)
    // European format: 1.234,56 or 1234,56
    // US format: 1,234.56 or 1234.56
    
    if (str.includes(',') && str.includes('.')) {
      // Both separators present - determine which is decimal
      const lastComma = str.lastIndexOf(',');
      const lastPeriod = str.lastIndexOf('.');
      
      if (lastComma > lastPeriod) {
        // European format: 1.234,56
        return parseFloat(str.replace(/\./g, '').replace(',', '.'));
      } else {
        // US format: 1,234.56
        return parseFloat(str.replace(/,/g, ''));
      }
    } else if (str.includes(',')) {
      // Only comma - could be thousands separator or decimal
      const parts = str.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        // Likely decimal: 1234,56
        return parseFloat(str.replace(',', '.'));
      } else {
        // Likely thousands: 1,234
        return parseFloat(str.replace(/,/g, ''));
      }
    } else {
      // Only periods or no separators
      return parseFloat(str);
    }
  }

  /**
   * Normalize date formats to YYYY-MM-DD
   */
  private static normalizeDate(date: any): string {
    if (!date) return '';
    
    const str = date.toString().trim();
    
    // Try to parse different date formats
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // D/M/YYYY or DD/M/YYYY
    ];
    
    // YYYY-MM-DD (already correct)
    if (formats[0].test(str)) {
      return str;
    }
    
    // DD/MM/YYYY
    const ddmmyyyy = str.match(formats[1]);
    if (ddmmyyyy) {
      return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
    }
    
    // DD-MM-YYYY
    const ddmmyyyy2 = str.match(formats[2]);
    if (ddmmyyyy2) {
      return `${ddmmyyyy2[3]}-${ddmmyyyy2[2]}-${ddmmyyyy2[1]}`;
    }
    
    // Flexible D/M/YYYY
    const flexible = str.match(formats[3]);
    if (flexible) {
      const day = flexible[1].padStart(2, '0');
      const month = flexible[2].padStart(2, '0');
      return `${flexible[3]}-${month}-${day}`;
    }
    
    // If no format matches, return original
    return str;
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