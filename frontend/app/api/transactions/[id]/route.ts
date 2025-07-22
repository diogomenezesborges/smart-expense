import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { UpdateTransactionSchema, validateRequest } from '@/lib/validations';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/transactions/[id] - Get single transaction by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        origin: true,
        bank: true,
        category: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}

// PUT /api/transactions/[id] - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json();
    const validatedData = validateRequest(
      { id: params.id, ...body }, 
      UpdateTransactionSchema
    );

    // Remove ID from update data
    const { id, ...updateData } = validatedData;

    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update month/year if date is changed
    if (updateData.date) {
      const date = new Date(updateData.date);
      const monthNames = [
        'JANEIRO', 'FEVEREIRO', 'MARCO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
      ];
      
      updateData.month = monthNames[date.getMonth()] as any;
      updateData.year = date.getFullYear();
    }

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: updateData,
      include: {
        origin: true,
        bank: true,
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Transaction updated successfully',
    });

  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    await prisma.transaction.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}