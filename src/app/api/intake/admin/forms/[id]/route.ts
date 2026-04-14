import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { requireIntakeAdminAccess } from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongodb';
import IntakeForm from '@/models/IntakeForm';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminAccess(request, ['admin']);

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const form = await IntakeForm.findById(id).select('-__v').exec();

    if (!form) {
      return errorResponse('Intake form not found', 404);
    }

    return successResponse(form, 'Intake form retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
