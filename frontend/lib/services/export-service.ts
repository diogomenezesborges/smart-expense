import { prisma } from '@/lib/database/client';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export type ExportFormat = 'csv' | 'excel' | 'pdf';
export type ExportType = 'transactions' | 'analytics' | 'budget' | 'categories';

interface ExportOptions {
  format: ExportFormat;
  type: ExportType;
  dateFrom?: Date;
  dateTo?: Date;
  categoryId?: string;
  includeMetadata?: boolean;
}

interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  error?: string;
  metadata?: {
    recordCount: number;
    generatedAt: Date;
    filters: any;
  };
}

export class ExportService {
  private static instance: ExportService;

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  async exportData(options: ExportOptions): Promise<ExportResult> {
    try {
      const data = await this.fetchData(options);
      const filename = this.generateFilename(options);
      
      let downloadUrl: string;
      
      switch (options.format) {
        case 'csv':
          downloadUrl = await this.exportToCsv(data, filename);
          break;
        case 'excel':
          downloadUrl = await this.exportToExcel(data, filename, options);
          break;
        case 'pdf':
          downloadUrl = await this.exportToPdf(data, filename, options);
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }

      return {
        success: true,
        downloadUrl,
        filename,
        metadata: {
          recordCount: Array.isArray(data) ? data.length : Object.keys(data).length,
          generatedAt: new Date(),
          filters: {
            dateFrom: options.dateFrom,
            dateTo: options.dateTo,
            categoryId: options.categoryId,
          },
        },
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown export error',
      };
    }
  }

  private async fetchData(options: ExportOptions): Promise<any> {
    const { type, dateFrom, dateTo, categoryId } = options;
    const whereClause: any = {};

    if (dateFrom || dateTo) {
      whereClause.date = {};
      if (dateFrom) whereClause.date.gte = dateFrom;
      if (dateTo) whereClause.date.lte = dateTo;
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    switch (type) {
      case 'transactions':
        return this.fetchTransactionData(whereClause);
      case 'analytics':
        return this.fetchAnalyticsData(whereClause);
      case 'budget':
        return this.fetchBudgetData(whereClause);
      case 'categories':
        return this.fetchCategoryData();
      default:
        throw new Error(`Unsupported export type: ${type}`);
    }
  }

  private async fetchTransactionData(whereClause: any) {
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            category: true,
            subCategory: true,
            flow: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 10000, // Limit to prevent memory issues
    });

