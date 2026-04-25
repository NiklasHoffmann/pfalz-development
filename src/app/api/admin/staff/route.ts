import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import {
  requireIntakeAdminAccess,
  requireIntakeAdminMutationAccess,
} from '@/lib/api-auth';
import { hashPassword } from '@/lib/auth/password';
import connectToDatabase from '@/lib/mongodb';
import StaffUser from '@/models/StaffUser';
import { createStaffUserSchema } from '@/schemas/intake/staff-auth.schema';

export async function GET(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminAccess(request, ['admin']);

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();

    const staffUsers = await StaffUser.find({})
      .select('-__v -passwordHash')
      .sort({ createdAt: -1 })
      .exec();

    return successResponse(staffUsers, 'Staff users retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin'],
      'intake-staff-create'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const body = createStaffUserSchema.parse(await request.json());

    const existingUser = await StaffUser.findOne({
      email: body.email.toLowerCase(),
    }).exec();

    if (existingUser) {
      return errorResponse('Staff user with this email already exists', 409);
    }

    const createdUser = await StaffUser.create({
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash: hashPassword(body.password),
      role: body.role,
      isActive: body.isActive,
    });

    await writeAdminAuditLog({
      request,
      authState,
      action: 'intake.staff.create',
      resourceType: 'staff-user',
      resourceId: String(createdUser.id ?? createdUser._id),
      required: true,
      metadata: {
        email: createdUser.email,
        role: createdUser.role,
        isActive: createdUser.isActive,
      },
    });

    return successResponse(createdUser, 'Staff user created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
