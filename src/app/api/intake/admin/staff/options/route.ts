import { NextRequest } from 'next/server';
import { handleApiError, successResponse } from '@/lib/api-response';
import { requireIntakeAdminAccess } from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongodb';
import StaffUser from '@/models/StaffUser';

export async function GET(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminAccess(request, [
      'admin',
      'editor',
    ]);

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();

    const staffUsers = await StaffUser.find({ isActive: true })
      .select('_id name role isActive')
      .sort({ name: 1, email: 1 })
      .exec();

    return successResponse(
      staffUsers,
      'Assignable staff users retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
