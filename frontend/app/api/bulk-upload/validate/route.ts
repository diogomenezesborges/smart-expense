import { NextRequest, NextResponse } from 'next/server';
import { BulkUploadService, TemplateType } from '@/lib/services/bulk-upload-service';
import { logApiRequest, logError } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    logApiRequest('POST /api/bulk-upload/validate');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as TemplateType;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Template type is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Please upload Excel (.xlsx) or CSV files only.' 
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File size exceeds 10MB limit' 
        },
        { status: 400 }
      );
    }

    // Parse and validate file content
    const validationResult = await BulkUploadService.parseAndValidate(file, type);

    if (!validationResult.isValid) {
      // Generate error report
      const errorReportBuffer = BulkUploadService.generateErrorReport(
        validationResult.errors,
        file.name
      );
      const errorReportFilename = BulkUploadService.getErrorReportFilename(file.name);

      return NextResponse.json({
        success: false,
        isValid: false,
        totalRecords: validationResult.data.length,
        errorCount: validationResult.errors.length,
        errors: validationResult.errors.slice(0, 10), // Return first 10 errors for preview
        hasMoreErrors: validationResult.errors.length > 10,
        errorReport: {
          filename: errorReportFilename,
          buffer: Array.from(errorReportBuffer) // Convert to array for JSON serialization
        }
      });
    }

    // Validation successful
    return NextResponse.json({
      success: true,
      isValid: true,
      totalRecords: validationResult.data.length,
      errorCount: 0,
      preview: validationResult.data.slice(0, 5), // Return first 5 records for preview
      message: `File validation successful. ${validationResult.data.length} records ready for import.`
    });

  } catch (error) {
    logError('Bulk upload validation error', error as Error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to validate file. Please check the file format and try again.' 
      },
      { status: 500 }
    );
  }
}