import { NextRequest, NextResponse } from 'next/server';
import { BulkUploadService, TemplateType } from '@/lib/services/bulk-upload-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const type = params.type as TemplateType;
    
    // Validate template type
    const validTypes: TemplateType[] = ['transactions', 'categories', 'origins', 'banks'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid template type. Valid types: ${validTypes.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Generate template
    const templateBuffer = BulkUploadService.generateTemplate(type);
    const filename = BulkUploadService.getTemplateFilename(type);

    // Return Excel file
    return new NextResponse(templateBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': templateBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate template' 
      },
      { status: 500 }
    );
  }
}