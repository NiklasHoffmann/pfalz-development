import { NextRequest } from 'next/server';
import {
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { requireIntakeAdminAccess } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminAccess(request);

    if ('status' in authState) {
      return authState;
    }

    return successResponse(
      { staffUser: authState.staffUser },
      'Session retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