    return transactions.map(transaction => ({
      id: transaction.id,
      date: transaction.date.toISOString().split('T')[0],
      description: transaction.description,
      amount: transaction.amount,
      incomes: transaction.incomes,
      outgoings: transaction.outgoings,
      category: transaction.category?.category || 'Unknown',
      subCategory: transaction.category?.subCategory || 'Unknown',
      flow: transaction.category?.flow || 'Unknown',
      merchantName: transaction.merchantName,
      bankName: transaction.bankName,
      isValidated: transaction.isValidated,
      isAiGenerated: transaction.isAiGenerated,
      createdAt: transaction.createdAt.toISOString(),
    }));
  }

  private async fetchAnalyticsData(whereClause: any) {
    const [transactions, monthlyStats, categoryStats] = await Promise.all([
      prisma.transaction.aggregate({
        where: whereClause,
        _sum: {
          incomes: true,
          outgoings: true,
        },
        _count: true,
      }),
      this.getMonthlyStatistics(whereClause),
      this.getCategoryStatistics(whereClause),
    ]);

    return {
      summary: {
        totalTransactions: transactions._count,
        totalIncome: transactions._sum.incomes || 0,
        totalExpenses: transactions._sum.outgoings || 0,
        netFlow: (transactions._sum.incomes || 0) - (transactions._sum.outgoings || 0),
      },
      monthlyBreakdown: monthlyStats,
      categoryBreakdown: categoryStats,
    };
  }

  private async fetchBudgetData(whereClause: any) {
    // Mock budget data - in real implementation, this would come from a budget table
    const categoryStats = await this.getCategoryStatistics(whereClause);
    
    const budgetData = categoryStats.map(stat => ({
      category: stat.category,
      subCategory: stat.subCategory,
      budgetedAmount: this.getMockBudget(stat.category), // Mock budgets
      actualAmount: stat.totalAmount,
      variance: stat.totalAmount - this.getMockBudget(stat.category),
      variancePercentage: ((stat.totalAmount / this.getMockBudget(stat.category)) - 1) * 100,
      transactionCount: stat.transactionCount,
    }));

    return budgetData;
  }

  private async fetchCategoryData() {
    const categories = await prisma.category.findMany({
      orderBy: [{ flow: 'asc' }, { category: 'asc' }, { subCategory: 'asc' }],
    });

    return categories.map(category => ({
      id: category.id,
      flow: category.flow,
      category: category.category,
      subCategory: category.subCategory,
      createdAt: category.createdAt.toISOString(),
    }));
  }

  private async getMonthlyStatistics(whereClause: any) {
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      select: {
        date: true,
        incomes: true,
        outgoings: true,
      },
    });

    const monthlyStats = new Map<string, { income: number; expenses: number; count: number }>();

    transactions.forEach(transaction => {
      const monthKey = transaction.date.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyStats.has(monthKey)) {
        monthlyStats.set(monthKey, { income: 0, expenses: 0, count: 0 });
      }
      const stats = monthlyStats.get(monthKey)!;
      stats.income += transaction.incomes || 0;
      stats.expenses += transaction.outgoings || 0;
      stats.count += 1;
    });

    return Array.from(monthlyStats.entries()).map(([month, stats]) => ({
      month,
      totalIncome: stats.income,
      totalExpenses: stats.expenses,
      netFlow: stats.income - stats.expenses,
      transactionCount: stats.count,
    }));
  }

  private async getCategoryStatistics(whereClause: any) {
    const stats = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: whereClause,
      _sum: {
        incomes: true,
        outgoings: true,
      },
      _count: true,
    });

    const categoryDetails = await prisma.category.findMany({
      where: {
        id: { in: stats.map(s => s.categoryId).filter(Boolean) },
      },
    });

    const categoryMap = new Map(categoryDetails.map(c => [c.id, c]));

    return stats.map(stat => {
      const category = categoryMap.get(stat.categoryId);
      return {
        categoryId: stat.categoryId,
        category: category?.category || 'Unknown',
        subCategory: category?.subCategory || 'Unknown',
        flow: category?.flow || 'Unknown',
        totalAmount: (stat._sum.incomes || 0) + (stat._sum.outgoings || 0),
        incomes: stat._sum.incomes || 0,
        outgoings: stat._sum.outgoings || 0,
        transactionCount: stat._count,
      };
    });
  }

  private getMockBudget(category: string): number {
    // Mock budget amounts - in real implementation, these would come from user settings
    const budgets: Record<string, number> = {
      'Alimentação': 800,
      'Transportes': 400,
      'Casa': 600,
      'Entretenimento': 200,
      'Saúde': 300,
      'Compras Gerais': 500,
    };
    return budgets[category] || 400;
  }

  private generateFilename(options: ExportOptions): string {
    const timestamp = new Date().toISOString().substring(0, 19).replace(/[:-]/g, '');
    const extension = options.format === 'excel' ? 'xlsx' : options.format;
    return `finance_${options.type}_${timestamp}.${extension}`;
  }

  private async exportToCsv(data: any, filename: string): Promise<string> {
    let csvData: any[];
    
    if (Array.isArray(data)) {
      csvData = data;
    } else if (data.summary && data.categoryBreakdown) {
      // Analytics data - flatten for CSV
      csvData = [
        { type: 'Summary', ...data.summary },
        ...data.monthlyBreakdown.map((item: any) => ({ type: 'Monthly', ...item })),
        ...data.categoryBreakdown.map((item: any) => ({ type: 'Category', ...item })),
      ];
    } else {
      csvData = Array.isArray(data) ? data : [data];
    }

    const csv = Papa.unparse(csvData);
    
    // In a real implementation, this would save to a file server or cloud storage
    // For now, we'll return a data URL that can be downloaded
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    return URL.createObjectURL(blob);
  }

  private async exportToExcel(data: any, filename: string, options: ExportOptions): Promise<string> {
    const workbook = XLSX.utils.book_new();

    if (Array.isArray(data)) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, options.type);
    } else if (data.summary && data.categoryBreakdown) {
      // Analytics data - create multiple sheets
      const summarySheet = XLSX.utils.json_to_sheet([data.summary]);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      if (data.monthlyBreakdown.length > 0) {
        const monthlySheet = XLSX.utils.json_to_sheet(data.monthlyBreakdown);
        XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly');
      }

      if (data.categoryBreakdown.length > 0) {
        const categorySheet = XLSX.utils.json_to_sheet(data.categoryBreakdown);
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'Categories');
      }
    } else {
      const worksheet = XLSX.utils.json_to_sheet([data]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    }

    // Generate buffer and create blob
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    return URL.createObjectURL(blob);
  }

  private async exportToPdf(data: any, filename: string, options: ExportOptions): Promise<string> {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`Financial ${options.type.charAt(0).toUpperCase() + options.type.slice(1)} Report`, 20, 20);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    
    let yPosition = 50;

    if (Array.isArray(data)) {
      // Table data
      const headers = Object.keys(data[0] || {});
      const rows = data.map(item => headers.map(header => String(item[header] || '')));
      
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
      });
    } else if (data.summary && data.categoryBreakdown) {
      // Analytics data
      doc.setFontSize(14);
      doc.text('Summary', 20, yPosition);
      yPosition += 15;
      
      // Summary table
      const summaryData = Object.entries(data.summary).map(([key, value]) => [
        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        String(value)
      ]);
      
      autoTable(doc, {
        body: summaryData,
        startY: yPosition,
        styles: { fontSize: 10 },
        columnStyles: { 0: { fontStyle: 'bold' } },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
      
      // Category breakdown
      if (data.categoryBreakdown.length > 0) {
        doc.text('Category Breakdown', 20, yPosition);
        yPosition += 10;
        
        const categoryHeaders = Object.keys(data.categoryBreakdown[0]);
        const categoryRows = data.categoryBreakdown.map((item: any) => 
          categoryHeaders.map(header => String(item[header] || ''))
        );
        
        autoTable(doc, {
          head: [categoryHeaders],
          body: categoryRows,
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [52, 152, 219] },
        });
      }
    }

    // Generate PDF blob
    const pdfBlob = doc.output('blob');
    return URL.createObjectURL(pdfBlob);
  }
}

export const exportService = ExportService.getInstance();