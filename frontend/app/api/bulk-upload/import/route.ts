import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import * as XLSX from 'xlsx';
import { TransactionFlow, MajorCategory } from '@prisma/client';

// Helper functions to normalize data
function normalizeFlow(flow: string): TransactionFlow {
  const normalized = flow.toUpperCase().trim();
  if (normalized === 'ENTRADA' || normalized === 'INCOME') return 'ENTRADA';
  if (normalized === 'SAIDA' || normalized === 'SAÍDA' || normalized === 'EXPENSE') return 'SAIDA';
  throw new Error(`Invalid flow value: ${flow}. Expected ENTRADA or SAIDA`);
}

function normalizeMajorCategory(category: string): MajorCategory {
  const normalized = category.toUpperCase().trim().replace(/\s+/g, '_');
  
  const categoryMap: { [key: string]: MajorCategory } = {
    'RENDIMENTO': 'RENDIMENTO',
    'RENDIMENTO_EXTRA': 'RENDIMENTO_EXTRA', 
    'ECONOMIA_INVESTIMENTOS': 'ECONOMIA_INVESTIMENTOS',
    'CUSTOS_FIXOS': 'CUSTOS_FIXOS',
    'CUSTOS_VARIAVEIS': 'CUSTOS_VARIAVEIS',
    'GASTOS_SEM_CULPA': 'GASTOS_SEM_CULPA',
    'ECONOMIA_E_INVESTIMENTOS': 'ECONOMIA_INVESTIMENTOS',
    'CUSTOS_VARIÁVEIS': 'CUSTOS_VARIAVEIS'
  };
  
  if (categoryMap[normalized]) {
    return categoryMap[normalized];
  }
  
  throw new Error(`Invalid major category: ${category}. Expected one of: ${Object.keys(categoryMap).join(', ')}`);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file || !type) {
      return NextResponse.json(
        { success: false, error: 'File and type are required' },
        { status: 400 }
      );
    }

    // Parse Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let processedRecords = 0;

    // Process data based on type
    switch (type) {
      case 'origins':
        // Bulk create origins
        const origins = data.map((row: any) => ({ name: row.Name }));
        await prisma.origin.createMany({
          data: origins,
          skipDuplicates: true
        });
        processedRecords = origins.length;
        break;

      case 'banks':
        // Bulk create banks
        const banks = data.map((row: any) => ({ name: row.Name }));
        await prisma.bank.createMany({
          data: banks,
          skipDuplicates: true
        });
        processedRecords = banks.length;
        break;

      case 'categories':
        // Bulk create categories
        const categories = data.map((row: any) => ({
          flow: normalizeFlow(row.Flow),
          majorCategory: normalizeMajorCategory(row['Major Category']),
          category: row.Category,
          subCategory: row['Sub Category']
        }));
        await prisma.category.createMany({
          data: categories,
          skipDuplicates: true
        });
        processedRecords = categories.length;
        break;

      case 'transactions':
        // Pre-fetch all origins, banks, and categories to avoid repeated queries
        const allOrigins = await prisma.origin.findMany();
        const allBanks = await prisma.bank.findMany();
        const allCategories = await prisma.category.findMany();

        // Create maps for fast lookup
        const originMap = new Map(allOrigins.map(o => [o.name, o.id]));
        const bankMap = new Map(allBanks.map(b => [b.name, b.id]));
        const categoryMap = new Map(allCategories.map(c => 
          [`${c.flow}_${c.majorCategory}_${c.category}_${c.subCategory}`, c.id]
        ));

        // Prepare transactions data
        const transactions = [];
        const newOrigins = new Set();
        const newBanks = new Set();
        const newCategories = new Set();

        for (const row of data as any[]) {
          console.log('Raw date from Excel:', row.Date, typeof row.Date);
          const date = parseDate(row.Date);
          console.log('Parsed date:', date);
          const flow = normalizeFlow(row.Flow);
          const majorCategory = normalizeMajorCategory(row['Major Category']);
          
          // Track new entities that need to be created
          if (!originMap.has(row.Origin)) {
            newOrigins.add(row.Origin);
          }
          if (!bankMap.has(row.Bank)) {
            newBanks.add(row.Bank);
          }
          
          const categoryKey = `${flow}_${majorCategory}_${row.Category}_${row['Sub Category']}`;
          if (!categoryMap.has(categoryKey)) {
            newCategories.add(JSON.stringify({
              flow,
              majorCategory,
              category: row.Category,
              subCategory: row['Sub Category']
            }));
          }

          transactions.push({
            row,
            date,
            flow,
            majorCategory,
            month: getMonthFromDate(date)
          });
        }

        // Create missing entities in bulk
        if (newOrigins.size > 0) {
          await prisma.origin.createMany({
            data: Array.from(newOrigins).map(name => ({ name })),
            skipDuplicates: true
          });
          // Refresh origin map
          const freshOrigins = await prisma.origin.findMany();
          freshOrigins.forEach(o => originMap.set(o.name, o.id));
        }

        if (newBanks.size > 0) {
          await prisma.bank.createMany({
            data: Array.from(newBanks).map(name => ({ name })),
            skipDuplicates: true
          });
          // Refresh bank map
          const freshBanks = await prisma.bank.findMany();
          freshBanks.forEach(b => bankMap.set(b.name, b.id));
        }

        if (newCategories.size > 0) {
          await prisma.category.createMany({
            data: Array.from(newCategories).map(catStr => JSON.parse(catStr)),
            skipDuplicates: true
          });
          // Refresh category map
          const freshCategories = await prisma.category.findMany();
          freshCategories.forEach(c => 
            categoryMap.set(`${c.flow}_${c.majorCategory}_${c.category}_${c.subCategory}`, c.id)
          );
        }

        // Now create all transactions in bulk
        const transactionData = transactions.map(({ row, date, flow, majorCategory, month }) => {
          const originId = originMap.get(row.Origin);
          const bankId = bankMap.get(row.Bank);
          const categoryKey = `${flow}_${majorCategory}_${row.Category}_${row['Sub Category']}`;
          const categoryId = categoryMap.get(categoryKey);

          // Validate required fields
          if (!originId) {
            throw new Error(`Origin not found: ${row.Origin}`);
          }
          if (!bankId) {
            throw new Error(`Bank not found: ${row.Bank}`);
          }
          if (!categoryId) {
            throw new Error(`Category not found: ${categoryKey}`);
          }

          // Convert amounts to Decimal type compatible values
          const incomeAmount = flow === 'ENTRADA' ? parseFloat(row['Income Amount'] || 0) : null;
          const outgoingAmount = flow === 'SAIDA' ? parseFloat(row['Outgoing Amount'] || 0) : null;

          return {
            date,
            originId,
            bankId,
            flow,
            categoryId,
            description: row.Description || '',
            incomes: incomeAmount && incomeAmount > 0 ? incomeAmount : null,
            outgoings: outgoingAmount && outgoingAmount > 0 ? outgoingAmount : null,
            notes: row.Notes || null,
            month,
            year: date.getFullYear(),
            isAiGenerated: false,
            isValidated: true
          };
        });

        console.log('Sample transaction data:', JSON.stringify(transactionData[0], null, 2));
        
        await prisma.transaction.createMany({
          data: transactionData,
          skipDuplicates: true
        });

        processedRecords = transactionData.length;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${processedRecords} ${type} records`,
      processedRecords
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to import data', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function parseDate(dateValue: any): Date {
  // Handle Excel timestamp (number) - proper Excel date conversion
  if (typeof dateValue === 'number') {
    // Excel epoch starts at January 1, 1900 (but Excel incorrectly treats 1900 as leap year)
    // So we use December 30, 1899 as the base
    const excelBaseDate = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    return new Date(excelBaseDate.getTime() + dateValue * msPerDay);
  }
  
  // Handle dd/mm/yyyy format
  if (typeof dateValue === 'string' && dateValue.includes('/')) {
    const parts = dateValue.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Month is 0-indexed
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    }
  }
  
  // Handle other string formats
  return new Date(dateValue);
}

function getMonthFromDate(date: Date): any {
  const months = [
    'JANEIRO', 'FEVEREIRO', 'MARCO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];
  return months[date.getMonth()];
}