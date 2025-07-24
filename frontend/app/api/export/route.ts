import { NextRequest, NextResponse } from 'next/server';
import { exportService, ExportFormat, ExportType } from '@/lib/services/export-service';
import { z } from 'zod';

const exportRequestSchema = z.object({
  format: z.enum(['csv', 'excel', 'pdf']),
  type: z.enum(['transactions', 'analytics', 'budget', 'categories']),
  dateFrom: z.string().optional().transform(val => val ? new Date(val) : undefined),
  dateTo: z.string().optional().transform(val => val ? new Date(val) : undefined),
  categoryId: z.string().optional(),
  includeMetadata: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = exportRequestSchema.parse(body);

    const result = await exportService.exportData({
      format: validatedData.format,
      type: validatedData.type,
      dateFrom: validatedData.dateFrom,
      dateTo: validatedData.dateTo,
      categoryId: validatedData.categoryId,
      includeMetadata: validatedData.includeMetadata,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: result.downloadUrl,
        filename: result.filename,
        metadata: result.metadata,
      },
    });

  } catch (error) {
    console.error('Export API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request parameters',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  try {
    const queryData = {
      format: searchParams.get('format') || 'csv',
      type: searchParams.get('type') || 'transactions',
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      categoryId: searchParams.get('categoryId'),
      includeMetadata: searchParams.get('includeMetadata') === 'true',
    };

    const validatedData = exportRequestSchema.parse(queryData);

    const result = await exportService.exportData({
      format: validatedData.format,
      type: validatedData.type,
      dateFrom: validatedData.dateFrom,
      dateTo: validatedData.dateTo,
      categoryId: validatedData.categoryId,
      includeMetadata: validatedData.includeMetadata,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: result.downloadUrl,
        filename: result.filename,
        metadata: result.metadata,
      },
    });

  } catch (error) {
    console.error('Export API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request parameters',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}