import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-response';
import { requireAdminApiKey } from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { updateUserSchema } from '@/schemas/user.schema';

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAdminApiKey(request);
    if (authError) {
      return authError;
    }

    await connectToDatabase();
    const { id } = await params;

    const user = await User.findById(id).select('-__v');

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user, 'User retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAdminApiKey(request);
    if (authError) {
      return authError;
    }

    await connectToDatabase();
    const { id } = await params;

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const user = await User.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    }).select('-__v');

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user, 'User updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/users/[id] - Delete user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAdminApiKey(request);
    if (authError) {
      return authError;
    }

    await connectToDatabase();
    const { id } = await params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-__v');

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user, 'User deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
