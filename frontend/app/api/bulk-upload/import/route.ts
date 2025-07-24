import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { BulkUploadService, TemplateType } from '@/lib/services/bulk-upload-service';
import { logApiRequest, logError, logInfo } from '@/lib/utils/logger';
import { TransactionFlow, MajorCategory } from '@prisma/client';

interface ImportJob {
  id: string;
  filename: string;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorReport?: any[];
  createdAt: Date;
  completedAt?: Date;
}

// In-memory job storage (in production, use Redis or database)
const importJobs = new Map<string, ImportJob>();

export async function POST(request: NextRequest) {
  try {
    logApiRequest('POST /api/bulk-upload/import');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as TemplateType;

    if (!file || !type) {
      return NextResponse.json(
        { success: false, error: 'File and type are required' },
        { status: 400 }
      );
    }

    // Create import job
    const jobId = generateJobId();
    const job: ImportJob = {
      id: jobId,
      filename: file.name,
      totalRecords: 0,
      processedRecords: 0,
      failedRecords: 0,
      status: 'pending',
      createdAt: new Date()
    };

    importJobs.set(jobId, job);

    // Start processing asynchronously
    processImport(jobId, file, type).catch(error => {
      logError(`Import job ${jobId} failed`, error);
      const failedJob = importJobs.get(jobId);
      if (failedJob) {
        failedJob.status = 'failed';
        failedJob.completedAt = new Date();
        importJobs.set(jobId, failedJob);
      }
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Import job started. Use the job ID to check progress.'
    });

  } catch (error) {
    logError('Bulk import error', error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to start import job' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const job = importJobs.get(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        filename: job.filename,
        totalRecords: job.totalRecords,
        processedRecords: job.processedRecords,
        failedRecords: job.failedRecords,
        status: job.status,
        progress: job.totalRecords > 0 ? (job.processedRecords / job.totalRecords) * 100 : 0,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        errorReport: job.errorReport
      }
    });

  } catch (error) {
    logError('Job status check error', error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to get job status' },
      { status: 500 }
    );
  }
}

async function processImport(jobId: string, file: File, type: TemplateType) {
  const job = importJobs.get(jobId);
  if (!job) return;

  try {
    job.status = 'processing';
    importJobs.set(jobId, job);

    // Parse and validate file
    const validationResult = await BulkUploadService.parseAndValidate(file, type);
    
    if (!validationResult.isValid) {
      job.status = 'failed';
      job.errorReport = validationResult.errors;
      job.completedAt = new Date();
      importJobs.set(jobId, job);
      return;
    }

    job.totalRecords = validationResult.data.length;
    importJobs.set(jobId, job);

    // Process data based on type
    switch (type) {
      case 'origins':
        await processOrigins(jobId, validationResult.data);
        break;
      case 'banks':
        await processBanks(jobId, validationResult.data);
        break;
      case 'categories':
        await processCategories(jobId, validationResult.data);
        break;
      case 'transactions':
        await processTransactions(jobId, validationResult.data);
        break;
    }

    // Mark job as completed
    const completedJob = importJobs.get(jobId);
    if (completedJob) {
      completedJob.status = 'completed';
      completedJob.completedAt = new Date();
      importJobs.set(jobId, completedJob);
    }

    logInfo(`Import job ${jobId} completed successfully`);

  } catch (error) {
    logError(`Import job ${jobId} processing error`, error as Error);
    const failedJob = importJobs.get(jobId);
    if (failedJob) {
      failedJob.status = 'failed';
      failedJob.completedAt = new Date();
      importJobs.set(jobId, failedJob);
    }
  }
}

async function processOrigins(jobId: string, data: any[]) {
  const job = importJobs.get(jobId);
  if (!job) return;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    try {
      await prisma.origin.upsert({
        where: { name: row.Name },
        update: {},
        create: { name: row.Name }
      });

      job.processedRecords++;
      importJobs.set(jobId, job);

    } catch (error) {
      job.failedRecords++;
      importJobs.set(jobId, job);
      logError(`Failed to import origin: ${row.Name}`, error as Error);
    }
  }
}

async function processBanks(jobId: string, data: any[]) {
  const job = importJobs.get(jobId);
  if (!job) return;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    try {
      await prisma.bank.upsert({
        where: { name: row.Name },
        update: {},
        create: { name: row.Name }
      });

      job.processedRecords++;
      importJobs.set(jobId, job);

    } catch (error) {
      job.failedRecords++;
      importJobs.set(jobId, job);
      logError(`Failed to import bank: ${row.Name}`, error as Error);
    }
  }
}

async function processCategories(jobId: string, data: any[]) {
  const job = importJobs.get(jobId);
  if (!job) return;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    try {
      await prisma.category.upsert({
        where: {
          flow_majorCategory_category_subCategory: {
            flow: row.Flow as TransactionFlow,
            majorCategory: row['Major Category'] as MajorCategory,
            category: row.Category,
            subCategory: row['Sub Category']
          }
        },
        update: {},
        create: {
          flow: row.Flow as TransactionFlow,
          majorCategory: row['Major Category'] as MajorCategory,
          category: row.Category,
          subCategory: row['Sub Category']
        }
      });

      job.processedRecords++;
      importJobs.set(jobId, job);

    } catch (error) {
      job.failedRecords++;
      importJobs.set(jobId, job);
      logError(`Failed to import category: ${row.Category}`, error as Error);
    }
  }
}

async function processTransactions(jobId: string, data: any[]) {
  const job = importJobs.get(jobId);
  if (!job) return;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    try {
      // Parse date
      const date = new Date(row.Date);
      const month = getMonthFromDate(date);

      // Find or create origin
      const origin = await prisma.origin.upsert({
        where: { name: row.Origin },
        update: {},
        create: { name: row.Origin }
      });

      // Find or create bank
      const bank = await prisma.bank.upsert({
        where: { name: row.Bank },
        update: {},
        create: { name: row.Bank }
      });

      // Find or create category
      const category = await prisma.category.upsert({
        where: {
          flow_majorCategory_category_subCategory: {
            flow: row.Flow as TransactionFlow,
            majorCategory: row['Major Category'] as MajorCategory,
            category: row.Category,
            subCategory: row['Sub Category']
          }
        },
        update: {},
        create: {
          flow: row.Flow as TransactionFlow,
          majorCategory: row['Major Category'] as MajorCategory,
          category: row.Category,
          subCategory: row['Sub Category']
        }
      });

      // Create transaction
      await prisma.transaction.create({
        data: {
          date,
          originId: origin.id,
          bankId: bank.id,
          flow: row.Flow as TransactionFlow,
          categoryId: category.id,
          description: row.Description,
          incomes: row.Flow === 'ENTRADA' ? parseFloat(row['Income Amount']) : null,
          outgoings: row.Flow === 'SAIDA' ? parseFloat(row['Outgoing Amount']) : null,
          notes: row.Notes || null,
          month,
          year: date.getFullYear(),
          isAiGenerated: false,
          isValidated: true
        }
      });

      job.processedRecords++;
      importJobs.set(jobId, job);

    } catch (error) {
      job.failedRecords++;
      importJobs.set(jobId, job);
      logError(`Failed to import transaction: ${row.Description}`, error as Error);
    }
  }
}

function generateJobId(): string {
  return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getMonthFromDate(date: Date): any {
  const months = [
    'JANEIRO', 'FEVEREIRO', 'MARCO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];
  return months[date.getMonth()];
}